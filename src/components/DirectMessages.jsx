import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    getOrCreateConversation,
    sendMessage,
    getConversationMessages,
    markMessagesAsRead,
    getUserConversations
} from '../utils/messageService';
import { Send, Loader, MessageCircle, Phone, Video, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DirectMessages = ({ carId = null, recipientEmail = null }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserEmail(session?.user?.email);
            if (session?.user?.email) {
                fetchConversations(session.user.email);
            }
        };
        initUser();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            markMessagesAsRead(selectedConversation.id, userEmail);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (carId && recipientEmail && userEmail) {
            initializeConversation();
        }
    }, [carId, recipientEmail, userEmail]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async (email) => {
        try {
            setLoading(true);
            const result = await getUserConversations(email);
            if (result.success) {
                setConversations(result.conversations);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const result = await getConversationMessages(conversationId);
            if (result.success) {
                setMessages(result.messages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const initializeConversation = async () => {
        try {
            const result = await getOrCreateConversation(userEmail, recipientEmail, carId);
            if (result.success) {
                setSelectedConversation(result.conversation);
                fetchMessages(result.conversation.id);
            }
        } catch (err) {
            toast.error('فشل إنشاء المحادثة');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const result = await sendMessage(selectedConversation.id, userEmail, messageText);
            if (result.success) {
                setMessageText('');
                fetchMessages(selectedConversation.id);
            } else {
                toast.error('فشل إرسال الرسالة');
            }
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '400px' }}>
                <Loader size={40} className="animate-spin" color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '1rem',
            minHeight: '600px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
        }}>
            {/* المحادثات */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRight: '1px solid var(--border-color)',
                overflowY: 'auto',
                padding: '1rem'
            }}>
                <h3 style={{ marginBottom: '1rem', textAlign: 'right' }}>💬 المحادثات</h3>
                {conversations.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '2rem' }}>
                        لا توجد محادثات
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {conversations.map(conv => {
                            const otherEmail = conv.user1_email === userEmail ? conv.user2_email : conv.user1_email;
                            const isSelected = selectedConversation?.id === conv.id;
                            return (
                                <motion.button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        padding: '1rem',
                                        background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        textAlign: 'right',
                                        color: isSelected ? 'white' : 'var(--text-primary)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {conv.cars?.year} {conv.cars?.make}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                                        {otherEmail}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {conv.last_message?.substring(0, 30)}...
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* نافذة الرسائل */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem'
            }}>
                {selectedConversation ? (
                    <>
                        {/* رأس المحادثة */}
                        <div style={{
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <Phone size={20} />
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <Video size={20} />
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <Info size={20} />
                                </button>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ marginBottom: '0.25rem' }}>
                                    {selectedConversation.cars?.year} {selectedConversation.cars?.make} {selectedConversation.cars?.model}
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {selectedConversation.cars?.license_plate}
                                </p>
                            </div>
                        </div>

                        {/* الرسائل */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginBottom: '1rem',
                            padding: '1rem 0'
                        }}>
                            {messages.map(msg => {
                                const isOwn = msg.sender_email === userEmail;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: isOwn ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: isOwn ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                            color: isOwn ? 'white' : 'var(--text-primary)'
                                        }}>
                                            <p style={{ marginBottom: '0.25rem' }}>
                                                {msg.content}
                                            </p>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                opacity: 0.7
                                            }}>
                                                {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* حقل الإدخال */}
                        <form onSubmit={handleSendMessage} style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="اكتب رسالتك..."
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!messageText.trim() || sending}
                                style={{
                                    padding: '0.75rem',
                                    background: messageText.trim() && !sending ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'white',
                                    cursor: messageText.trim() && !sending ? 'pointer' : 'not-allowed',
                                    opacity: messageText.trim() && !sending ? 1 : 0.6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-center" style={{ height: '100%' }}>
                        <MessageCircle size={64} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            اختر محادثة للبدء
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessages;
