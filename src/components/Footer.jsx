import { Heart, Mail, MessageSquare, Shield } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                padding: '4rem 0 2rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: 'auto',
                background: 'linear-gradient(135deg, var(--bg-secondary), rgba(15, 23, 42, 0.8))'
            }}
        >
            <div className="container">
                {/* Main Footer Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 style={{
                            fontSize: '1.3rem', marginBottom: '1rem', fontWeight: '800',
                            background: 'linear-gradient(135deg, #fff, var(--accent-primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            مفقودات السودان
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            منصة ذكية تجمع المجتمع للعثور على المركبات المفقودة بسرعة وأمان.
                        </p>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>روابط سريعة</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            {[
                                { label: 'البحث', href: '/' },
                                { label: 'الإبلاغ', href: '/' },
                                { label: 'التقارير', href: '/' }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                                        {link.label} →
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>الدعم</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            <a href="mailto:support@meemo.sd" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <Mail size={16} color="var(--accent-primary)" /> البريد الإلكتروني
                            </a>
                            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <MessageSquare size={16} color="var(--accent-primary)" /> التواصل
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '2rem 0' }} />

                {/* Footer Bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex-between"
                    style={{ flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between' }}
                >
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        صُنع بـ <Heart size={16} color="var(--accent-primary)" fill="var(--accent-primary)" /> للسودان
                    </p>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        © {currentYear} مفقودات السودان • جميع الحقوق محفوظة
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <Shield size={16} color="var(--accent-primary)" />
                        <span>آمن وموثوق</span>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;
