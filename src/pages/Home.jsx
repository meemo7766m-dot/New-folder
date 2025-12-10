import { Link } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Home = () => {
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
                background: 'radial-gradient(circle at center, #1a1d23 0%, #090a0b 100%)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem'
                    }}>
                        ابحث عن <span className="text-gradient">السيارات المفقودة</span> <br />
                        في السودان
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem'
                    }}>
                        منصة مركزية للإبلاغ عن المركبات المفقودة وتتبعها واستعادتها في جميع أنحاء البلاد.
                    </p>

                    <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/search" className="btn btn-primary">
                            <Search size={20} style={{ marginLeft: '0.5rem' }} /> البحث في السجلات
                        </Link>
                    </div>
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
                                <div key={car.id} className="glass" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: '200px', background: '#2a2d35', position: 'relative' }}>
                                        {car.image_url ? (
                                            <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>لا توجد صورة</div>
                                        )}
                                        <span style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                                            padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem'
                                        }}>
                                            {translateStatus(car.status)}
                                        </span>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{car.year} {car.make} {car.model}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                <MapPin size={16} color="var(--accent-primary)" />
                                                <span>{car.last_seen_location || 'الموقع غير معروف'}</span>
                                            </div>
                                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                <Calendar size={16} color="var(--accent-primary)" />
                                                <span>{car.last_seen_date || 'التاريخ غير معروف'}</span>
                                            </div>
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
