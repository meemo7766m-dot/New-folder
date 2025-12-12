import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, AlertCircle, Loader, Upload, Mail } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const OwnershipVerification = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [licenseFile, setLicenseFile] = useState(null);
    const [ownershipFile, setOwnershipFile] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('id', carId)
                    .single();

                if (fetchError) throw fetchError;
                setCar(data);
                setEmail(data.owner_email || '');
            } catch (err) {
                setError('حدث خطأ في تحميل بيانات السيارة');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [carId]);

    const handleSendVerificationCode = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { error: insertError } = await supabase
                .from('ownership_verification')
                .insert({
                    car_id: carId,
                    owner_email: email,
                    verification_code: code,
                    code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    status: 'pending'
                });

            if (insertError) throw insertError;

            setMessage(`تم إرسال رمز التحقق إلى ${email}. يرجى التحقق من بريدك الإلكتروني.`);
            setStep('code');
            setVerificationCode('');
        } catch (err) {
            setError('فشل إرسال رمز التحقق: ' + err.message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const { data: verification, error: fetchError } = await supabase
                .from('ownership_verification')
                .select('*')
                .eq('car_id', carId)
                .eq('owner_email', email)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError) throw new Error('لم يتم العثور على طلب التحقق');

            if (verification.verification_code !== verificationCode) {
                setError('رمز التحقق غير صحيح');
                setSubmitting(false);
                return;
            }

            if (new Date(verification.code_expires_at) < new Date()) {
                setError('انتهت صلاحية رمز التحقق');
                setSubmitting(false);
                return;
            }

            setVerificationData(verification);
            setMessage('تم التحقق من الرمز بنجاح. يرجى تحميل المستندات.');
            setStep('documents');
            setSubmitting(false);
        } catch (err) {
            setError('خطأ في التحقق: ' + err.message);
            console.error(err);
            setSubmitting(false);
        }
    };

    const handleUploadDocuments = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            if (!licenseFile || !ownershipFile) {
                setError('يرجى تحميل كلا المستندات');
                setSubmitting(false);
                return;
            }

            const timestamp = Date.now();
            const licenseFileName = `license_${carId}_${timestamp}.jpg`;
            const ownershipFileName = `ownership_${carId}_${timestamp}.jpg`;

            const [licenseUpload, ownershipUpload] = await Promise.all([
                supabase.storage.from('car-images').upload(licenseFileName, licenseFile),
                supabase.storage.from('car-images').upload(ownershipFileName, ownershipFile)
            ]);

            if (licenseUpload.error || ownershipUpload.error) {
                throw new Error('فشل تحميل المستندات');
            }

            const { error: updateError } = await supabase
                .from('ownership_verification')
                .update({
                    license_document_url: licenseUpload.data.path,
                    ownership_document_url: ownershipUpload.data.path,
                    status: 'pending'
                })
                .eq('id', verificationData.id);

            if (updateError) throw updateError;

            setMessage('تم تحميل المستندات بنجاح. سيتم مراجعتها من قبل فريقنا قريباً.');
            setStep('success');
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError('خطأ في تحميل المستندات: ' + err.message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <Loader size={40} className="animate-spin" color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 0', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>التحقق من ملكية السيارة</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {car?.year} {car?.make} {car?.model} - {car?.plate_number}
                </p>

                {error && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--status-error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--status-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <CheckCircle size={20} />
                        {message}
                    </div>
                )}

                {step === 'email' && (
                    <motion.form onSubmit={handleSendVerificationCode}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                البريد الإلكتروني للمالك
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
                        >
                            <Mail size={18} style={{ marginLeft: '0.5rem' }} />
                            {submitting ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                        </button>
                    </motion.form>
                )}

                {step === 'code' && (
                    <motion.form onSubmit={handleVerifyCode}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                رمز التحقق (6 أحرف)
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.2em'
                                }}
                            />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                تحقق من بريدك الإلكتروني ({email})
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
                        >
                            {submitting ? 'جاري التحقق...' : 'التحقق من الرمز'}
                        </button>
                    </motion.form>
                )}

                {step === 'documents' && (
                    <motion.form onSubmit={handleUploadDocuments}>
                        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                صورة رخصة القيادة
                            </label>
                            <div
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setLicenseFile(e.dataTransfer.files[0]);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    type="file"
                                    id="license"
                                    accept="image/*"
                                    onChange={(e) => setLicenseFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="license" style={{ cursor: 'pointer' }}>
                                    <Upload size={32} style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }} />
                                    <p>{licenseFile?.name || 'اضغط أو اسحب الملف هنا'}</p>
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                صورة شهادة ملكية السيارة
                            </label>
                            <div
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setOwnershipFile(e.dataTransfer.files[0]);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    type="file"
                                    id="ownership"
                                    accept="image/*"
                                    onChange={(e) => setOwnershipFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="ownership" style={{ cursor: 'pointer' }}>
                                    <Upload size={32} style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }} />
                                    <p>{ownershipFile?.name || 'اضغط أو اسحب الملف هنا'}</p>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !licenseFile || !ownershipFile}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                opacity: submitting || !licenseFile || !ownershipFile ? 0.5 : 1
                            }}
                        >
                            {submitting ? 'جاري التحميل...' : 'إرسال المستندات'}
                        </button>
                    </motion.form>
                )}

                {step === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <CheckCircle size={64} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: 'var(--status-success)', marginBottom: '1rem' }}>تم بنجاح!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            سيتم التحقق من المستندات قريباً. سيتم إرسال تأكيد إلى بريدك الإلكتروني.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default OwnershipVerification;
