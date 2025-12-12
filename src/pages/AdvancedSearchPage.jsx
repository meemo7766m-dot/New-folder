import { useState } from 'react';
import AdvancedSearch from '../components/AdvancedSearch';
import { motion } from 'framer-motion';

const AdvancedSearchPage = () => {
    return (
        <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
            <motion.div
                className="container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ marginBottom: '3rem', textAlign: 'right' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        🎤 البحث المتقدم
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                        ابحث عن السيارات باستخدام الصوت أو المواصفات. اختر الماركة والموديل والسنة واللون نوع الهيكل
                    </p>
                </div>

                <AdvancedSearch />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass"
                    style={{
                        padding: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '3rem',
                        textAlign: 'right'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>💡 المميزات</h3>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '1rem' }}>
                        <li>🎙️ البحث الصوتي باللغة العربية</li>
                        <li>🔍 البحث المتقدم بالمواصفات</li>
                        <li>⏰ سجل البحث والنتائج السابقة</li>
                        <li>⚡ نتائج فورية وسريعة</li>
                    </ul>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdvancedSearchPage;
