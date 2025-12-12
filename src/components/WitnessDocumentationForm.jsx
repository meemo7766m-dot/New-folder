import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send, Loader, MapPin, Calendar, Clock, User, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const WitnessDocumentationForm = ({ carId = null, onDocumentationSuccess = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState(carId || '');
    const [formData, setFormData] = useState({
        witness_name: '',
        witness_phone: '',
        witness_email: '',
        witness_address: '',
        statement: '',
        sighting_date: '',
        sighting_time: '',
        sighting_location: '',
        car_condition: '',
        witness_confidence: 5
    });

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const { data, error } = await supabase
                .from('cars')
                .select('id, make, model, year, license_plate')
                .limit(100);
            
            if (error) throw error;
            setCars(data || []);
        } catch (err) {
            console.error('خطأ في جلب السيارات:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!selectedCarId) {
            toast.error('يجب اختيار السيارة أولاً');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('witness_documentation')
                .insert([{
                    car_id: parseInt(selectedCarId),
                    ...formData,
                    witness_confidence: parseInt(formData.witness_confidence)
                }])
                .select();

            if (error) throw error;

            toast.success('شكراً على شهادتك! سيتم التحقق منها بعناية');
            setFormData({
                witness_name: '',
                witness_phone: '',
                witness_email: '',
                witness_address: '',
                statement: '',
                sighting_date: '',
                sighting_time: '',
                sighting_location: '',
                car_condition: '',
                witness_confidence: 5
            });

            if (onDocumentationSuccess) onDocumentationSuccess(data[0]);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في إرسال الشهادة');
        } finally {
            setLoading(false);
        }
    };

    const ConfidenceSlider = () => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <label style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                    📊 درجة التأكد من الرؤية
                </label>
                <span style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(212, 175, 55, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent-primary)',
                    fontWeight: '600'
                }}>
                    {formData.witness_confidence}/10
                </span>
            </div>
            <input
                type="range"
                min="1"
                max="10"
                value={formData.witness_confidence}
                onChange={(e) => handleChange({ target: { name: 'witness_confidence', value: e.target.value } })}
                style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(212, 175, 55, 0.2)',
                    outline: 'none',
                    cursor: 'pointer',
                    accentColor: 'var(--accent-primary)'
                }}
            />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
            }}>
                <span>غير متأكد</span>
                <span>متأكد جداً</span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium"
            style={{
                maxWidth: '700px',
                margin: '0 auto'
            }}
        >
            <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                👁️ شهادة شاهد
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                شهادتك مهمة جداً في إيجاد السيارة المفقودة
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981'
                }}>
                    <p style={{ fontSize: '0.9rem', margin: '0' }}>
                        ✅ جميع المعلومات سيتم التعامل معها بسرية تامة والتحقق منها بعناية
                    </p>
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        <Car size={18} /> اختر السيارة المفقودة *
                    </label>
                    <select
                        value={selectedCarId}
                        onChange={(e) => setSelectedCarId(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">-- اختر سيارة --</option>
                        {cars.map(car => (
                            <option key={car.id} value={car.id}>
                                {car.year} {car.make} {car.model} - {car.license_plate}
                            </option>
                        ))}
                    </select>
                    {cars.length === 0 && (
                        <p style={{ color: 'var(--status-warning)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            لا توجد سيارات مسجلة حالياً
                        </p>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            <User size={18} /> الاسم الكامل *
                        </label>
                        <input
                            type="text"
                            name="witness_name"
                            value={formData.witness_name}
                            onChange={handleChange}
                            placeholder="أدخل اسمك"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            رقم الهاتف *
                        </label>
                        <input
                            type="tel"
                            name="witness_phone"
                            value={formData.witness_phone}
                            onChange={handleChange}
                            placeholder="+966..."
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            name="witness_email"
                            value={formData.witness_email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            العنوان (اختياري)
                        </label>
                        <input
                            type="text"
                            name="witness_address"
                            value={formData.witness_address}
                            onChange={handleChange}
                            placeholder="المدينة، المنطقة"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            <Calendar size={18} /> تاريخ الرؤية *
                        </label>
                        <input
                            type="date"
                            name="sighting_date"
                            value={formData.sighting_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            <Clock size={18} /> وقت الرؤية
                        </label>
                        <input
                            type="time"
                            name="sighting_time"
                            value={formData.sighting_time}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        <MapPin size={18} /> موقع الرؤية *
                    </label>
                    <input
                        type="text"
                        name="sighting_location"
                        value={formData.sighting_location}
                        onChange={handleChange}
                        placeholder="الموقع الدقيق (الشارع، المدينة، المنطقة)"
                        required
                    />
                </div>

                <ConfidenceSlider />

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        حالة السيارة (ملاحظات)
                    </label>
                    <input
                        type="text"
                        name="car_condition"
                        value={formData.car_condition}
                        onChange={handleChange}
                        placeholder="مثال: بها خدش على الجانب الأيسر، مصباح معطوب، إلخ"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        شهادتك التفصيلية *
                    </label>
                    <textarea
                        name="statement"
                        value={formData.statement}
                        onChange={handleChange}
                        placeholder="اشرح بالتفصيل ما شاهدته... اتجاه السيارة، ما كانت تفعله، أي تفاصيل مهمة أخرى"
                        style={{ minHeight: '150px', fontFamily: 'inherit' }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        background: loading ? 'rgba(212, 175, 55, 0.3)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? (
                        <>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            إرسال الشهادة
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default WitnessDocumentationForm;
