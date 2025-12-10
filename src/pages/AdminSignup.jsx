import { Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Check if email is in allowed_users table
            const { data: allowed, error: checkError } = await supabase
                .from('allowed_users')
                .select('*')
                .eq('email', email)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                throw checkError;
            }

            if (!allowed) {
                throw new Error('عذراً، هذا البريد الإلكتروني غير مصرح له بالتسجيل كمسؤول.');
            }

            // 2. Proceed with Signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            alert('تم التسجيل بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.');
            navigate('/admin');
        } catch (err) {
            console.error(err);
            setError(err.message);
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
                        <UserPlus size={32} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem' }}>تسجيل مشرف جديد</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>إنشاء حساب إداري جديد</p>
                </div>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                            minLength={6}
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
                        {loading ? 'جاري الانشاء...' : 'إنشاء الحساب'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>هل لديك حساب بالفعل؟ </span>
                        <Link to="/admin" style={{ color: 'var(--accent-primary)' }}>سجل دخولك هنا</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSignup;
