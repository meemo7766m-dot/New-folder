import { useState, useEffect } from 'react';
import { startVoiceSearch, searchByVoice, searchByFeatures, saveSearchHistory, getSearchHistory } from '../utils/advancedSearch';
import { Mic, Search, Clock, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AdvancedSearch = () => {
    const [searchMode, setSearchMode] = useState('voice');
    const [isListening, setIsListening] = useState(false);
    const [voiceInput, setVoiceInput] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [features, setFeatures] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        bodyType: ''
    });

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
                const historyResult = await getSearchHistory(session.user.email);
                if (historyResult.success) {
                    setSearchHistory(historyResult.history);
                }
            }
        };
        getUser();
    }, []);

    const handleVoiceSearch = async () => {
        try {
            setIsListening(true);
            const { success, error, recognition } = await startVoiceSearch(
                async (transcript) => {
                    setVoiceInput(transcript);
                    setIsListening(false);
                    
                    setLoading(true);
                    const searchResult = await searchByVoice(transcript);
                    setLoading(false);

                    if (searchResult.success) {
                        setResults(searchResult);
                        if (userEmail) {
                            await saveSearchHistory(userEmail, transcript, 'voice', searchResult.cars.length);
                        }
                    } else {
                        toast.error('فشل البحث: ' + searchResult.error);
                    }
                },
                (error) => {
                    setIsListening(false);
                    toast.error(error);
                }
            );

            if (!success) {
                setIsListening(false);
                toast.error(error);
            }
        } catch (err) {
            setIsListening(false);
            toast.error('خطأ في البحث الصوتي');
        }
    };

    const handleFeatureSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const searchResult = await searchByFeatures(features);
            setLoading(false);

            if (searchResult.success) {
                setResults({
                    cars: searchResult.cars,
                    extractedParams: features,
                    query: Object.values(features).filter(v => v).join(' + ')
                });
                
                if (userEmail) {
                    await saveSearchHistory(userEmail, JSON.stringify(features), 'features', searchResult.cars.length);
                }
            } else {
                toast.error('فشل البحث: ' + searchResult.error);
            }
        } catch (err) {
            toast.error('خطأ في البحث');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* اختيار وضع البحث */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setSearchMode('voice')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: searchMode === 'voice' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            color: searchMode === 'voice' ? 'white' : 'var(--text-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                        }}
                    >
                        <Mic size={20} />
                        بحث صوتي
                    </button>
                    <button
                        onClick={() => setSearchMode('features')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: searchMode === 'features' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            color: searchMode === 'features' ? 'white' : 'var(--text-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                        }}
                    >
                        <Search size={20} />
                        بحث متقدم
                    </button>
                </div>

                {/* البحث الصوتي */}
                {searchMode === 'voice' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'right' }}>🎤 البحث الصوتي</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'right' }}>
                            قل وصفاً للسيارة (مثلاً: "تويوتا كامري 2020 سوداء")
                        </p>

                        <button
                            onClick={handleVoiceSearch}
                            disabled={isListening || loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: isListening ? '#ef4444' : 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: isListening || loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: '600',
                                marginBottom: '1rem'
                            }}
                        >
                            {isListening ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    جاري الاستماع...
                                </>
                            ) : loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    جاري البحث...
                                </>
                            ) : (
                                <>
                                    <Mic size={20} />
                                    ابدأ البحث الصوتي
                                </>
                            )}
                        </button>

                        {voiceInput && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'right'
                            }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    ما تم سماعه:
                                </p>
                                <p style={{ fontSize: '1.1rem' }}>{voiceInput}</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* البحث المتقدم */}
                {searchMode === 'features' && (
                    <motion.form onSubmit={handleFeatureSearch} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'right' }}>🔍 بحث متقدم</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    الماركة
                                </label>
                                <input
                                    type="text"
                                    placeholder="تويوتا، نيسان..."
                                    value={features.make}
                                    onChange={(e) => setFeatures({ ...features, make: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    الموديل
                                </label>
                                <input
                                    type="text"
                                    placeholder="كامري، تيدا..."
                                    value={features.model}
                                    onChange={(e) => setFeatures({ ...features, model: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    السنة
                                </label>
                                <input
                                    type="number"
                                    placeholder="2020"
                                    value={features.year}
                                    onChange={(e) => setFeatures({ ...features, year: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    اللون
                                </label>
                                <input
                                    type="text"
                                    placeholder="أسود، أبيض..."
                                    value={features.color}
                                    onChange={(e) => setFeatures({ ...features, color: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    نوع الجسم
                                </label>
                                <input
                                    type="text"
                                    placeholder="سيدان، SUV..."
                                    value={features.bodyType}
                                    onChange={(e) => setFeatures({ ...features, bodyType: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    جاري البحث...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    بحث
                                </>
                            )}
                        </button>
                    </motion.form>
                )}

                {/* النتائج */}
                {results && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                            🎯 النتائج ({results.cars.length})
                        </h3>
                        {results.cars.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {results.cars.map(car => (
                                    <motion.div
                                        key={car.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass"
                                        style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}
                                    >
                                        <h4 style={{ marginBottom: '0.5rem' }}>
                                            {car.year} {car.make} {car.model}
                                        </h4>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            📍 {car.license_plate}
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            🎨 {car.color}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    لم يتم العثور على نتائج
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* السجل */}
                {searchHistory.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} />
                            السجل
                        </h3>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {searchHistory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setVoiceInput(item.search_query)}
                                    className="glass"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        textAlign: 'right',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                                        {item.search_query.substring(0, 50)}...
                                    </p>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {item.results_count} نتيجة
                                    </p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AdvancedSearch;
