import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Star, Send, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ServiceRatingForm = ({ carId = null, investigatorId = null, onRatingSuccess = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating_score: 5,
        title: '',
        feedback: '',
        communication: 5,
        professionalism: 5,
        results: 5,
        value_for_money: 5
    });

    const handleScoreChange = (score) => {
        setFormData(prev => ({
            ...prev,
            rating_score: score
        }));
    };

    const handleCategoryChange = (category, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('service_ratings')
                .insert([{
                    car_id: carId,
                    investigator_id: investigatorId,
                    rating_score: formData.rating_score,
                    title: formData.title,
                    feedback: formData.feedback,
                    categories: {
                        communication: formData.communication,
                        professionalism: formData.professionalism,
                        results: formData.results,
                        value_for_money: formData.value_for_money
                    }
                }])
                .select();

            if (error) throw error;

            toast.success('شكراً لتقييمك! رأيك يساعدنا في تحسين الخدمة');
            setFormData({
                rating_score: 5,
                title: '',
                feedback: '',
                communication: 5,
                professionalism: 5,
                results: 5,
                value_for_money: 5
            });

            if (onRatingSuccess) onRatingSuccess(data[0]);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في إرسال التقييم');
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ value, onChange, label }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
            }}>
                <label style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                    {label}
                </label>
                <span style={{ color: 'var(--text-secondary)' }}>
                    {value}/5
                </span>
            </div>
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                direction: 'rtl'
            }}>
                {[5, 4, 3, 2, 1].map(star => (
                    <motion.button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            fontSize: '2rem',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            color: star <= value ? 'var(--accent-primary)' : 'var(--text-muted)',
                            textShadow: star <= value ? '0 0 8px rgba(212, 175, 55, 0.6)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        ⭐
                    </motion.button>
                ))}
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
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                ⭐ قيّم الخدمة
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <StarRating
                    value={formData.rating_score}
                    onChange={handleScoreChange}
                    label="التقييم العام"
                />

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        عنوان التقييم
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="مثال: خدمة ممتازة وسريعة"
                    />
                </div>

                <div style={{
                    background: 'rgba(26, 20, 16, 0.6)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>📊 تقييم التفاصيل</h4>
                    
                    <StarRating
                        value={formData.communication}
                        onChange={(val) => handleCategoryChange('communication', val)}
                        label="💬 التواصل"
                    />
                    <StarRating
                        value={formData.professionalism}
                        onChange={(val) => handleCategoryChange('professionalism', val)}
                        label="👔 الاحترافية"
                    />
                    <StarRating
                        value={formData.results}
                        onChange={(val) => handleCategoryChange('results', val)}
                        label="✅ النتائج"
                    />
                    <StarRating
                        value={formData.value_for_money}
                        onChange={(val) => handleCategoryChange('value_for_money', val)}
                        label="💰 القيمة مقابل السعر"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        تفاصيل التقييم *
                    </label>
                    <textarea
                        value={formData.feedback}
                        onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                        placeholder="شارك تجربتك بالتفصيل..."
                        style={{ minHeight: '150px', fontFamily: 'inherit' }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.feedback.trim()}
                    style={{
                        padding: '1rem',
                        background: loading || !formData.feedback.trim() ? 'rgba(212, 175, 55, 0.3)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading || !formData.feedback.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: loading || !formData.feedback.trim() ? 0.6 : 1
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
                            إرسال التقييم
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ServiceRatingForm;
