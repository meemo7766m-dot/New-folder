import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Calendar, ShieldCheck, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const [recentCars, setRecentCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentCars = async () => {
            try {
                const { data, error } = await supabase
                    .from('cars')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;
                setRecentCars(data || []);
            } catch (error) {
                console.error('Error fetching cars:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentCars();
    }, []);

    const translateStatus = (status) => {
        const map = {
            'missing': 'مفقودة',
            'stolen': 'مسروقة',
            'found': 'تم العثور عليها'
        };
        return map[status] || status;
    };

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                padding: '8rem 0',
                background: 'radial-gradient(circle at center, #0f172a 0%, #02040a 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '400px', height: '400px', background: 'var(--status-success)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-1px'
                        }}>
                            <span className="text-gradient">أقوى منصة ذكية</span> <br />
                            للبحث عن المفقودات بالسودان
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.25rem',
                            maxWidth: '650px',
                            margin: '0 auto 2.5rem',
                            lineHeight: '1.8'
                        }}
                    >
                        باستخدام تقنيات الذكاء الاصطناعي والخرائط التفاعلية، نساعدك في الإبلاغ عن المركبات المفقودة واستعادتها بسرعة وأمان.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex-center"
                        style={{ gap: '1rem', flexWrap: 'wrap' }}
                    >
                        <Link to="/search" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            <Search size={22} style={{ marginLeft: '0.5rem' }} /> البحث في السجلات
                        </Link>
                        <Link to="/admin" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            <ShieldCheck size={22} style={{ marginLeft: '0.5rem' }} /> إبلاغ عن حالة
                        </Link>
                    </motion.div>

                    {/* Stats or Trust Badges (Animated) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        style={{ marginTop: '4rem', display: 'flex', gap: '3rem', justifyContent: 'center', opacity: 0.7 }}
                    >
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>+500</h3>
                            <span style={{ fontSize: '0.9rem' }}>بلاغ نشط</span>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>+120</h3>
                            <span style={{ fontSize: '0.9rem' }}>تم العثور عليها</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured / Recent Section */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div className="flex-between" style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem' }}>أحدث البلاغات</h2>
                        <Link to="/search" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>عرض الكل</Link>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '2rem',
                        textAlign: 'right'
                    }}>
                        {loading ? (
                            <p style={{ color: 'var(--text-secondary)' }}>جاري تحميل البلاغات...</p>
                        ) : recentCars.length > 0 ? (
                            recentCars.map((car) => (
                                <div
                                    key={car.id}
                                    className="glass"
                                    style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
                                    onClick={() => navigate(`/car/${car.id}`)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ height: '200px', background: '#2a2d35', position: 'relative' }}>
                                        {car.image_url ? (
                                            <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>لا توجد صورة</div>
                                        )}
                                        <span style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                            background: car.status === 'found' ? 'var(--status-success)' : car.status === 'missing' ? 'var(--status-error)' : 'var(--accent-secondary)',
                                            color: '#fff'
                                        }}>
                                            {translateStatus(car.status)}
                                        </span>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '0.2rem' }}>{car.year} {car.make} {car.model}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>س.م {car.plate_number}</p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={16} color="var(--accent-primary)" />
                                                <span>{car.last_seen_location || 'الموقع غير معروف'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={16} color="var(--accent-primary)" />
                                                <span>{car.last_seen_date || 'التاريخ غير معروف'}</span>
                                            </div>
                                            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                                                عرض التفاصيل الكاملة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1', textAlign: 'center' }}>
                                <p>لا توجد بلاغات مسجلة حتى الآن.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
