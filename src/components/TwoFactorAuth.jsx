import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { enableTwoFactor, verifyTwoFactor, checkPasswordStrength } from '../utils/security';
import { Shield, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TwoFactorAuth = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [step, setStep] = useState('check');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    setUserEmail(session.user.email);
                    const { data: security } = await supabase
                        .from('user_security')
                        .select('two_factor_enabled')
                        .eq('user_email', session.user.email)
                        .single();

                    setIs2FAEnabled(security?.two_factor_enabled || false);
                }
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    const handleEnable2FA = async () => {
        if (!userEmail) return;

        setLoading(true);
        try {
            const result = await enableTwoFactor(userEmail);
            if (result.success) {
                setGeneratedCode(result.code);
                setStep('verify');
                toast.success('تم إنشاء الرمز');
            } else {
                toast.error('فشل: ' + result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!inputCode.trim()) {
            toast.error('أدخل الرمز');
            return;
        }

        setLoading(true);
        try {
            const result = await verifyTwoFactor(userEmail, inputCode);
            if (result.success) {
                setIs2FAEnabled(true);
                setStep('success');
                toast.success('تم تفعيل المصادقة الثنائية');
            } else {
                toast.error('رمز غير صحيح');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (pwd) => {
        setPassword(pwd);
        const strength = checkPasswordStrength(pwd);
        setPasswordStrength(strength);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        toast.success('تم النسخ');
    };

    if (loading) {
        return (
            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p>جاري التححميل...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Shield size={32} color="var(--accent-primary)" />
                    <h2 style={{ margin: 0 }}>المصادقة الثنائية (2FA)</h2>
                </div>

                {is2FAEnabled && step === 'check' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Check size={20} color="var(--status-success)" />
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--status-success)' }}>
                                المصادقة الثنائية مفعلة
                            </p>
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            حسابك محمي بطبقة أمان إضافية
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {step === 'check' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                    أضف طبقة أمان إضافية إلى حسابك باستخدام المصادقة الثنائية
                                </p>

                                <button
                                    onClick={handleEnable2FA}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    تفعيل المصادقة الثنائية
                                </button>
                            </motion.div>
                        )}

                        {step === 'verify' && generatedCode && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        رمز التحقق (احفظه بمكان آمن):
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                                        <code style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '0.2em' }}>
                                            {generatedCode}
                                        </code>
                                        <button
                                            onClick={copyToClipboard}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    أدخل رمز التحقق للتأكيد:
                                </p>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                    placeholder="ABC123"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        letterSpacing: '0.2em',
                                        marginBottom: '1rem'
                                    }}
                                />

                                <button
                                    onClick={handleVerify}
                                    disabled={loading || !inputCode.trim()}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: inputCode.trim() && !loading ? 'var(--status-success)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: inputCode.trim() && !loading ? 'pointer' : 'not-allowed',
                                        fontWeight: '600',
                                        opacity: inputCode.trim() && !loading ? 1 : 0.6
                                    }}
                                >
                                    التحقق والتفعيل
                                </button>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
                                <Check size={64} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: 'var(--status-success)', marginBottom: '0.5rem' }}>
                                    تم التفعيل بنجاح!
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    حسابك الآن محمي بالمصادقة الثنائية
                                </p>
                            </motion.div>
                        )}
                    </>
                )}

                {/* كلمة المرور القوية */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>🔑 كلمة المرور القوية</h3>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder="اكتب كلمة مرور قوية..."
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)'
                            }}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {passwordStrength && (
                        <div>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(passwordStrength.score / 5) * 100}%`,
                                        background: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score <= 3 ? '#f59e0b' : '#10b981',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                            <p style={{
                                margin: '0.5rem 0',
                                fontSize: '0.9rem',
                                color: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score <= 3 ? '#f59e0b' : '#10b981',
                                fontWeight: '600'
                            }}>
                                قوة كلمة المرور: {passwordStrength.level}
                            </p>
                            {passwordStrength.feedback.length > 0 && (
                                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {passwordStrength.feedback.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TwoFactorAuth;
