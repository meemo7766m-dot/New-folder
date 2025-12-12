import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const WitnessRating = ({ carId, witnessId, onRatingSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [isHelpful, setIsHelpful] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('witness_ratings')
                .insert({
                    witness_id: witnessId,
                    car_id: carId,
                    rating: rating,
                    is_helpful: isHelpful,
                    feedback: feedback,
                    report_status: isHelpful ? (rating >= 4 ? 'verified' : 'useful') : 'not_useful'
                });

            if (error) throw error;

            if (witnessId) {
                await supabase.rpc('update_witness_credibility', {
                    witness_id: witnessId,
                    is_helpful_report: isHelpful,
                    rating_value: rating
                }).catch(() => console.log('RPC not available, that\'s ok'));
            }

            setSubmitted(true);
            if (onRatingSubmitted) onRatingSubmitted();
        } catch (err) {
            console.error('Error submitting rating:', err);
            alert('حدث خطأ: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    padding: '1.5rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--status-success)'
                }}
            >
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>شكراً لتقييمك! 🙏</p>
                <p style={{ fontSize: '0.9rem' }}>ساعدتنا بتقييمك على تحسين جودة الشهود الموثوقين</p>
            </motion.div>
        );
    }

    return (
        <motion.form
            onSubmit={handleSubmitRating}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}
        >
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>قيّم مساهمة هذا الشاهد</h3>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>تقييمك:</label>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <Star
                                size={32}
                                fill={star <= rating ? '#fbbf24' : 'transparent'}
                                color={star <= rating ? '#fbbf24' : '#666'}
                                style={{ transition: 'all 0.2s' }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>هل كانت المعلومة مفيدة؟</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsHelpful(true)}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            background: isHelpful === true ? 'var(--status-success)' : 'rgba(16, 185, 129, 0.2)',
                            color: isHelpful === true ? '#fff' : 'var(--status-success)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                            transition: 'all 0.3s'
                        }}
                    >
                        <ThumbsUp size={18} /> نعم، مفيدة
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsHelpful(false)}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            background: isHelpful === false ? 'var(--status-error)' : 'rgba(239, 68, 68, 0.2)',
                            color: isHelpful === false ? '#fff' : 'var(--status-error)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                            transition: 'all 0.3s'
                        }}
                    >
                        <ThumbsDown size={18} /> لا، غير مفيدة
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>تعليقات إضافية (اختياري):</label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="شارك رأيك عن هذه المعلومة..."
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        minHeight: '100px',
                        resize: 'vertical'
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={submitting || rating === 0 || isHelpful === null}
                style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: rating > 0 && isHelpful !== null ? 'var(--accent-primary)' : '#666',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 'bold',
                    cursor: submitting || rating === 0 || isHelpful === null ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    transition: 'all 0.3s'
                }}
            >
                {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                تقييمك يساعدنا على بناء مجتمع موثوق بمعلومات دقيقة
            </p>
        </motion.form>
    );
};

export default WitnessRating;
