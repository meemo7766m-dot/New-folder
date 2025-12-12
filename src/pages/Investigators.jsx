import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvestigatorCard from '../components/InvestigatorCard';
import BookingModal from '../components/BookingModal';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import toast from 'react-hot-toast';

const Investigators = () => {
    const navigate = useNavigate();
    const [investigators, setInvestigators] = useState([]);
    const [filteredInvestigators, setFilteredInvestigators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('all');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedInvestigator, setSelectedInvestigator] = useState(null);
    const [minRating, setMinRating] = useState(0);

    useEffect(() => {
        fetchInvestigators();
    }, []);

    const fetchInvestigators = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('investigators')
                .select('*')
                .eq('is_active', true)
                .eq('availability', true)
                .order('rating', { ascending: false });

            if (error) throw error;
            setInvestigators(data || []);
            setFilteredInvestigators(data || []);
        } catch (err) {
            console.error('Error fetching investigators:', err);
            toast.error('خطأ في تحميل المحققين');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = investigators;

        if (searchTerm) {
            filtered = filtered.filter(inv =>
                inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedSpecialization !== 'all') {
            filtered = filtered.filter(inv => inv.specialization === selectedSpecialization);
        }

        filtered = filtered.filter(inv => inv.rating >= minRating);

        setFilteredInvestigators(filtered);
    }, [searchTerm, selectedSpecialization, minRating, investigators]);

    const handleBook = (investigator) => {
        setSelectedInvestigator(investigator);
        setShowBookingModal(true);
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                <ChevronLeft size={20} /> عودة
            </button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>المحققون المتخصصون 👮</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    تواصل مع محققين محترفين متخصصين في القضايا المتعلقة بالسيارات المفقودة
                </p>
            </motion.div>

            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            🔍 البحث
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    pointerEvents: 'none'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="ابحث عن المحقق باسمه أو بريده"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            <Filter size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> التخصص
                        </label>
                        <select
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="all">الكل</option>
                            <option value="theft">متخصص في السرقة</option>
                            <option value="accidents">متخصص في الحوادث</option>
                            <option value="general">محقق عام</option>
                            <option value="tracking">متخصص في التتبع</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            ⭐ الحد الأدنى للتقييم
                        </label>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="0">الكل</option>
                            <option value="3">3 نجوم فما فوق</option>
                            <option value="4">4 نجوم فما فوق</option>
                            <option value="4.5">4.5 نجوم فما فوق</option>
                        </select>
                    </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {filteredInvestigators.length} محقق متاح
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    جاري التحميل...
                </div>
            ) : filteredInvestigators.length === 0 ? (
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        لم يتم العثور على محققين مطابقين لمعاييرك
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedSpecialization('all');
                            setMinRating(0);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                        }}
                    >
                        إعادة تعيين الفلاتر
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {filteredInvestigators.map((investigator) => (
                        <InvestigatorCard
                            key={investigator.id}
                            investigator={investigator}
                            onBook={handleBook}
                        />
                    ))}
                </motion.div>
            )}

            {showBookingModal && selectedInvestigator && (
                <BookingModal
                    investigator={selectedInvestigator}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedInvestigator(null);
                    }}
                    onSuccess={() => {
                        setShowBookingModal(false);
                        setSelectedInvestigator(null);
                        toast.success('تم إرسال طلب الحجز بنجاح!');
                    }}
                />
            )}
        </div>
    );
};

export default Investigators;
