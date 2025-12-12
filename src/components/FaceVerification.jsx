import { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';
import { verifiyFaceIdentity } from '../utils/advancedAIService';

const FaceVerification = ({ userEmail, onSuccess }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            toast.error('لا يمكن الوصول للكاميرا');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setVerifying(true);

        try {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            const imageData = canvasRef.current.toDataURL('image/jpeg');

            const response = await verifiyFaceIdentity(userEmail, imageData);

            setResult(response);

            if (response.success) {
                toast.success(response.message);
                stopCamera();
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.error('Verification error:', err);
            toast.error('خطأ في التحقق');
        } finally {
            setVerifying(false);
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
                <Camera size={24} /> التحقق من الهوية بالوجه
            </h3>

            {!cameraActive ? (
                <button
                    onClick={startCamera}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}
                >
                    تشغيل الكاميرا
                </button>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1rem',
                            background: '#000'
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        width={320}
                        height={240}
                        style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={captureAndVerify}
                            disabled={verifying}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--status-success)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                opacity: verifying ? 0.6 : 1
                            }}
                        >
                            {verifying ? (
                                <>
                                    <Loader size={16} style={{ display: 'inline', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                    جاري التحقق...
                                </>
                            ) : (
                                'التقط صورة للتحقق'
                            )}
                        </button>
                        <button
                            onClick={stopCamera}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--status-error)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            إيقاف
                        </button>
                    </div>
                </>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${result.success ? 'var(--status-success)' : 'var(--status-error)'}`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {result.success ? (
                            <CheckCircle size={20} style={{ color: 'var(--status-success)' }} />
                        ) : (
                            <AlertCircle size={20} style={{ color: 'var(--status-error)' }} />
                        )}
                        <span style={{ fontWeight: 'bold', color: result.success ? 'var(--status-success)' : 'var(--status-error)' }}>
                            {result.message}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        دقة التطابق: {result.confidence.toFixed(1)}%
                    </p>
                </motion.div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

export default FaceVerification;
