import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, AlertCircle, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSecurityAgencies, shareCarWithAgency, getSharedCases, updateCaseShareStatus } from '../utils/securityIntegrationService';

const SecurityIntegration = ({ carId, carData }) => {
    const [agencies, setAgencies] = useState([]);
    const [sharedCases, setSharedCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadAgencies();
        loadSharedCases();
    }, []);

    const loadAgencies = async () => {
        const data = await getSecurityAgencies();
        setAgencies(data);
    };

    const loadSharedCases = async () => {
        const data = await getSharedCases();
        setSharedCases(data);
    };

    const handleShareCase = async (agencyId) => {
        if (!carId || !carData) {
            toast.error('بيانات السيارة غير متاحة');
            return;
        }

        setLoading(true);
        try {
            const result = await shareCarWithAgency(carId, agencyId, {
                type: 'car_report',
                data: carData
            });

            if (result.success) {
                toast.success(result.message);
                loadSharedCases();
                setShowModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('خطأ في المشاركة');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (caseShareId, newStatus) => {
        try {
            await updateCaseShareStatus(caseShareId, newStatus);
            toast.success('تم تحديث الحالة بنجاح');
            loadSharedCases();
        } catch (err) {
            toast.error('خطأ في التحديث');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={20} color="#FFA500" />;
            case 'shared':
                return <Share2 size={20} color="#4ECCA3" />;
            case 'acknowledged':
                return <CheckCircle size={20} color="#60A5FA" />;
            case 'rejected':
                return <XCircle size={20} color="#FF3B30" />;
            default:
                return <AlertCircle size={20} color="#FFC107" />;
        }
    };

    const getStatusText = (status) => {
        const translations = {
            'pending': 'قيد الانتظار',
            'shared': 'مشارك',
            'acknowledged': 'تم إقراره',
            'rejected': 'مرفوض'
        };
        return translations[status] || status;
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>🛡️ التكامل مع الجهات الأمنية</h3>

            {carId && (
                <motion.button
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        fontWeight: '500'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Share2 size={20} />
                    شارك مع جهة أمنية
                </motion.button>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '2rem',
                                maxWidth: '600px',
                                width: '90%',
                                maxHeight: '80vh',
                                overflowY: 'auto'
                            }}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>اختر جهة أمنية للمشاركة</h2>

                            {agencies.length === 0 ? (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <AlertCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>لا توجد جهات أمنية متصلة حالياً</p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    {agencies.map(agency => (
                                        <motion.div
                                            key={agency.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{
                                                padding: '1rem',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                    {agency.name}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {agency.region} - {agency.country}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleShareCase(agency.id)}
                                                disabled={loading}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'var(--accent-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    opacity: loading ? 0.6 : 1
                                                }}
                                            >
                                                مشارك الآن
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                إغلاق
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {sharedCases.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        البلاغات المشاركة ({sharedCases.length})
                    </h4>
                    <div style={{
                        display: 'grid',
                        gap: '1rem'
                    }}>
                        {sharedCases.slice(0, 5).map(caseShare => (
                            <motion.div
                                key={caseShare.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {getStatusIcon(caseShare.status)}
                                    <div>
                                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                            {caseShare.security_agencies?.name || 'جهة غير معروفة'}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {getStatusText(caseShare.status)} - السيارة: {caseShare.cars?.make} {caseShare.cars?.model}
                                        </p>
                                    </div>
                                </div>

                                {caseShare.status === 'pending' && (
                                    <select
                                        onChange={(e) => handleStatusUpdate(caseShare.id, e.target.value)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer'
                                        }}
                                        defaultValue="pending"
                                    >
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="shared">مشارك</option>
                                        <option value="acknowledged">تم إقراره</option>
                                        <option value="rejected">مرفوض</option>
                                    </select>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityIntegration;
