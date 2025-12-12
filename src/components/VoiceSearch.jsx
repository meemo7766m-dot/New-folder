import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';
import { processVoiceCommand, trainVoiceProfile } from '../utils/advancedAIService';

const VoiceSearch = ({ userEmail, onCommandExecuted }) => {
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcriptText, setTranscriptText] = useState('');
    const [result, setResult] = useState(null);
    const [isTraining, setIsTraining] = useState(false);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                await handleVoiceCommand(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            toast.error('لا يمكن الوصول للميكروفون');
            console.error('Microphone error:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const handleVoiceCommand = async (audioBlob) => {
        setProcessing(true);

        try {
            const recognizedText = await recognizeSpeech();
            setTranscriptText(recognizedText);

            const response = await processVoiceCommand(userEmail, audioBlob, recognizedText);

            setResult(response);

            if (response.success) {
                toast.success(response.message);
                if (onCommandExecuted) onCommandExecuted(response);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.error('Voice processing error:', err);
            toast.error('خطأ في معالجة الأمر الصوتي');
        } finally {
            setProcessing(false);
        }
    };

    const recognizeSpeech = async () => {
        const mockCommands = [
            'ابحث عن سيارة حمراء',
            'أبلغ عن سيارة مفقودة',
            'احجز محقق متخصص',
            'أين السيارات القريبة',
            'ساعدني في البحث'
        ];

        return mockCommands[Math.floor(Math.random() * mockCommands.length)];
    };

    const trainVoice = async () => {
        try {
            setIsTraining(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                const response = await trainVoiceProfile(userEmail, audioBlob);
                toast.success(response.message);

                stream.getTracks().forEach(track => track.stop());
                setIsTraining(false);
            };

            mediaRecorder.start();

            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);
        } catch (error) {
            console.error('Error training voice:', error);
            toast.error('خطأ في تدريب الصوت');
            setIsTraining(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass"
            style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '500px'
            }}
        >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mic size={24} /> البحث الصوتي 🎤
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={processing}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        background: recording ? 'var(--status-error)' : 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: processing ? 0.6 : 1
                    }}
                >
                    {recording ? (
                        <>
                            <MicOff size={20} /> إيقاف التسجيل
                        </>
                    ) : (
                        <>
                            <Mic size={20} /> ابدأ التسجيل
                        </>
                    )}
                </button>

                <button
                    onClick={trainVoice}
                    disabled={isTraining || recording}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'var(--accent-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        opacity: isTraining || recording ? 0.6 : 1
                    }}
                >
                    {isTraining ? 'جاري التدريب...' : 'تدريب الصوت'}
                </button>
            </div>

            {recording && (
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        color: 'var(--status-error)',
                        fontWeight: 'bold'
                    }}
                >
                    جاري التسجيل...
                </motion.div>
            )}

            {transcriptText && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(--accent-primary)'
                    }}
                >
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        النص المستخرج:
                    </p>
                    <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {transcriptText}
                    </p>
                </motion.div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${result.success ? 'var(--status-success)' : 'var(--status-error)'}`
                    }}
                >
                    <p style={{
                        fontSize: '0.9rem',
                        color: result.success ? 'var(--status-success)' : 'var(--status-error)',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                    }}>
                        ✓ {result.message}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        الأمر: {result.action}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        دقة التعرف: {result.confidence.toFixed(1)}%
                    </p>
                </motion.div>
            )}

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
            }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>💡 أمثلة الأوامر:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li>✓ "ابحث عن سيارة بيضاء"</li>
                    <li>✓ "أبلغ عن سيارة مفقودة"</li>
                    <li>✓ "احجز محقق متخصص"</li>
                </ul>
            </div>
        </motion.div>
    );
};

export default VoiceSearch;
