import SmartCarSearch from '../components/SmartCarSearch';
import { motion } from 'framer-motion';

const SmartSearchPage = () => {
    return (
        <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
            <motion.div
                className="container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ marginBottom: '3rem', textAlign: 'right' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        🔍 البحث الذكي عن السيارات
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                        استخدم الذكاء الاصطناعي للتعرف على لوحات الترخيص والبحث الفوري عن السيارات المفقودة
                    </p>
                </div>

                <SmartCarSearch />

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
                    <h3 style={{ marginBottom: '1rem' }}>💡 كيفية الاستخدام</h3>
                    <ol style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '1rem' }}>
                        <li>اختر صورة واضحة لوحة الترخيص أو السيارة</li>
                        <li>سيقوم الذكاء الاصطناعي بتحليل الصورة تلقائياً</li>
                        <li>ستظهر نتائج البحث مع درجة التطابق</li>
                        <li>اضغط على النتيجة لعرض التفاصيل الكاملة</li>
                    </ol>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SmartSearchPage;
