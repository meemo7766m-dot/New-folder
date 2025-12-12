import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Calendar, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';

const BookingModal = ({ investigator, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        car_description: '',
        booking_date: '',
        estimated_cost: investigator.hourly_rate || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.client_name || !formData.client_email || !formData.client_phone || !formData.booking_date) {
                toast.error('يرجى ملء جميع الحقول المطلوبة');
                setSubmitting(false);
                return;
            }

            const bookingDate = new Date(formData.booking_date).toISOString();

            const { error } = await supabase
                .from('investigation_bookings')
                .insert({
                    investigator_id: investigator.id,
                    client_email: formData.client_email,
                    client_phone: formData.client_phone,
                    booking_date: bookingDate,
                    description: formData.car_description,
                    estimated_cost: formData.estimated_cost,
                    status: 'pending'
                });

            if (error) throw error;

            onSuccess();
        } catch (err) {
            console.error('Error creating booking:', err);
            toast.error('خطأ في إنشاء الحجز: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{
                    padding: '2rem',
                    borderRadius: 'var(--radius-lg)',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>احجز المحقق</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '0.25rem'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    borderLeft: '4px solid var(--accent-primary)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{investigator.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {investigator.specialization === 'theft' ? 'متخصص في السرقة 🚔' :
                            investigator.specialization === 'accidents' ? 'متخصص في الحوادث 🚗' :
                                investigator.specialization === 'tracking' ? 'متخصص في التتبع 📍' :
                                    'محقق عام 🔍'}
                    </p>
                    {investigator.hourly_rate && (
                        <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            {investigator.hourly_rate} دينار/ساعة
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            الاسم *
                        </label>
                        <input
                            type="text"
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                            placeholder="اسمك"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> البريد الإلكتروني *
                        </label>
                        <input
                            type="email"
                            value={formData.client_email}
                            onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                            placeholder="بريدك الإلكتروني"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> رقم الهاتف *
                        </label>
                        <input
                            type="tel"
                            value={formData.client_phone}
                            onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                            placeholder="رقم هاتفك"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            وصف السيارة والحالة
                        </label>
                        <textarea
                            value={formData.car_description}
                            onChange={(e) => setFormData({ ...formData, car_description: e.target.value })}
                            placeholder="صف السيارة والمشكلة بالتفصيل..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> تاريخ الحجز المفضل *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.booking_date}
                            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
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

                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            التكلفة المتوقعة:
                        </p>
                        <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {formData.estimated_cost} دينار
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--status-success)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: submitting ? 0.6 : 1
                            }}
                        >
                            {submitting ? 'جاري الإرسال...' : 'تأكيد الحجز'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default BookingModal;
