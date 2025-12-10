import { Shield, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            setError('فشل تسجيل الدخول. تأكد من البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-md)' }}>
                <div className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1rem'
                    }}>
                        <Shield size={32} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem' }}>دخول المشرفين</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>للمصرح لهم فقط</p>
                </div>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                        <Link to="/admin/signup" style={{ color: 'var(--text-secondary)' }}>إنشاء حساب مشرف جديد</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
