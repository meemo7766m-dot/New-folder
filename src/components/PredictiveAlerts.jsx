import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, TrendingUp, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { supabase } from '../lib/supabaseClient';

const PredictiveAlerts = ({ carId }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('predictive_alerts')
                .select('*')
                .eq('car_id', carId)
                .is('is_dismissed', false)
                .order('risk_score', { ascending: false });

            if (error) throw error;
            setAlerts(data || []);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    }, [carId]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const dismissAlert = async (alertId) => {
        try {
            const { error } = await supabase
                .from('predictive_alerts')
                .update({ is_dismissed: true })
                .eq('id', alertId);

            if (error) throw error;
            setAlerts(alerts.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('Error dismissing alert:', err);
        }
    };

    const getAlertIcon = (alertType) => {
        const icons = {
            theft_risk: <Shield size={20} style={{ color: '#FF6B6B' }} />,
            accident_risk: <TrendingUp size={20} style={{ color: '#FFD93D' }} />,
            location_anomaly: <MapPin size={20} style={{ color: '#4ECDC4' }} />,
            pattern_match: <AlertTriangle size={20} style={{ color: '#FF8C42' }} />
        };
        return icons[alertType] || <AlertTriangle size={20} />;
    };

    const getAlertColor = (alertType) => {
        const colors = {
            theft_risk: { bg: 'rgba(255, 107, 107, 0.1)', border: '#FF6B6B' },
            accident_risk: { bg: 'rgba(255, 217, 61, 0.1)', border: '#FFD93D' },
            location_anomaly: { bg: 'rgba(78, 205, 196, 0.1)', border: '#4ECDC4' },
            pattern_match: { bg: 'rgba(255, 140, 66, 0.1)', border: '#FF8C42' }
        };
        return colors[alertType] || { bg: 'rgba(251, 191, 36, 0.1)', border: 'var(--accent-primary)' };
    };

    const getAlertLabel = (alertType) => {
        const labels = {
            theft_risk: 'خطر السرقة 🚨',
            accident_risk: 'خطر الحوادث ⚠️',
            location_anomaly: 'شذوذ الموقع 📍',
            pattern_match: 'تطابق الأنماط 🔴'
        };
        return labels[alertType] || 'تنبيه';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                جاري تحميل التنبيهات...
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="glass" style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '4px solid var(--status-success)'
            }}>
                <Shield size={32} style={{ margin: '0 auto 1rem', color: 'var(--status-success)' }} />
                <p style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>
                    لا توجد تنبيهات - السيارة في حالة جيدة ✓
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                التنبيهات الذكية 🤖
            </h3>

            {alerts.map((alert, idx) => {
                const colors = getAlertColor(alert.alert_type);

                return (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass"
                        style={{
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-lg)',
                            background: colors.bg,
                            borderLeft: `4px solid ${colors.border}`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {getAlertIcon(alert.alert_type)}
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        color: colors.border
                                    }}>
                                        {getAlertLabel(alert.alert_type)}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {alert.prediction_reason}
                                </p>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            درجة الخطر
                                        </span>
                                        <span style={{
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                            color: colors.border
                                        }}>
                                            {alert.risk_score.toFixed(0)}%
                                        </span>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${alert.risk_score}%` }}
                                            transition={{ duration: 1 }}
                                            style={{
                                                height: '100%',
                                                background: colors.border,
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    borderLeft: `3px solid ${colors.border}`
                                }}>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: 'bold',
                                        marginBottom: '0.25rem'
                                    }}>
                                        الإجراء الموصى به:
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {alert.recommended_action}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => dismissAlert(alert.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                تجاهل
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default PredictiveAlerts;
