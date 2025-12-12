import { useState, useRef } from 'react';
import { Upload, Search, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { searchCarsByImage } from '../utils/imageSearchService';

const ImageSearch = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState(null);
    const [makeFilter, setMakeFilter] = useState('');
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('يجب اختيار صورة');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target.result);
            setResults(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSearch = async () => {
        if (!selectedImage) {
            toast.error('اختر صورة أولاً');
            return;
        }

        setSearching(true);
        try {
            const searchResults = await searchCarsByImage(selectedImage, makeFilter);
            setResults(searchResults);

            if (searchResults.resultCount === 0) {
                toast('لم يتم العثور على سيارات مطابقة', { icon: '🔍' });
            } else {
                toast.success(`وجدنا ${searchResults.resultCount} سيارة مطابقة!`);
            }
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ في البحث');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(96,165,250,0.1) 100%)',
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '2rem'
                }}
            >
                <h1 style={{ marginBottom: '0.5rem' }}>🔍 البحث بالصور</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    حمّل صورة سيارة وابحث عن سيارات مشابهة بناءً على الألوان والماركة
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem'
                }}>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--accent-primary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: selectedImage ? 'transparent' : 'rgba(251,191,36,0.05)',
                                aspectRatio: '4/3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!selectedImage) {
                                    e.currentTarget.style.background = 'rgba(251,191,36,0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!selectedImage) {
                                    e.currentTarget.style.background = 'rgba(251,191,36,0.05)';
                                }
                            }}
                        >
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                />
                            ) : (
                                <>
                                    <Upload size={48} color="var(--accent-primary)" />
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>اضغط أو اسحب الصورة هنا</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            JPG, PNG أو GIF
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {selectedImage && (
                            <button
                                onClick={() => setSelectedImage(null)}
                                style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    background: 'rgba(255,59,48,0.1)',
                                    color: '#FF3B30',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}
                            >
                                ❌ حذف الصورة
                            </button>
                        )}
                    </div>

                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                اختياري: فلتر حسب الماركة
                            </label>
                            <input
                                type="text"
                                value={makeFilter}
                                onChange={(e) => setMakeFilter(e.target.value)}
                                placeholder="مثال: Toyota, BMW, Mercedes"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                                disabled={!selectedImage || searching}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={!selectedImage || searching}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: selectedImage && !searching ? 'var(--accent-primary)' : 'rgba(251,191,36,0.3)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: selectedImage && !searching ? 'pointer' : 'not-allowed',
                                fontSize: '1rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {searching ? (
                                <>
                                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    جاري البحث...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    ابدأ البحث
                                </>
                            )}
                        </button>

                        {results && results.colors && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    🎨 الألوان المكتشفة:
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {results.colors.dominantColors.map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(96,165,250,0.2)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {item.color} ({item.percentage}%)
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {results && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 style={{ marginBottom: '1.5rem' }}>
                        📋 النتائج ({results.resultCount})
                    </h2>

                    {results.resultCount === 0 ? (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <AlertCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-secondary)' }}>
                                لم يتم العثور على سيارات مطابقة للمعايير المحددة
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {results.matches.map(car => (
                                <motion.div
                                    key={car.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    {car.image_url && (
                                        <img
                                            src={car.image_url}
                                            alt={`${car.year} ${car.make} ${car.model}`}
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-md)',
                                                marginBottom: '1rem'
                                            }}
                                        />
                                    )}
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        {car.year} {car.make} {car.model}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        اللوحة: {car.plate_number || 'غير محدد'}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        آخر موقع: {car.last_seen_location || 'غير محدد'}
                                    </p>
                                    {car.colorMatch && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            background: 'rgba(96,165,250,0.1)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.85rem'
                                        }}>
                                            <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                                ✓ توافق الألوان: {(car.colorMatch.confidence * 100).toFixed(0)}%
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                {car.colorMatch.primaryColor}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ImageSearch;
