import { useState } from 'react';
import MissingCarsMap from '../components/MissingCarsMap';
import { motion } from 'framer-motion';

const MapPage = () => {
    const [selectedCarId, setSelectedCarId] = useState(null);

    return (
        <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
            <motion.div
                className="container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        🗺️ خريطة السيارات المفقودة
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        شاهد جميع السيارات المفقودة على الخريطة وأبلغ عن رؤيتك
                    </p>
                </div>

                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <MissingCarsMap selectedCarId={selectedCarId} />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass"
                    style={{
                        padding: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'right'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>📍 كيفية الاستخدام</h3>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '1rem' }}>
                        <li>🔴 الدوائر الحمراء تمثل السيارات المفقودة</li>
                        <li>🟠 الدوائر البرتقالية تمثل المواقع المسجلة</li>
                        <li>اضغط على أي علامة لرؤية تفاصيل السيارة</li>
                        <li>انقر على الخريطة لإضافة موقع جديد (شهادة رؤية)</li>
                    </ul>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default MapPage;
