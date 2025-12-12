import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Search, X, ChevronLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';
import { searchCarsByImage, rateMatch } from '../utils/visualRecognitionService';

const VisualSearch = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);

    const getUserEmail = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user?.email || null;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('الرجاء اختيار ملف صورة');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('حجم الصورة يجب أن لا يتجاوز 5 MB');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('يرجى اختيار صورة');
            return;
        }

        setLoading(true);

        try {
            const email = await getUserEmail();

            const results = await searchCarsByImage(selectedFile, email);

            if (results.matches.length === 0) {
                toast.info('لم يتم العثور على سيارات مطابقة');
                setSearchResults({
                    imageId: results.imageId,
                    matches: [],
                    totalMatches: 0
                });
            } else {
                toast.success(`تم العثور على ${results.totalMatches} سيارات مطابقة!`);
                setSearchResults(results);
            }
        } catch (err) {
            console.error('Error searching:', err);
            toast.error('خطأ في البحث');
        } finally {
            setLoading(false);
        }
    };

    const handleRateMatch = async (matchId, feedback) => {
        try {
            const success = await rateMatch(matchId, feedback);
            if (success) {
                toast.success('شكراً لتقييمك');
            }
        } catch (err) {
            console.error('Error rating match:', err);
            toast.error('خطأ في التقييم');
        }
    };

    const handleSelectCar = (car) => {
        navigate(`/car/${car.id}`);
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                <ChevronLeft size={20} /> عودة
            </button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>البحث البصري عن السيارات 📸</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    ارفع صورة لسيارة واترك الذكاء الاصطناعي يبحث عن سيارات مشابهة
                </p>
            </motion.div>

            {!searchResults ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass"
                    style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}
                >
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '3rem',
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: previewUrl ? 'transparent' : 'rgba(255,255,255,0.02)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = previewUrl ? 'transparent' : 'rgba(255,255,255,0.02)';
                            }}
                        >
                            {previewUrl ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={previewUrl}
                                        alt="preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '400px',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.6)',
                                            border: 'none',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        اضغط لاختيار صورة أخرى
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
                                    <h3 style={{ marginBottom: '0.5rem' }}>اسحب الصورة هنا</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        أو اضغط لاختيار صورة من جهازك
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        JPG, PNG - الحد الأقصى 5 MB
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {selectedFile && (
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                <Search size={20} />
                                {loading ? 'جاري البحث...' : 'ابحث عن سيارات مشابهة'}
                            </button>
                        )}
                    </form>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid var(--accent-primary)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> نصيحة
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            لأفضل النتائج، ارفع صورة واضحة لسيارة كاملة من الجانب أو من الأمام
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>الصورة المرفوعة</h3>
                            <img
                                src={previewUrl}
                                alt="uploaded"
                                style={{
                                    width: '100%',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1rem'
                                }}
                            />
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    setSearchResults(null);
                                    fileInputRef.current?.click();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--accent-secondary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ابحث عن صورة أخرى
                            </button>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>نتائج البحث</h3>
                            {searchResults.totalMatches === 0 ? (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p>لم يتم العثور على سيارات مطابقة</p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                        تم العثور على {searchResults.totalMatches} نتيجة
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {searchResults.matches.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>السيارات المطابقة</h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {searchResults.matches.map((match, idx) => (
                                    <motion.div
                                        key={match.matched_car_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass"
                                        style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}
                                    >
                                        {match.car?.image_url && (
                                            <img
                                                src={match.car.image_url}
                                                alt={match.car.make}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginBottom: '1rem'
                                                }}
                                            />
                                        )}

                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {match.car?.year} {match.car?.make} {match.car?.model}
                                            </h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                اللوحة: {match.car?.plate_number}
                                            </p>

                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${match.similarity_score}%`,
                                                            background: match.similarity_score >= 90 ? 'var(--status-success)' : match.similarity_score >= 75 ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                                                            borderRadius: '4px'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', minWidth: '45px' }}>
                                                        {match.similarity_score.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {match.match_type === 'exact' ? 'مطابقة دقيقة 🎯' : match.match_type === 'very_similar' ? 'مشابهة جداً ✓' : 'مشابهة'}
                                                </p>
                                            </div>
                                        </div>

                                        {match.car?.status && (
                                            <p style={{
                                                padding: '0.5rem',
                                                background: match.car.status === 'found' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: match.car.status === 'found' ? 'var(--status-success)' : 'var(--status-error)',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                marginBottom: '1rem',
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                {match.car.status === 'found' ? 'تم العثور عليها' : match.car.status === 'missing' ? 'مفقودة' : 'مشبوهة/مسروقة'}
                                            </p>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <button
                                                onClick={() => handleRateMatch(match.id, 'correct')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: 'rgba(16, 185, 129, 0.2)',
                                                    color: 'var(--status-success)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ✓ دقيق
                                            </button>
                                            <button
                                                onClick={() => handleRateMatch(match.id, 'incorrect')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: 'var(--status-error)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ✗ غير صحيح
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleSelectCar(match.car)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'var(--accent-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            عرض التفاصيل
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default VisualSearch;
