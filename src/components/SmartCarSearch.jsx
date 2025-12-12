import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { recognizeLicensePlate, findDuplicateCars, compareCarImages } from '../utils/plateRecognition';
import { Upload, Loader, CheckCircle, AlertCircle, Search, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SmartCarSearch = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [recognitionData, setRecognitionData] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء تحديد ملف صورة');
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewUrl(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDragDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (event) => setPreviewUrl(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const recognizeCarPlate = async () => {
        if (!previewUrl) {
            toast.error('الرجاء اختيار صورة أولاً');
            return;
        }

        setLoading(true);
        try {
            const plateResult = await recognizeLicensePlate(previewUrl);

            if (!plateResult.success) {
                toast.error('فشل التعرف على لوحة الترخيص');
                return;
            }

            setRecognitionData(plateResult);

            const { data: matchedCars, error } = await supabase
                .from('cars')
                .select('*')
                .or(
                    `license_plate.ilike.%${plateResult.plateNumber}%,license_plate.ilike.%${plateResult.fullPlate}%`
                )
                .limit(10);

            if (error) throw error;

            setResults({
                plateRecognition: plateResult,
                matchedCars: matchedCars || [],
                similarityScores: matchedCars?.map(car => ({
                    ...car,
                    matchScore: calculatePlateMatch(plateResult.fullPlate, car.license_plate)
                })) || []
            });

        } catch (err) {
            console.error('Recognition error:', err);
            toast.error('حدث خطأ: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculatePlateMatch = (plate1, plate2) => {
        if (!plate1 || !plate2) return 0;
        const str1 = plate1.replace(/[^0-9ء-ي]/g, '').toLowerCase();
        const str2 = plate2.replace(/[^0-9ء-ي]/g, '').toLowerCase();

        if (str1 === str2) return 100;

        let matches = 0;
        for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
            if (str1[i] === str2[i]) matches++;
        }

        return Math.round((matches / Math.max(str1.length, str2.length)) * 100);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('تم النسخ');
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'right' }}>🤖 البحث الذكي بالصور</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'right' }}>
                        حمّل صورة السيارة أو لوحة الترخيص، وسيقوم الذكاء الاصطناعي بالتعرف عليها تلقائياً
                    </p>

                    <div
                        onDrop={handleDragDrop}
                        onDragOver={(e) => e.preventDefault()}
                        style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '2rem',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            background: previewUrl ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />

                        {previewUrl ? (
                            <div>
                                <img
                                    src={previewUrl}
                                    alt="المعاينة"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '400px',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem'
                                    }}
                                />
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    اضغط لتغيير الصورة
                                </p>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()}>
                                <Upload size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ marginBottom: '0.5rem' }}>
                                    اسحب الصورة هنا أو اضغط للاختيار
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    PNG, JPG, أو WebP
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={recognizeCarPlate}
                        disabled={!previewUrl || loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: previewUrl && !loading ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: previewUrl && !loading ? 'pointer' : 'not-allowed',
                            opacity: previewUrl && !loading ? 1 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                جاري التحليل...
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                بحث ذكي
                            </>
                        )}
                    </button>
                </div>

                {recognitionData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={24} color="var(--status-success)" />
                            نتائج التعرف على لوحة الترخيص
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    رقم اللوحة
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                        {recognitionData.plateNumber || 'لم يتم التعرف'}
                                    </p>
                                    {recognitionData.plateNumber && (
                                        <button
                                            onClick={() => copyToClipboard(recognitionData.plateNumber)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                                        >
                                            <Copy size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    مستوى الثقة
                                </p>
                                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                    {Math.round((recognitionData.confidence || 0) * 100)}%
                                </p>
                            </div>
                        </div>

                        {recognitionData.fullPlate && (
                            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', direction: 'rtl', textAlign: 'right' }}>
                                <strong>اللوحة الكاملة:</strong> {recognitionData.fullPlate}
                            </div>
                        )}
                    </motion.div>
                )}

                {results && results.matchedCars.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                            🎯 السيارات المطابقة ({results.matchedCars.length})
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {results.similarityScores.sort((a, b) => b.matchScore - a.matchScore).map(car => (
                                <motion.div
                                    key={car.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass"
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-lg)',
                                        borderLeft: `4px solid ${car.matchScore >= 80 ? 'var(--status-success)' : 'var(--status-warning)'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginBottom: '0.5rem' }}>
                                                {car.year} {car.make} {car.model}
                                            </h4>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                📍 {car.license_plate}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {car.color}
                                            </p>
                                        </div>
                                        <div style={{
                                            padding: '0.75rem 1.5rem',
                                            background: car.matchScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            borderRadius: 'var(--radius-sm)',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                معدل التطابق
                                            </p>
                                            <p style={{
                                                fontSize: '1.5rem',
                                                fontWeight: '600',
                                                color: car.matchScore >= 80 ? 'var(--status-success)' : 'var(--status-warning)'
                                            }}>
                                                {car.matchScore}%
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {results && results.matchedCars.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                        <AlertCircle size={48} color="var(--status-warning)" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            لم يتم العثور على سيارات مطابقة
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SmartCarSearch;
