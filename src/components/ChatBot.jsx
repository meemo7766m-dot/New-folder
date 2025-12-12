import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';
import {
    recognizeIntent,
    generateResponse,
    saveChatMessage,
    createConversation,
    updateConversation,
    searchCars
} from '../utils/chatbotService';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        initializeChat();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initializeChat = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const conv = await createConversation(session?.user?.email);
            setConversation(conv);

            const welcomeIntent = 'greeting';
            const welcomeResponse = generateResponse(welcomeIntent);
            setMessages([{
                id: Date.now(),
                type: 'bot',
                text: welcomeResponse.text,
                suggestions: welcomeResponse.suggestions
            }]);
        } catch (err) {
            console.error('Error initializing chat:', err);
        }
    };

    const handleSuggestClick = async (suggestion) => {
        await handleSendMessage(suggestion.text, suggestion.action);
    };

    const handleSendMessage = async (messageText = null, action = null) => {
        const message = messageText || inputValue.trim();
        if (!message || loading || !conversation) return;

        setInputValue('');
        setLoading(true);

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: message
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            await saveChatMessage(conversation.id, 'user', message);

            const intent = recognizeIntent(message);
            let botResponse = generateResponse(intent);

            if (action === 'search') {
                const searchResults = await searchCars(message);
                if (searchResults.length > 0) {
                    botResponse = {
                        ...botResponse,
                        text: `وجدت ${searchResults.length} سيارات مطابقة:`,
                        searchResults
                    };
                } else {
                    botResponse = {
                        ...botResponse,
                        text: 'لم أتمكن من العثور على نتائج. هل تود محاولة بحث آخر؟'
                    };
                }
            } else if (action === 'report') {
                botResponse = {
                    ...botResponse,
                    text: 'يمكنك الإبلاغ عن سيارة مفقودة من خلال الضغط على زر "إضافة سيارة" في الصفحة الرئيسية',
                    suggestions: [
                        { text: 'اذهب للصفحة الرئيسية', action: 'home' },
                        { text: 'هل تحتاج مساعدة أخرى؟', action: 'help' }
                    ]
                };
            } else if (action === 'investigator') {
                botResponse = {
                    ...botResponse,
                    text: 'يمكنك عرض قائمة المحققين المتخصصين والحجز معهم مباشرة',
                    suggestions: [
                        { text: 'عرض المحققين', action: 'investigators' },
                        { text: 'معلومات عن الخدمة', action: 'help' }
                    ]
                };
            } else if (action === 'faq_search') {
                botResponse = {
                    ...botResponse,
                    text: 'للبحث عن سيارة: استخدم شريط البحث العلوي، أدخل اسم الماركة أو الموديل أو رقم اللوحة، وسيظهر لك جميع السيارات المطابقة.'
                };
            }

            await saveChatMessage(conversation.id, 'bot', botResponse.text, intent);
            await updateConversation(conversation.id);

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: botResponse.text,
                suggestions: botResponse.suggestions,
                searchResults: botResponse.searchResults
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('Error sending message:', err);
            toast.error('خطأ في الرسالة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass"
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            width: '380px',
                            height: '600px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 999,
                            boxShadow: '0 5px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ marginBottom: '0.2rem' }}>مساعد ذكي 🤖</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>دائماً هنا للمساعدة</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    padding: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: msg.type === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                        color: msg.type === 'user' ? 'white' : 'var(--text-primary)'
                                    }}>
                                        <p style={{ marginBottom: msg.suggestions ? '0.75rem' : '0' }}>
                                            {msg.text}
                                        </p>

                                        {msg.searchResults && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                {msg.searchResults.map(car => (
                                                    <div key={car.id} style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        marginBottom: '0.5rem',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <p style={{ fontWeight: 'bold' }}>
                                                            {car.year} {car.make} {car.model}
                                                        </p>
                                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                            {car.last_seen_location}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {msg.suggestions && msg.type === 'bot' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {msg.suggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestClick(suggestion)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'rgba(255,255,255,0.15)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.85rem',
                                                            transition: 'background 0.3s',
                                                            textAlign: 'right'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                                                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                                                    >
                                                        {suggestion.text}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span>جاري الكتابة...</span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="اكتب رسالتك..."
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    opacity: loading ? 0.6 : 1
                                }}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={loading || !inputValue.trim()}
                                style={{
                                    padding: '0.75rem',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    opacity: loading || !inputValue.trim() ? 0.5 : 1
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 998,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
                <MessageCircle size={28} />
            </motion.button>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default ChatBot;
