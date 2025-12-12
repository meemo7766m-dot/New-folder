import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

const SmartMatch = ({ car }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!car) return;

        const findMatches = async () => {
            setLoading(true);
            try {
                // If car is MISSING, look for FOUND. If FOUND/STOLEN, look for MISSING.
                const targetStatus = car.status === 'missing' ? 'found' : 'missing';

                // AI Logic: Match mainly on Make and Model
                // Partial matches or strict matches can be adjusted here
                const { data, error } = await supabase
                    .from('cars')
                    .select('*')
                    .eq('status', targetStatus)
                    .ilike('make', car.make) // Case insensitive match
                    .ilike('model', car.model); // Case insensitive match

                if (!error && data) {
                    setMatches(data);
                }
            } catch (err) {
                console.error("AI Match Error:", err);
            } finally {
                setLoading(false);
            }
        };

        findMatches();
    }, [car]);

    if (!car || loading || matches.length === 0) return null;

    return (
        <div className="glass" style={{
            padding: '1.5rem',
            marginTop: '2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-primary)',
            background: 'linear-gradient(to left, rgba(251, 191, 36, 0.05), transparent)'
        }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        padding: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles size={20} color="#000" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>تطابق ذكي (AI Match)</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            وجد نظامنا {matches.length} مركبة قد تكون مطابقة!
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {matches.map(match => (
                    <div key={match.id} className="flex-between" style={{
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 'var(--radius-sm)',
                        borderRight: '4px solid var(--accent-primary)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {match.image_url ? (
                                <img src={match.image_url} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                                <div style={{ width: '60px', height: '60px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Car size={24} />
                                </div>
                            )}
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{match.year} {match.make} {match.model}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {match.plate_number} • {match.last_seen_location}
                                </div>
                            </div>
                        </div>
                        <Link to={`/car/${match.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            عرض <ArrowRight size={14} style={{ marginRight: '0.3rem' }} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartMatch;
