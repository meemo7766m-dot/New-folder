import { useState } from 'react';
import { Star, Award, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const InvestigatorCard = ({ investigator, onBook }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getBadgeColor = (specialization) => {
        const colors = {
            theft: '#FF6B6B',
            accidents: '#4ECDC4',
            general: '#95E1D3',
            tracking: '#FFD93D'
        };
        return colors[specialization] || '#999';
    };

    const getSpecializationLabel = (specialization) => {
        const labels = {
            theft: 'متخصص في السرقة 🚔',
            accidents: 'متخصص في الحوادث 🚗',
            general: 'محقق عام 🔍',
            tracking: 'متخصص في التتبع 📍'
        };
        return labels[specialization] || specialization;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${getBadgeColor(investigator.specialization)}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '1rem'
            }}
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    {investigator.image_url && (
                        <img
                            src={investigator.image_url}
                            alt={investigator.name}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '1rem',
                                border: `3px solid ${getBadgeColor(investigator.specialization)}`
                            }}
                        />
                    )}
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {investigator.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: getBadgeColor(investigator.specialization), color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {getSpecializationLabel(investigator.specialization)}
                        </span>
                    </p>

                    {investigator.is_verified && (
                        <p style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <Award size={16} /> معتمد ومتحقق منه
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>سنوات الخبرة</p>
                            <p style={{ fontWeight: 'bold' }}>{investigator.experience_years} سنة</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>نسبة النجاح</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--status-success)' }}>{investigator.success_rate}%</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>الحالات المحلولة</p>
                            <p style={{ fontWeight: 'bold' }}>{investigator.total_cases_solved}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Star size={16} style={{ color: '#FFD700' }} />
                        <span style={{ fontWeight: 'bold' }}>{investigator.rating.toFixed(1)}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>({investigator.total_cases_solved} تقييم)</span>
                    </div>

                    {investigator.hourly_rate && (
                        <p style={{ fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                            {investigator.hourly_rate} دينار/ساعة
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {investigator.phone && (
                        <a
                            href={`tel:${investigator.phone}`}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                justifyContent: 'center',
                                textDecoration: 'none'
                            }}
                        >
                            <Phone size={14} /> اتصل
                        </a>
                    )}
                    {investigator.email && (
                        <a
                            href={`mailto:${investigator.email}`}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--accent-secondary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                justifyContent: 'center',
                                textDecoration: 'none'
                            }}
                        >
                            <Mail size={14} /> بريد
                        </a>
                    )}
                    <button
                        onClick={() => onBook(investigator)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--status-success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        احجز الآن
                    </button>
                </div>
            </div>

            {showDetails && investigator.bio && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}
                >
                    {investigator.bio}
                </motion.div>
            )}
        </motion.div>
    );
};

export default InvestigatorCard;
