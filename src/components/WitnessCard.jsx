import { useEffect, useState } from 'react';
import { Star, Trophy, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const WitnessCard = ({ witnessId, email }) => {
    const [witness, setWitness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        const fetchWitness = async () => {
            try {
                let query;
                if (witnessId) {
                    query = supabase.from('witnesses').select('*').eq('id', witnessId).single();
                } else if (email) {
                    query = supabase.from('witnesses').select('*').eq('email', email).single();
                } else {
                    setLoading(false);
                    return;
                }

                const { data } = await query;

                if (data) {
                    setWitness(data);

                    const { data: ratings } = await supabase
                        .from('witness_ratings')
                        .select('rating')
                        .eq('witness_id', data.id);

                    if (ratings && ratings.length > 0) {
                        const avg = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
                        setAvgRating(avg);
                    }
                }
            } catch (err) {
                console.error('Error fetching witness:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWitness();
    }, [witnessId, email]);

    if (loading) return null;
    if (!witness) return null;

    const getBadgeColor = (badge) => {
        const colors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2'
        };
        return colors[badge] || '#999';
    };

    const getBadgeLabel = (badge) => {
        const labels = {
            bronze: 'برونز 🥉',
            silver: 'فضي 🥈',
            gold: 'ذهبي 🥇',
            platinum: 'بلاتيني 👑'
        };
        return labels[badge] || badge;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(16, 185, 129, 0.05))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={28} color="#000" />
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '1rem' }}>
                            {witness.name || 'مساهم مجهول'}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <Trophy size={14} color={getBadgeColor(witness.reputation_badge)} />
                            {getBadgeLabel(witness.reputation_badge)}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-sm)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            {witness.credibility_score || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>نقطة موثوقية</div>
                    </div>
                    {avgRating > 0 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < Math.round(avgRating) ? '#fbbf24' : 'transparent'}
                                        color={i < Math.round(avgRating) ? '#fbbf24' : '#666'}
                                    />
                                ))}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {avgRating.toFixed(1)} تقييم
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '1rem',
                fontSize: '0.85rem',
                textAlign: 'center'
            }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>
                        {witness.total_contributions}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>مساهمة</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(74, 222, 128, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
                        {witness.helpful_reports}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>مفيدة</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ color: 'var(--status-error)', fontWeight: 'bold' }}>
                        {witness.false_reports}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>كاذبة</div>
                </div>
            </div>

            {witness.is_verified && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--status-success)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    ✓ تم التحقق من هويتهم
                </div>
            )}
        </motion.div>
    );
};

export default WitnessCard;
