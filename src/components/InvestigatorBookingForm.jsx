import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Clock, MapPin, DollarSign, Send, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const InvestigatorBookingForm = ({ investigatorId = null, onBookingSuccess = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        client_name: '',
        client_phone: '',
        client_email: '',
        case_description: '',
        booking_date: '',
        booking_time: '',
        location: '',
        budget_range: 'medium',
        notes: ''
    });

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

        try {
            const { data, error } = await supabase
                .from('investigator_bookings')
                .insert([{
                    ...formData,
                    investigator_id: investigatorId
                }])
                .select();

            if (error) throw error;

            toast.success('تم حجز المحقق بنجاح! سيتم التواصل معك قريباً');
            setFormData({
                client_name: '',
                client_phone: '',
                client_email: '',
                case_description: '',
                booking_date: '',
                booking_time: '',
                location: '',
                budget_range: 'medium',
                notes: ''
            });

            if (onBookingSuccess) onBookingSuccess(data[0]);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في الحجز. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

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
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                📅 حجز محقق متخصص
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            الاسم *
                        </label>
                        <input
                            type="text"
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleChange}
                            placeholder="أدخل اسمك الكامل"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            رقم الهاتف *
                        </label>
                        <input
                            type="tel"
                            name="client_phone"
                            value={formData.client_phone}
                            onChange={handleChange}
                            placeholder="+966..."
                            required
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        البريد الإلكتروني
                    </label>
                    <input
                        type="email"
                        name="client_email"
                        value={formData.client_email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        وصف الحالة *
                    </label>
                    <textarea
                        name="case_description"
                        value={formData.case_description}
                        onChange={handleChange}
                        placeholder="اشرح تفاصيل الحالة وما تحتاج إليه..."
                        style={{ minHeight: '120px', fontFamily: 'inherit' }}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            <Calendar size={18} /> التاريخ المفضل
                        </label>
                        <input
                            type="date"
                            name="booking_date"
                            value={formData.booking_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            <Clock size={18} /> الوقت المفضل
                        </label>
                        <input
                            type="time"
                            name="booking_time"
                            value={formData.booking_time}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        <MapPin size={18} /> الموقع
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="المدينة والمنطقة"
                    />
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        <DollarSign size={18} /> نطاق الميزانية
                    </label>
                    <select
                        name="budget_range"
                        value={formData.budget_range}
                        onChange={handleChange}
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="low">💰 اقتصادي</option>
                        <option value="medium">💰💰 متوسط</option>
                        <option value="high">💰💰💰 مرتفع</option>
                        <option value="premium">👑 فاخر</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        ملاحظات إضافية
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="أي معلومات إضافية..."
                        style={{ minHeight: '80px', fontFamily: 'inherit' }}
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
                            جاري المعالجة...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            تأكيد الحجز
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default InvestigatorBookingForm;
