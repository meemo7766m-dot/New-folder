import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Menu, X, Search, ShieldCheck } from 'lucide-react';
import '../styles/global.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar glass" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '1rem 0' }}>
            <div className="container flex-between">
                {/* Logo */}
                <Link to="/" className="logo flex-center" style={{ gap: '0.5rem', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                    <Car size={28} color="var(--accent-primary)" />
                    <span className="text-gradient">مفقودات السودان</span>
                </Link>

                {/* Desktop Links */}
                <div className="hide-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link">الرئيسية</Link>
                    <Link to="/search" className="nav-link">بحث عن مركبة</Link>
                    <Link to="/admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <ShieldCheck size={16} style={{ marginLeft: '0.5rem' }} /> لوحة الإدارة
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="hide-desktop" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: 'var(--text-primary)' }}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="glass mobile-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
                    <Link to="/search" onClick={() => setIsMenuOpen(false)}>بحث عن مركبة</Link>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--accent-primary)' }}>دخول المشرفين</Link>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .hide-desktop { display: none !important; }
        }
        .nav-link {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
