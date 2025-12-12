import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useLocation, useNavigate } from 'react-router-dom';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم في البحث عن المفقودات؟', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    // Context-aware greeting
    useEffect(() => {
        if (isOpen && messages.length === 1) {
            if (location.pathname === '/search') {
                setMessages(prev => [...prev, { id: generateId(), text: 'أرى أنك في صفحة البحث. يمكنك استخدام الفلاتر لتضييق النتائج حسب الماركة أو المكان.', sender: 'bot' }]);
            } else if (location.pathname === '/dashboard') {
                setMessages(prev => [...prev, { id: generateId(), text: 'أهلاً بك في لوحة التحكم. هل تحتاج مساعدة في إدارة البلاغات؟', sender: 'bot' }]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, location.pathname]);

    const generateId = () => Math.random();

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: generateId(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI thinking and response
        setTimeout(() => {
            const responseText = generateResponse(input);
            setMessages(prev => [...prev, { id: generateId(), text: responseText, sender: 'bot' }]);
        }, 800);
    };

    const generateResponse = (query) => {
        const q = query.toLowerCase();

        if (q.includes('بلاغ') || q.includes('إضافة') || q.includes('مفقود')) {
            return 'للإبلاغ عن سيارة مفقودة، يمكنك الضغط على زر "إبلاغ عن حالة" في الصفحة الرئيسية، أو الذهاب للوحة التحكم إذا كنت مشرفاً.';
        }
        if (q.includes('بحث') || q.includes('تفتيش')) {
            navigate('/search');
            return 'سأخذك لصفحة البحث فوراً. هناك يمكنك البحث بالماركة، الموديل، والمكان.';
        }
        if (q.includes('تواصل') || q.includes('رقم')) {
            return 'يمكنك التواصل مع الإدارة عبر صفحة "اتصل بنا" أو عبر الأرقام الموحدة للطوارئ.';
        }
        if (q.includes('خريطة') || q.includes('موقع')) {
            return 'الخريطة التفاعلية موجودة في صفحة البحث ولوحة التحكم، وتظهر أماكن البلاغات بشكل دقيق.';
        }

        return 'عذراً، لم أفهم تماماً. هل يمكنك صياغة السؤال بشكل آخر؟ يمكنني مساعدتك في البحث، الإبلاغ، أو شرح الموقع.';
    };

    return (
        <>
            {/* FAB */}
            <motion.button
                className="glass btn-primary"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
                }}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="glass"
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            right: '2rem',
                            width: '350px',
                            height: '500px',
                            borderRadius: 'var(--radius-md)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid rgba(251, 191, 36, 0.3)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ background: 'var(--accent-primary)', borderRadius: '50%', padding: '0.4rem' }}>
                                <Bot size={20} color="#000" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0' }}>المساعد الذكي</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>متصل الآن</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                        color: msg.sender === 'user' ? '#000' : '#fff',
                                        borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="اكتب رسالتك..."
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                className="btn-primary"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
