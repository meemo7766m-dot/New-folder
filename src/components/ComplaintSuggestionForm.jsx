import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send, Loader, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ComplaintSuggestionForm = ({ onSubmitSuccess = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        submitter_name: '',
        submitter_email: '',
        submitter_phone: '',
        complaint_type: 'suggestion',
        subject: '',
        description: '',
        category: '',
        severity: 'medium'
    });

    const complaintTypes = {
        complaint: { emoji: '😔', label: 'شكوى' },
        suggestion: { emoji: '💡', label: 'مقترح' },
        bug_report: { emoji: '🐛', label: 'إبلاغ عن خطأ' }
    };

    const categories = {
        complaint: ['خدمة سيئة', 'تأخير', 'عدم احترافية', 'مشكلة فنية', 'أخرى'],
        suggestion: ['تحسين الواجهة', 'ميزة جديدة', 'تحسين الأداء', 'تحسين الخدمة', 'أخرى'],
        bug_report: ['مشكلة في التطبيق', 'مشكلة في الموقع', 'فقدان البيانات', 'خطأ في العرض', 'أخرى']
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'complaint_type') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                category: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingFile(true);
        for (const file of files) {
            try {
                const timestamp = Date.now();
                const fileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
                const filePath = `complaints/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('complaints')
                    .upload(filePath, file);

                if (uploadError) {
                    toast.error(`خطأ في تحميل ${file.name}`);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('complaints')
                    .getPublicUrl(filePath);

                setAttachments(prev => [...prev, {
                    name: file.name,
                    path: filePath,
                    url: publicUrl
                }]);

                toast.success(`تم تحميل ${file.name}`);
            } catch (err) {
                console.error(err);
                toast.error('خطأ في تحميل الملف');
            }
        }
        setUploadingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = async (filePath) => {
        try {
            await supabase.storage
                .from('complaints')
                .remove([filePath]);

            setAttachments(prev => prev.filter(a => a.path !== filePath));
            toast.success('تم حذف الملف');
        } catch (err) {
            toast.error('خطأ في حذف الملف');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('complaints_suggestions')
                .insert([{
                    ...formData,
                    attachment_urls: attachments.map(a => a.url)
                }])
                .select();

            if (error) throw error;

            toast.success('شكراً على تعليقك! سيتم النظر فيه قريباً');
            setFormData({
                submitter_name: '',
                submitter_email: '',
                submitter_phone: '',
                complaint_type: 'suggestion',
                subject: '',
                description: '',
                category: '',
                severity: 'medium'
            });
            setAttachments([]);

            if (onSubmitSuccess) onSubmitSuccess(data[0]);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في الإرسال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium"
            style={{
                maxWidth: '700px',
                margin: '0 auto'
            }}
        >
            <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', color: 'var(--accent-primary)' }}>
                📮 شارك آراءك معنا
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                شكاوى ومقترحات لتحسين الخدمة
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            الاسم *
                        </label>
                        <input
                            type="text"
                            name="submitter_name"
                            value={formData.submitter_name}
                            onChange={handleChange}
                            placeholder="اسمك"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            البريد الإلكتروني *
                        </label>
                        <input
                            type="email"
                            name="submitter_email"
                            value={formData.submitter_email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        رقم الهاتف
                    </label>
                    <input
                        type="tel"
                        name="submitter_phone"
                        value={formData.submitter_phone}
                        onChange={handleChange}
                        placeholder="+966..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            النوع *
                        </label>
                        <select
                            name="complaint_type"
                            value={formData.complaint_type}
                            onChange={handleChange}
                            required
                        >
                            {Object.entries(complaintTypes).map(([key, { emoji, label }]) => (
                                <option key={key} value={key}>
                                    {emoji} {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            الفئة *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">اختر فئة</option>
                            {categories[formData.complaint_type]?.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        الموضوع *
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="ملخص قصير..."
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        التفاصيل *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="اشرح بالتفصيل..."
                        style={{ minHeight: '150px', fontFamily: 'inherit' }}
                        required
                    />
                </div>

                {formData.complaint_type === 'complaint' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            مستوى الخطورة
                        </label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                        >
                            <option value="low">🟢 منخفض</option>
                            <option value="medium">🟡 متوسط</option>
                            <option value="high">🔴 مرتفع</option>
                            <option value="critical">⛔ حرج</option>
                        </select>
                    </div>
                )}

                <div style={{
                    background: 'rgba(26, 20, 16, 0.6)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-color)'
                }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px dashed var(--accent-primary)',
                            color: 'var(--accent-primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: uploadingFile ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            opacity: uploadingFile ? 0.6 : 1
                        }}
                    >
                        {uploadingFile ? (
                            <>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                جاري التحميل...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                📎 اضغط لإرسال الملفات (اختياري)
                            </>
                        )}
                    </button>

                    {attachments.length > 0 && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {attachments.map((file, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(212, 175, 55, 0.15)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>📄 {file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(file.path)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '0.25rem'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        background: loading ? 'rgba(212, 175, 55, 0.3)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? (
                        <>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            إرسال
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ComplaintSuggestionForm;
