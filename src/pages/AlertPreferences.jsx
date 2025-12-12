import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, MapPin, Circle, Mail, Bell, X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';

const AlertPreferences = () => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location_name: '',
        latitude: '',
        longitude: '',
        radius_km: 5,
        car_make: '',
        car_status: '',
        notify_via_email: true,
        notify_via_app: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/');
                    return;
                }

                setUserEmail(session.user.email);
                fetchPreferences(session.user.email);
            } catch {
                toast.error('حدث خطأ');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const fetchPreferences = async (email) => {
        try {
            const { data, error } = await supabase
                .from('user_alert_preferences')
                .select('*')
                .eq('user_email', email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPreferences(data || []);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في تحميل التنبيهات');
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('المتصفح لا يدعم تحديد الموقع');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                toast.success('تم تحديد الموقع!');
            },
            () => {
                toast.error('يرجى السماح بالوصول للموقع');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.location_name || !formData.latitude || !formData.longitude) {
                toast.error('يرجى ملء جميع الحقول المطلوبة');
                setSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('user_alert_preferences')
                .insert({
                    user_email: userEmail,
                    name: formData.name || formData.location_name,
                    location_name: formData.location_name,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    radius_km: parseFloat(formData.radius_km),
                    car_make: formData.car_make || null,
                    car_status: formData.car_status || null,
                    notify_via_email: formData.notify_via_email,
                    notify_via_app: formData.notify_via_app
                });

            if (error) throw error;

            toast.success('تم إضافة التنبيه بنجاح!');
            setShowForm(false);
            setFormData({
                name: '',
                location_name: '',
                latitude: '',
                longitude: '',
                radius_km: 5,
                car_make: '',
                car_status: '',
                notify_via_email: true,
                notify_via_app: true
            });
            fetchPreferences(userEmail);
        } catch (err) {
            console.error(err);
            toast.error('خطأ: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            const { error } = await supabase
                .from('user_alert_preferences')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('تم الحذف بنجاح');
            fetchPreferences(userEmail);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في الحذف');
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        try {
            const { error } = await supabase
                .from('user_alert_preferences')
                .update({ is_active: !isActive })
                .eq('id', id);

            if (error) throw error;

            toast.success('تم تحديث الحالة');
            fetchPreferences(userEmail);
        } catch {
            toast.error('خطأ');
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={20} /> عودة
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>إدارة التنبيهات الجغرافية</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>أضف مناطق واحصل على تنبيهات عند اقترب سيارة مفقودة منك</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'إلغاء' : 'إضافة منطقة'}
                    </button>
                </div>

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass"
                        style={{ padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>منطقة جديدة</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>اسم المنطقة (مثلاً: منطقة سكني)</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="مثلاً: الخرطوم - شرق"
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>اسم الموقع (الموقع الفعلي)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location_name}
                                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                        placeholder="مثلاً: الخرطوم"
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>نطاق التنبيه (كم)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.radius_km}
                                        onChange={(e) => setFormData({ ...formData, radius_km: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الماركة (اختياري)</label>
                                    <input
                                        type="text"
                                        value={formData.car_make}
                                        onChange={(e) => setFormData({ ...formData, car_make: e.target.value })}
                                        placeholder="مثلاً: Toyota"
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الحالة (اختياري)</label>
                                    <select
                                        value={formData.car_status}
                                        onChange={(e) => setFormData({ ...formData, car_status: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">الكل</option>
                                        <option value="missing">مفقود</option>
                                        <option value="stolen">مسروق</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الموقع الجغرافي</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        required
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        placeholder="خط العرض"
                                        style={{
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                    <input
                                        type="number"
                                        step="0.0001"
                                        required
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        placeholder="خط الطول"
                                        style={{
                                            padding: '0.8rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    className="btn"
                                    style={{ marginBottom: '1rem' }}
                                >
                                    <MapPin size={16} /> تحديد موقعي الحالي
                                </button>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.notify_via_email}
                                        onChange={(e) => setFormData({ ...formData, notify_via_email: e.target.checked })}
                                    />
                                    <Mail size={16} /> إشعارات بريد إلكتروني
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.notify_via_app}
                                        onChange={(e) => setFormData({ ...formData, notify_via_app: e.target.checked })}
                                    />
                                    <Bell size={16} /> إشعارات التطبيق
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', opacity: submitting ? 0.7 : 1 }}
                            >
                                {submitting ? 'جاري الإضافة...' : 'إضافة التنبيه'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </motion.div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {preferences.length === 0 ? (
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>لم تضف أي منطقة بعد</p>
                        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            أضف منطقة الآن
                        </button>
                    </div>
                ) : (
                    preferences.map((pref, idx) => (
                        <motion.div
                            key={pref.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass"
                            style={{
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `3px solid ${pref.is_active ? 'var(--accent-primary)' : '#666'}`,
                                opacity: pref.is_active ? 1 : 0.6
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{pref.name}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <MapPin size={14} /> {pref.location_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Circle size={14} /> {pref.radius_km} كم
                                        </div>
                                        {pref.car_make && <div>🚗 {pref.car_make}</div>}
                                        {pref.car_status && <div>📋 {pref.car_status === 'missing' ? 'مفقود' : 'مسروق'}</div>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleToggleStatus(pref.id, pref.is_active)}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            background: pref.is_active ? 'var(--status-success)' : '#666',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {pref.is_active ? '✓ مفعل' : 'معطل'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pref.id)}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            background: 'var(--status-error)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}
                                    >
                                        <Trash2 size={14} /> حذف
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertPreferences;
