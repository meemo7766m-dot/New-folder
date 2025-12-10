import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Clock, MapPin, Calendar, FileText, Camera, Shield, MessageSquare, ChevronLeft, CreditCard } from 'lucide-react';
import SmartMatch from '../components/SmartMatch';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Text Marker Issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, photos, map, timeline, contribute

    useEffect(() => {
        const fetchCarDetails = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching car:', error);
                navigate('/search'); // Redirect if not found
            } else {
                setCar(data);
                fetchUpdates(data.id);
            }
            setLoading(false);
        };

        const fetchUpdates = async (carId) => {
            const { data } = await supabase
                .from('case_updates')
                .select('*')
                .eq('car_id', carId)
                .order('update_date', { ascending: false });
            setUpdates(data || []);
        };

        if (id) fetchCarDetails();
    }, [id, navigate]);

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}>جاري التحميل...</div>;
    if (!car) return null;

    const statusColor = car.status === 'found' ? 'var(--status-success)' : car.status === 'missing' ? 'var(--status-error)' : 'var(--accent-secondary)';
    const statusText = car.status === 'found' ? 'تم العثور عليه' : car.status === 'missing' ? 'مفقود' : 'مشتبه / مسروق';

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={20} /> عودة للنتائج
            </button>

            {/* Header / Hero */}
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ height: '300px', position: 'relative', background: '#222' }}>
                    {car.image_url ? (
                        <img src={car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>لا توجد صورة متوفرة</div>
                    )}
                    <div style={{
                        position: 'absolute', bottom: 0, right: 0, left: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        padding: '2rem'
                    }}>
                        <div className="container">
                            <span style={{ background: statusColor, color: '#fff', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>{statusText}</span>
                            <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{car.year} {car.make} {car.model}</h1>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc' }}>
                                <MapPin size={18} /> {car.last_seen_location || 'الموقع غير معروف'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Smart Match Section */}
            <SmartMatch car={car} />

            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
                {[
                    { id: 'overview', label: 'نظرة عامة', icon: FileText },
                    { id: 'photos', label: 'الصور والمستندات', icon: Camera },
                    { id: 'map', label: 'خريطة الموقع', icon: MapPin },
                    { id: 'timeline', label: 'سجل التحديثات', icon: Clock },
                    { id: 'contribute', label: 'أرسل معلومة', icon: MessageSquare },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '1rem 1.5rem',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '400px' }}>

                {activeTab === 'overview' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>بيانات المركبة</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <InfoItem label="الشركة المصنعة" value={car.make} />
                            <InfoItem label="الموديل" value={car.model} />
                            <InfoItem label="سنة الصنع" value={car.year} />
                            <InfoItem label="اللون" value={car.color} />
                            <InfoItem label="رقم اللوحة" value={car.plate_number} />
                            <InfoItem label="رقم الهيكل (VIN)" value={car.vin || 'غير متوفر'} />
                            <InfoItem label="تاريخ الاختفاء" value={car.last_seen_date || 'غير معروف'} />
                            <InfoItem label="حالة البلاغ" value={statusText} color={statusColor} />
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>تفاصيل إضافية</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {car.description || 'لا توجد تفاصيل إضافية.'}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'photos' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {car.image_url ? (
                            <div className="glass" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                                <img src={car.image_url} alt="" style={{ width: '100%', borderRadius: '4px' }} />
                                <p style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>الصورة الرئيسية</p>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>لا توجد صور إضافية.</p>
                        )}
                        {/* Future: Map through a car_images table if implemented */}
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="glass" style={{ height: '500px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <MapContainer
                            center={[car.last_seen_lat || 15.5007, car.last_seen_lng || 32.5599]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {(car.last_seen_lat || car.last_seen_location === 'Khartoum') && (
                                <Marker position={[car.last_seen_lat || 15.5007, car.last_seen_lng || 32.5599]}>
                                    <Popup>موقع الاختفاء التقريبي</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>سجل التحديثات</h2>
                        {updates.length > 0 ? (
                            <div style={{ position: 'relative', borderRight: '2px solid var(--border-color)', paddingRight: '2rem' }}>
                                {updates.map((update, idx) => (
                                    <div key={idx} style={{ marginBottom: '2rem', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', right: '-2.4rem', top: '0',
                                            width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)',
                                            border: '2px solid var(--bg-card)'
                                        }}></div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{update.update_date}</span>
                                        <h4 style={{ fontSize: '1.1rem', margin: '0.2rem 0' }}>{update.title}</h4>
                                        <p style={{ color: 'var(--text-secondary)' }}>{update.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>لم يتم إضافة أي تحديثات لهذه القضية بعد.</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تاريخ البلاغ: {new Date(car.created_at).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'contribute' && (
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Shield size={48} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
                            <h2>هل لديك معلومة؟</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>مساهمتك قد تساعد في استعادة هذه المركبة. هويتك ستبقى سرية تماماً.</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); alert('شكراً لمساهمتك! سيتم التحقق من المعلومة.'); }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>نوع المعلومة</label>
                                <select className="input-field" style={{ width: '100%' }}>
                                    <option>شاهدت المركبة في مكان ما</option>
                                    <option>لدي معلومات عن الشخص المشتبه به</option>
                                    <option>أخرى</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>التفاصيل</label>
                                <textarea className="input-field" rows="4" style={{ width: '100%' }} placeholder="اكتب كل ما تعرفه هنا..."></textarea>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>رقم للتواصل (اختياري)</label>
                                <input type="text" className="input-field" style={{ width: '100%' }} placeholder="سيتم التواصل معك للضرورة فقط" />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>إرسال المعلومة بسرية</button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .input-field {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    padding: 0.8rem;
                    border-radius: var(--radius-sm);
                }
            `}</style>
        </div>
    );
};

const InfoItem = ({ label, value, color }) => (
    <div>
        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</span>
        <strong style={{ fontSize: '1.1rem', color: color || 'var(--text-primary)' }}>{value}</strong>
    </div>
);

export default CarDetails;
