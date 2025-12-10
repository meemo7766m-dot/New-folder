import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ padding: '3rem 0', borderTop: '1px solid var(--border-color)', marginTop: 'auto', background: 'var(--bg-secondary)' }}>
            <div className="container">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>مفقودات السودان</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.9rem' }}>
                            منصة مجتمعية لمساعدة أصحاب المركبات المفقودة في العثور عليها.
                        </p>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            صنع بـ <Heart size={14} color="var(--accent-primary)" fill="var(--accent-primary)" /> للسودان
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ مغربي سيف اليزل.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
