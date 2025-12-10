import { Search as SearchIcon, Filter, MapPin, Calendar, Layers, List as ListIcon, Map as MapIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

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

const Search = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [filters, setFilters] = useState({
        query: '',
        make: '',
        model: '',
        color: '',
        status: '',
        location: '',
        dateFrom: '',
        dateTo: ''
    });
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCars = async () => {
        setLoading(true);
        try {
            let query = supabase.from('cars').select('*');

            if (filters.make) query = query.ilike('make', `%${filters.make}%`);
            if (filters.model) query = query.ilike('model', `%${filters.model}%`);
            if (filters.color) query = query.ilike('color', `%${filters.color}%`);
            if (filters.status) query = query.eq('status', filters.status);
            if (filters.location) query = query.ilike('last_seen_location', `%${filters.location}%`);

            if (filters.dateFrom) query = query.gte('last_seen_date', filters.dateFrom);
            if (filters.dateTo) query = query.lte('last_seen_date', filters.dateTo);

            if (filters.query) {
                query = query.or(`model.ilike.%${filters.query}%,plate_number.ilike.%${filters.query}%,vin.ilike.%${filters.query}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setCars(data || []);
        } catch (error) {
            console.error('Error fetching cars:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            query: '',
            make: '',
            model: '',
            color: '',
            status: '',
            location: '',
            dateFrom: '',
            dateTo: ''
        });
        setTimeout(fetchCars, 0); // Trigger fetch after state update
    };

    return (
        <div className="container" style={{ padding: '3rem 0', minHeight: '80vh' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>البحث المتقدم</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>ابحث في قاعدة بيانات المركبات المفقودة باستخدام أدوات تصفية دقيقة.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <ListIcon size={16} /> قائمة
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`btn ${viewMode === 'map' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        <MapIcon size={16} /> خريطة
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>
                {/* Sidebar Filters */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', position: 'sticky', top: '2rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} /> تصفية النتائج
                        </h3>
                        <button onClick={clearFilters} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                            مسح الكل
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Search Query */}
                        <div className="form-group">
                            <label>بحث عام</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={filters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    placeholder="رقم اللوحة، الهيكل..."
                                />
                                <SearchIcon size={16} className="icon" />
                            </div>
                        </div>

                        {/* Make */}
                        <div className="form-group">
                            <label>الماركة</label>
                            <select value={filters.make} onChange={(e) => handleFilterChange('make', e.target.value)}>
                                <option value="">الكل</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Hyundai">Hyundai</option>
                                <option value="Kia">Kia</option>
                                <option value="Nissan">Nissan</option>
                                <option value="Honda">Honda</option>
                                <option value="Mitsubishi">Mitsubishi</option>
                            </select>
                        </div>

                        {/* Model */}
                        <div className="form-group">
                            <label>الموديل</label>
                            <input
                                type="text"
                                value={filters.model}
                                onChange={(e) => handleFilterChange('model', e.target.value)}
                                placeholder="مثال: كورولا"
                            />
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label>الحالة</label>
                            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                                <option value="">الكل</option>
                                <option value="missing">مفقود</option>
                                <option value="stolen">مسروق</option>
                                <option value="found">تم العثور عليه</option>
                            </select>
                        </div>

                        {/* Color */}
                        <div className="form-group">
                            <label>اللون</label>
                            <input
                                type="text"
                                value={filters.color}
                                onChange={(e) => handleFilterChange('color', e.target.value)}
                                placeholder="مثال: أبيض"
                            />
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label>المنطقة / الولاية</label>
                            <select value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}>
                                <option value="">الكل</option>
                                <option value="Khartoum">الخرطوم</option>
                                <option value="Omdurman">أم درمان</option>
                                <option value="Bahri">بحري</option>
                                <option value="Gezira">الجزيرة</option>
                                <option value="Red Sea">البحر الأحمر</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="form-group">
                            <label>تاريخ الاختفاء (من - إلى)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>

                        <button onClick={fetchCars} className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                            تطبيق
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div style={{ minHeight: '500px' }}>

                    {viewMode === 'list' ? (
                        /* LIST VIEW */
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {loading ? (
                                <p style={{ color: 'var(--text-secondary)' }}>جاري تحميل البيانات...</p>
                            ) : cars.length > 0 ? (
                                cars.map((car) => (
                                    <div
                                        key={car.id}
                                        className="glass"
                                        style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onClick={() => navigate(`/car/${car.id}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ height: '200px', background: '#2a2d35', position: 'relative' }}>
                                            {car.image_url ? (
                                                <img src={car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>لا توجد صورة</div>
                                            )}
                                            <span
                                                style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                    background: car.status === 'found' ? 'var(--status-success)' : car.status === 'missing' ? 'var(--status-error)' : 'var(--accent-secondary)',
                                                    color: '#fff'
                                                }}
                                            >
                                                {car.status === 'missing' ? 'مفقود' : car.status === 'found' ? 'تم العثور عليه' : 'مسروق'}
                                            </span>
                                        </div>
                                        <div style={{ padding: '1.25rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{car.year} {car.make} {car.model}</h3>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                    <MapPin size={14} color="var(--accent-primary)" />
                                                    <span>{car.last_seen_location || 'الموقع غير محدد'}</span>
                                                </div>
                                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                    <Calendar size={14} color="var(--accent-primary)" />
                                                    <span>{car.last_seen_date || 'التاريخ غير محدد'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass flex-center" style={{ gridColumn: '1 / -1', padding: '4rem', flexDirection: 'column', borderRadius: 'var(--radius-md)' }}>
                                    <Layers size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>لا توجد مركبات تطابق شروط البحث.</p>
                                    <button onClick={clearFilters} className="btn btn-outline" style={{ marginTop: '1rem' }}>عرض كل المركبات</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* MAP VIEW */
                        <div className="glass" style={{ height: '600px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
                            <MapContainer center={[15.5007, 32.5599]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {cars.map(car => (
                                    /* Only show markers if latch/lng exist. For now using random offset near Khartoum if missing for demo, 
                                       but in real app strictly check car.lat && car.lng */
                                    (car.last_seen_lat || car.last_seen_location === 'Khartoum') && (
                                        <Marker
                                            key={car.id}
                                            position={[
                                                car.last_seen_lat || 15.5007 + (Math.random() * 0.1 - 0.05),
                                                car.last_seen_lng || 32.5599 + (Math.random() * 0.1 - 0.05)
                                            ]}
                                        >
                                            <Popup>
                                                <div style={{ textAlign: 'right' }}>
                                                    <strong>{car.make} {car.model}</strong><br />
                                                    {car.plate_number}<br />
                                                    <a href={`/car/${car.id}`} style={{ color: 'blue' }}>التفاصيل</a>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                            {!loading && cars.length === 0 && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', padding: '1rem', borderRadius: '8px', zIndex: 1000 }}>
                                    لا توجد نتائج للعرض على الخريطة
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.7rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: inherit;
                }
                .form-group input:focus, .form-group select:focus {
                    border-color: var(--accent-primary);
                    outline: none;
                }
                .input-wrapper {
                    position: relative;
                }
                .input-wrapper input {
                    padding-right: 0.8rem;
                    padding-left: 2.2rem; /* RTL adjust: icon is on LTR right visually, but DOM flow left */
                    /* Actually in RTL, right is start. Let's fix icon pos */
                }
                .input-wrapper .icon {
                    position: absolute;
                    left: 0.8rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default Search;
