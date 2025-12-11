import { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationSettings = ({ userEmail }) => {
    const [preferences, setPreferences] = useState({
        emailOnStatusChange: true,
        emailOnNewReport: true,
        emailOnUpdate: true,
        notificationFrequency: 'immediate'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const savedPrefs = localStorage.getItem('notificationPreferences');
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
            toast.success('تم حفظ إعدادات الإشعارات بنجاح');
        } catch (error) {
            toast.error('حدث خطأ في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={24} color="var(--accent-primary)" />
                إعدادات الإشعارات
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={preferences.emailOnStatusChange}
                            onChange={(e) => setPreferences({ ...preferences, emailOnStatusChange: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>إشعارات تغيير الحالة</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>أبلغني عند تغيير حالة البلاغ</div>
                        </div>
                    </label>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={preferences.emailOnNewReport}
                            onChange={(e) => setPreferences({ ...preferences, emailOnNewReport: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>تقارير جديدة</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>أبلغني عند ورود تقرير جديد متعلق ببلاغاتي</div>
                        </div>
                    </label>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={preferences.emailOnUpdate}
                            onChange={(e) => setPreferences({ ...preferences, emailOnUpdate: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>التحديثات</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>أبلغني عند إضافة تحديثات جديدة للقضية</div>
                        </div>
                    </label>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>تكرار الإشعارات</label>
                        <select
                            value={preferences.notificationFrequency}
                            onChange={(e) => setPreferences({ ...preferences, notificationFrequency: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-primary)',
                                color: '#fff',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="immediate">فوري</option>
                            <option value="daily">يومي</option>
                            <option value="weekly">أسبوعي</option>
                        </select>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={20} color="var(--status-success)" />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>البريد الإلكتروني</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userEmail}</div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', justifyContent: 'center', width: '100%' }}
            >
                <CheckCircle size={16} />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
        </div>
    );
};

export default NotificationSettings;
