import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, X, Image, Video, Music, Loader, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const MediaUploader = ({ carId = null, caseReportId = null, onMediaAdded = () => {} }) => {
    const [uploading, setUploading] = useState(false);
    const [media, setMedia] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState(carId || '');
    const [cars, setCars] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const { data, error } = await supabase
                .from('cars')
                .select('id, make, model, year, license_plate')
                .limit(100);
            
            if (error) throw error;
            setCars(data || []);
        } catch (err) {
            console.error('خطأ في جلب السيارات:', err);
        }
    };

    const acceptedFormats = {
        image: '.jpg,.jpeg,.png,.gif,.webp',
        video: '.mp4,.webm,.avi,.mov',
        audio: '.mp3,.wav,.m4a,.ogg'
    };

    const getMediaType = (file) => {
        const mimeType = file.type;
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return null;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        const validFiles = files.filter(file => {
            const mediaType = getMediaType(file);
            if (!mediaType) {
                toast.error(`صيغة غير مدعومة: ${file.name}`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleUploadAll = async () => {
        if (selectedFiles.length === 0) {
            toast.error('لم تختر أي ملفات');
            return;
        }

        for (const file of selectedFiles) {
            const mediaType = getMediaType(file);
            await uploadMedia(file, mediaType);
        }

        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadMedia = async (file, mediaType) => {
        if (!selectedCarId && !caseReportId) {
            toast.error('يجب اختيار سيارة أولاً');
            return;
        }

        setUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || 'anonymous';
            
            const timestamp = Date.now();
            const ext = file.name.split('.').pop();
            const fileName = `${mediaType}-${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
            const filePath = `${mediaType}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(filePath, file);

            if (uploadError) {
                toast.error(`خطأ في التحميل: ${uploadError.message}`);
                setUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filePath);

            const { data: insertedMedia, error: dbError } = await supabase
                .from('media')
                .insert([{
                    car_id: selectedCarId ? parseInt(selectedCarId) : null,
                    case_report_id: caseReportId || null,
                    media_type: mediaType,
                    file_path: filePath,
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                    uploaded_by: userId
                }])
                .select();

            if (dbError) {
                toast.error(`خطأ في حفظ البيانات: ${dbError.message}`);
                setUploading(false);
                return;
            }

            const newMedia = {
                ...insertedMedia[0],
                public_url: publicUrl
            };

            setMedia(prev => [...prev, newMedia]);
            toast.success(`تم تحميل ${file.name} بنجاح`);
            
            if (onMediaAdded) {
                onMediaAdded(newMedia);
            }
        } catch (err) {
            toast.error('خطأ غير متوقع');
            console.error(err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const deleteMedia = async (mediaId, filePath) => {
        try {
            const { error: storageError } = await supabase.storage
                .from('media')
                .remove([filePath]);

            if (storageError) {
                toast.error(`خطأ في الحذف: ${storageError.message}`);
                return;
            }

            const { error: dbError } = await supabase
                .from('media')
                .delete()
                .eq('id', mediaId);

            if (dbError) {
                toast.error(`خطأ في حذف البيانات: ${dbError.message}`);
                return;
            }

            setMedia(prev => prev.filter(m => m.id !== mediaId));
            toast.success('تم حذف الملف بنجاح');
        } catch (err) {
            console.error(err);
            toast.error('خطأ في الحذف');
        }
    };

    const getIcon = (mediaType) => {
        switch (mediaType) {
            case 'image':
                return <Image size={24} />;
            case 'video':
                return <Video size={24} />;
            case 'audio':
                return <Music size={24} />;
            default:
                return <Upload size={24} />;
        }
    };

    return (
        <div style={{
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)'
        }}>
            <h3 style={{ marginBottom: '1rem' }}>📁 تحميل الوسائط</h3>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    <Car size={18} /> اختر السيارة
                </label>
                <select
                    value={selectedCarId}
                    onChange={(e) => setSelectedCarId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">-- اختر سيارة --</option>
                    {cars.map(car => (
                        <option key={car.id} value={car.id}>
                            {car.year} {car.make} {car.model}
                        </option>
                    ))}
                </select>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={`${acceptedFormats.image},${acceptedFormats.video},${acceptedFormats.audio}`}
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: 'none' }}
            />

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '0.8rem',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500'
                    }}
                >
                    {uploading ? (
                        <>
                            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            جاري التحميل...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            اختر وسائط
                        </>
                    )}
                </button>

                {selectedFiles.length > 0 && (
                    <button
                        onClick={handleUploadAll}
                        disabled={uploading}
                        style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '0.8rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            opacity: uploading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        <Upload size={20} />
                        رفع {selectedFiles.length} ملف
                    </button>
                )}
            </div>

            {selectedFiles.length > 0 && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        الملفات المختارة ({selectedFiles.length}):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
                        {selectedFiles.map((file, idx) => (
                            <li key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {media.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem'
                }}>
                    {media.map(item => (
                        <div
                            key={item.id}
                            style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)',
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {item.media_type === 'image' ? (
                                <img
                                    src={item.public_url}
                                    alt={item.file_name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {getIcon(item.media_type)}
                                    <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                                        {item.file_name.substring(0, 15)}...
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={() => deleteMedia(item.id, item.file_path)}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,59,48,0.8)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '1rem'
            }}>
                ✓ الصور: JPG, PNG, GIF, WebP | ✓ الفيديوهات: MP4, WebM | ✓ الصوت: MP3, WAV
            </p>
        </div>
    );
};

export default MediaUploader;
