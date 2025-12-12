import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Clock, Loader, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerificationAdmin = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchVerifications();
    }, [filter]);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('ownership_verification')
                .select(`
                    *,
                    cars:car_id(id, year, make, model, license_plate)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setVerifications(data || []);
        } catch (err) {
            toast.error('خطأ في تحميل البيانات: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('ownership_verification')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`تم تحديث الحالة إلى: ${newStatus}`);
            fetchVerifications();
            setShowModal(false);
        } catch (err) {
            toast.error('خطأ في التحديث: ' + err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'pending': return '#f59e0b';
            case 'expired': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'verified': return '✅ موثق';
            case 'rejected': return '❌ مرفوض';
            case 'pending': return '⏳ قيد المراجعة';
            case 'expired': return '⏸️ منتهي الصلاحية';
            default: return status;
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'right' }}>إدارة تحقق الملكية 📋</h1>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                }}>
                    {['all', 'pending', 'verified', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: filter === status ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: filter === status ? '600' : '400',
                                transition: 'all 0.3s'
                            }}
                        >
                            {status === 'all' ? 'الكل' : status === 'pending' ? 'قيد المراجعة' : status === 'verified' ? 'موثق' : 'مرفوض'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex-center" style={{ minHeight: '60vh' }}>
                        <Loader size={40} className="animate-spin" color="var(--accent-primary)" />
                    </div>
                ) : verifications.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-secondary)'
                    }}>
                        لا توجد طلبات تحقق في هذه الفئة
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {verifications.map(verification => (
                            <motion.div
                                key={verification.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass"
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    borderLeft: `4px solid ${getStatusColor(verification.status)}`,
                                    transition: 'all 0.3s'
                                }}
                                onClick={() => {
                                    setSelectedVerification(verification);
                                    setShowModal(true);
                                }}
                            >
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem' }}>
                                        {verification.cars?.year} {verification.cars?.make} {verification.cars?.model}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        📍 {verification.cars?.license_plate}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <strong>البريد:</strong> {verification.owner_email}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <strong>التاريخ:</strong> {new Date(verification.created_at).toLocaleDateString('ar-SA')}
                                    </p>
                                </div>

                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    marginBottom: '1rem',
                                    color: getStatusColor(verification.status)
                                }}>
                                    {getStatusLabel(verification.status)}
                                </div>

                                <button
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVerification(verification);
                                        setShowModal(true);
                                    }}
                                >
                                    <Eye size={16} />
                                    عرض المستندات
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {showModal && selectedVerification && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass"
                            style={{
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: '2rem',
                                borderRadius: 'var(--radius-lg)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'var(--text-primary)',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>

                            <h2 style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                                {selectedVerification.cars?.year} {selectedVerification.cars?.make} {selectedVerification.cars?.model}
                            </h2>

                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    <strong>البريد الإلكتروني:</strong> {selectedVerification.owner_email}
                                </p>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    <strong>الحالة:</strong> <span style={{ color: getStatusColor(selectedVerification.status) }}>
                                        {getStatusLabel(selectedVerification.status)}
                                    </span>
                                </p>
                                <p style={{ marginBottom: '1rem' }}>
                                    <strong>تاريخ الإنشاء:</strong> {new Date(selectedVerification.created_at).toLocaleDateString('ar-SA')}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                {selectedVerification.license_document_url && (
                                    <div>
                                        <h3 style={{ marginBottom: '1rem', textAlign: 'right' }}>📄 رخصة القيادة</h3>
                                        <img
                                            src={selectedVerification.license_document_url}
                                            alt="رخصة القيادة"
                                            style={{
                                                width: '100%',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-color)',
                                                marginBottom: '0.75rem'
                                            }}
                                        />
                                        <a
                                            href={selectedVerification.license_document_url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: 'var(--accent-primary)',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Download size={16} />
                                            تحميل الصورة
                                        </a>
                                    </div>
                                )}

                                {selectedVerification.ownership_document_url && (
                                    <div>
                                        <h3 style={{ marginBottom: '1rem', textAlign: 'right' }}>📋 شهادة الملكية</h3>
                                        <img
                                            src={selectedVerification.ownership_document_url}
                                            alt="شهادة الملكية"
                                            style={{
                                                width: '100%',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-color)',
                                                marginBottom: '0.75rem'
                                            }}
                                        />
                                        <a
                                            href={selectedVerification.ownership_document_url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: 'var(--accent-primary)',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Download size={16} />
                                            تحميل الصورة
                                        </a>
                                    </div>
                                )}
                            </div>

                            {selectedVerification.status === 'pending' && (
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={() => updateStatus(selectedVerification.id, 'rejected')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <XCircle size={18} />
                                        رفض
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedVerification.id, 'verified')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        قبول
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerificationAdmin;
