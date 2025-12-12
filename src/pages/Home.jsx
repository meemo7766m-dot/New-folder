import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Calendar, ShieldCheck, FileText, ChevronDown, Heart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Home = () => {
    const navigate = useNavigate();
    const [recentCars, setRecentCars] = useState([]);
    const [stats, setStats] = useState({ total: 0, found: 0, missing: 0, users: 0 });
    const [loading, setLoading] = useState(true);
    const [expandedFaq, setExpandedFaq] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carsRes, visitsRes] = await Promise.all([
                    supabase.from('cars').select('*').order('created_at', { ascending: false }).limit(3),
                    supabase.from('site_visits').select('id', { count: 'exact' })
                ]);

                if (carsRes.data) setRecentCars(carsRes.data);
                
                const allCarsRes = await supabase.from('cars').select('*', { count: 'exact' });
                if (allCarsRes.data) {
                    setStats({
                        total: allCarsRes.count || 0,
                        found: allCarsRes.data.filter(c => c.status === 'found').length,
                        missing: allCarsRes.data.filter(c => c.status === 'missing').length,
                        users: visitsRes.count || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

            {/* Stats Section - Dynamic */}
            <section style={{ padding: '4rem 0', background: 'rgba(0,0,0,0.3)', marginY: '2rem' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '2rem'
                        }}
                    >
                        {[
                            { icon: TrendingUp, label: 'إجمالي البلاغات', value: stats.total, color: '#fbbf24' },
                            { icon: Heart, label: 'تم العثور عليها', value: stats.found, color: '#10b981' },
                            { icon: FileText, label: 'لا تزال مفقودة', value: stats.missing, color: '#ef4444' },
                            { icon: Users, label: 'عدد الزيارات', value: stats.users, color: '#3b82f6' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                className="glass"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}
                            >
                                <stat.icon size={32} color={stat.color} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.5rem' }}>
                                    +{stat.value}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Featured / Recent Section */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div className="flex-between" style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem' }}>أحدث البلاغات</h2>
                        <Link to="/search" style={{ color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>عرض الكل <ArrowRight size={18} /></Link>
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
                                <motion.div
                                    key={car.id}
                                    className="glass"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
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
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1', textAlign: 'center' }}>
                                <p>لا توجد بلاغات مسجلة حتى الآن.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section style={{ padding: '6rem 0', background: 'rgba(16, 185, 129, 0.05)' }}>
                <div className="container">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}
                    >
                        قصص نجاح <span className="text-gradient">مؤثرة</span>
                    </motion.h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {[
                            { title: 'استعادة تويوتا بريس', desc: 'تم العثور على السيارة المفقودة بعد 5 أيام من نشر البلاغ على المنصة', time: 'منذ شهر' },
                            { title: 'مرسيدس الفئة E', desc: 'بفضل البحث المتقدم على الخريطة، تمكن الشرطة من تحديد موقعها', time: 'منذ 3 أشهر' },
                            { title: 'هيونداي إلنترا', desc: 'المالك تمكن من التواصل مع شاهد عبر المنصة واستعادة السيارة', time: 'منذ 6 أشهر' }
                        ].map((story, idx) => (
                            <motion.div
                                key={idx}
                                className="glass"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                style={{ padding: '2rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--status-success)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>{story.title}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{story.time}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{story.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container" style={{ maxWidth: '700px' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}
                    >
                        أسئلة <span className="text-gradient">شائعة</span>
                    </motion.h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: 'كيف أبلغ عن سيارة مفقودة؟', a: 'انقر على "إبلاغ عن حالة" واملأ تفاصيل السيارة بدقة مع إضافة صورة واضحة إن أمكن.' },
                            { q: 'هل البحث على الخريطة الحرارية مدقق؟', a: 'نعم، الخريطة الحرارية تعرض مواقع آخر الرؤيات المسجلة للمركبات المفقودة بدقة.' },
                            { q: 'كيف أستقبل إشعارات عن تحديثات البلاغ؟', a: 'أدخل بريدك الإلكتروني عند الإبلاغ، وستتلقى تحديثات تلقائية عند تغيير الحالة.' },
                            { q: 'هل البيانات آمنة وسرية؟', a: 'نعم، نستخدم أعلى معايير الأمان والتشفير لحماية بيانات المستخدمين.' }
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                className="glass"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    style={{
                                        width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        borderBottom: expandedFaq === idx ? '1px solid var(--border-color)' : 'none'
                                    }}
                                >
                                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{faq.q}</h3>
                                    <ChevronDown
                                        size={20}
                                        color="var(--accent-primary)"
                                        style={{ transform: expandedFaq === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                                    />
                                </button>
                                {expandedFaq === idx && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="container">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2rem', marginBottom: '1.5rem' }}
                    >
                        هل فقدت سيارتك؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}
                    >
                        ابلغ الآن واستفد من شبكتنا الضخمة للعثور على مركبتك
                    </motion.p>
                    <Link to="/admin" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
                        <ShieldCheck size={24} /> إبلاغ الآن
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
