import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Lock, Save, Activity } from 'lucide-react';
import NotificationSettings from '../components/NotificationSettings';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState({ totalCars: 0, recentActivity: [] });
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get current user from Supabase Auth
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    navigate('/admin');
                    return;
                }

                setUser(session.user);

                // Get user stats - count of cars added by this admin
                const { count } = await supabase
                    .from('cars')
                    .select('*', { count: 'exact', head: true });

                setUserStats({ totalCars: count || 0 });
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }

        if (newPassword.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('تم تحديث كلمة المرور بنجاح');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0', minHeight: '80vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>الملف الشخصي</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>إدارة معلوماتك الشخصية</p>
                </div>

                {/* User Info Card */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={24} color="var(--accent-primary)" />
                        معلومات الحساب
                    </h2>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <Mail size={20} color="var(--accent-primary)" />
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>البريد الإلكتروني</div>
                                <div style={{ fontWeight: 'bold' }}>{user?.email}</div>
                            </div>
                        </div>

                        {/* Created Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <Calendar size={20} color="var(--accent-primary)" />
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>تاريخ التسجيل</div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                            <Activity size={20} color="var(--accent-primary)" />
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>إجمالي البلاغات في النظام</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-primary)' }}>{userStats.totalCars}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings Card */}
                <NotificationSettings userEmail={user?.email} />

                                {/* Change Password Card */}
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={24} color="var(--accent-primary)" />
                        تغيير كلمة المرور
                    </h2>

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                كلمة المرور الجديدة
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="أدخل كلمة المرور الجديدة"
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: '#fff',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="أعد إدخال كلمة المرور"
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: '#fff',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
                        >
                            <Save size={16} />
                            {updating ? 'جاري التحديث...' : 'حفظ كلمة المرور'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
