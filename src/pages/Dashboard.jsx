import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Loader, LogOut, Users, Shield, BarChart2, Map as MapIcon, List, FileText, Download, CheckCircle, XCircle, Edit2, Eye, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReportViewer from '../components/ReportViewer';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [cars, setCars] = useState([]);
    const [allowedUsers, setAllowedUsers] = useState([]);
    const [visitCount, setVisitCount] = useState(0);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState({ make: '', model: '', year: '', color: '', plate_number: '', last_seen_location: '', description: '', status: 'missing', last_seen_lat: '', last_seen_lng: '', owner_email: '' });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const filteredCars = cars.filter(car => {
        const matchesSearch = car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            car.plate_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !filterStatus || car.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const fetchData = async () => {
        const [carsRes, usersRes, visitsRes] = await Promise.all([
            supabase.from('cars').select('*').order('created_at', { ascending: false }),
            supabase.from('allowed_users').select('*').order('created_at', { ascending: false }),
            supabase.from('site_visits').select('id', { count: 'exact' }) // Fetch count
        ]);

        if (carsRes.data) setCars(carsRes.data);
        if (usersRes.data) setAllowedUsers(usersRes.data);
        if (visitsRes.count !== null) setVisitCount(visitsRes.count);
    };

    // ... (keep existing code)




    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin');
            } else {
                fetchData();
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    // Stats Calculation
    const stats = {
        total: cars.length,
        missing: cars.filter(c => c.status === 'missing').length,
        found: cars.filter(c => c.status === 'found').length,
        stolen: cars.filter(c => c.status === 'stolen').length,
    };

    const chartData = [
        { name: 'مفقود', value: stats.missing, fill: '#ef4444' },
        { name: 'مسروق', value: stats.stolen, fill: '#ff9800' },
        { name: 'تم العثور عليه', value: stats.found, fill: '#10b981' },
    ];

    // Export Functions
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(cars);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cars");
        XLSX.writeFile(wb, "missing_cars_report.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Missing Cars Report", 14, 15);

        const tableColumn = ["Make", "Model", "Year", "Color", "Plate", "Status", "Location"];
        const tableRows = [];

        cars.forEach(car => {
            const carData = [
                car.make, car.model, car.year, car.color, car.plate_number, car.status, car.last_seen_location
            ];
            tableRows.push(carData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save("missing_cars_report.pdf");
    };

    const printDailyReport = () => {
        const today = new Date().toISOString().split('T')[0];
        const todaysCars = cars.filter(car => car.created_at && car.created_at.startsWith(today));

        if (todaysCars.length === 0) {
            alert("لم يتم العثور على بلاغات لهذا اليوم لطباعتها.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لطباعة التقرير.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <title>التقرير اليومي - ${today}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
                    body { font-family: 'Tajawal', sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .date { font-size: 16px; color: #666; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
                    .stat-item { text-align: center; }
                    .stat-value { font-size: 20px; font-weight: bold; color: #2563eb; }
                    .stat-label { font-size: 14px; color: #555; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                    th { background-color: #f3f4f6; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">تقرير البلاغات اليومي</div>
                    <div class="date">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
                </div>

                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-value">${todaysCars.length}</div>
                        <div class="stat-label">بلاغات جديدة</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${todaysCars.filter(c => c.status === 'found').length}</div>
                        <div class="stat-label">تم العثور عليها</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>المركبة</th>
                            <th>رقم اللوحة</th>
                            <th>الحالة</th>
                            <th>الموقع</th>
                            <th>الوقت</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${todaysCars.map(car => `
                            <tr>
                                <td>${car.make} ${car.model} (${car.year || '-'})</td>
                                <td>${car.plate_number}</td>
                                <td>${car.status === 'missing' ? 'مفقود' : car.status === 'found' ? 'تم العثور عليه' : 'مسروق'}</td>
                                <td>${car.last_seen_location || '-'}</td>
                                <td>${new Date(car.created_at).toLocaleTimeString('ar-EG')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    تم استخراج هذا التقرير آلياً من منصة "مفقودات السودان" بتاريخ ${new Date().toLocaleString('ar-EG')}
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // Handlers
    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (!error) setCars(cars.filter(c => c.id !== id));
    };

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase.from('cars').update({ status: newStatus }).eq('id', id);
        if (!error) {
            const updatedCar = cars.find(c => c.id === id);
            setCars(cars.map(c => c.id === id ? { ...c, status: newStatus } : c));

            // Log to timeline
            await supabase.from('case_updates').insert([{
                car_id: id,
                title: 'تغيير حالة البلاغ',
                description: `تم تغيير حالة المركبة إلى ${newStatus === 'missing' ? 'مفقود' : newStatus === 'found' ? 'تم العثور عليه' : 'مسروق'}`,
                update_type: 'status_change',
                update_date: new Date()
            }]);

            // Send email notification if owner_email exists
            if (updatedCar?.owner_email) {
                try {
                    const statusMap = {
                        'missing': 'مفقود',
                        'found': 'تم العثور عليه',
                        'stolen': 'مسروق'
                    };

                    // Send email using EmailJS
                    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
                    await emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        {
                            to_email: updatedCar.owner_email,
                            car_make: updatedCar.make,
                            car_model: updatedCar.model,
                            car_year: updatedCar.year || '-',
                            plate_number: updatedCar.plate_number,
                            new_status: statusMap[newStatus] || newStatus,
                            car_url: `${window.location.origin}/car/${id}`,
                            update_date: new Date().toLocaleDateString('ar-EG')
                        }
                    );

                    console.log('✅ Email sent successfully!');
                    alert('تم إرسال إشعار بالبريد الإلكتروني للمالك');
                } catch (emailError) {
                    console.error('❌ Failed to send email:', emailError);
                    alert('حدث خطأ في إرسال البريد الإلكتروني');
                }
            }
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('allowed_users').insert([{ email: newUserEmail }]);
        if (!error) {
            alert('تمت الإضافة');
            setNewUserEmail('');
            fetchData();
        } else {
            alert(error.message);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("المتصفح لا يدعم تحديد الموقع.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    last_seen_lat: position.coords.latitude,
                    last_seen_lng: position.coords.longitude
                });
                alert("تم تحديد الإحداثيات بنجاح!");
            },
            () => {
                alert("تعذر تحديد الموقع. يرجى السماح للمتصفح بالوصول للموقع.");
            }
        );
    };

    const handleSubmitCar = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // ... (rest of function)

            let image_url = null;
            if (imageFile) {
                const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
                await supabase.storage.from('car-images').upload(fileName, imageFile);
                const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(fileName);
                image_url = publicUrl;
            }

            const { error } = await supabase.from('cars').insert([{ ...formData, image_url }]);
            if (error) throw error;

            alert('تم إضافة البلاغ');
            setIsAddModalOpen(false);
            fetchData();
            // Reset form
            setFormData({ make: '', model: '', year: '', color: '', plate_number: '', last_seen_location: '', description: '', status: 'missing', last_seen_lat: '', last_seen_lng: '', owner_email: '' });
            setImageFile(null);

        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '100vh' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-between"
                style={{
                    marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(16, 185, 129, 0.05))',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)'
                }}
            >
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>لوحة التحكم</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>مرحباً! لديك {allowedUsers.length} مشرفين نشطين</p>
                </div>
                <button onClick={handleLogout} className="btn" style={{ color: 'var(--status-error)', padding: '0.8rem 1.5rem' }}>
                    <LogOut size={20} /> تسجيل الخروج
                </button>
            </motion.div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
                '@media (max-width: 768px)': {
                    gridTemplateColumns: 'repeat(2, 1fr)'
                }
            }}>
                {[
                    { id: 'overview', label: 'الإحصائيات', icon: BarChart2 },
                    { id: 'heatmap', label: 'الخريطة', icon: MapIcon },
                    { id: 'cases', label: 'البلاغات', icon: List },
                    { id: 'verification', label: 'التحقق', icon: Shield },
                    { id: 'users', label: 'المشرفين', icon: Users },
                    { id: 'reports', label: 'التقارير', icon: FileText },
                ].map((tab, idx) => (
                    <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setActiveTab(tab.id)}
                        className="glass"
                        style={{
                            padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 'var(--radius-md)',
                            border: activeTab === tab.id ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                            background: activeTab === tab.id ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.id ? '0 0 20px rgba(251, 191, 36, 0.2)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                    >
                        <tab.icon size={22} color={activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{tab.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Content Active Tab: Overview */}
            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'grid', gap: '2rem' }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[
                            { icon: FileText, label: 'إجمالي البلاغات', value: stats.total, color: '#fbbf24' },
                            { icon: CheckCircle, label: 'تم العثور عليها', value: stats.found, color: '#10b981' },
                            { icon: AlertCircle, label: 'مفقودات نشطة', value: stats.missing, color: '#ef4444' },
                            { icon: TrendingUp, label: 'عدد الزيارات', value: visitCount, color: '#3b82f6' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass"
                                style={{
                                    padding: '1.5rem', borderRadius: 'var(--radius-md)', borderTop: `3px solid ${stat.color}`,
                                    display: 'flex', alignItems: 'center', gap: '1rem'
                                }}
                            >
                                <stat.icon size={32} color={stat.color} style={{ opacity: 0.8 }} />
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{stat.label}</p>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass"
                            style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}
                        >
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={20} color="var(--accent-primary)" />
                                توزيع الحالات
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="glass"
                            style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}
                        >
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart2 size={20} color="var(--accent-primary)" />
                                الإحصائيات
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* Active Tab: Heatmap */}
            {activeTab === 'heatmap' && (
                <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', height: '600px' }}>
                    <MapContainer center={[15.5007, 32.5599]} zoom={6} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-sm)' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {cars.map((car, idx) => (
                            (car.last_seen_lat || car.last_seen_location === 'Khartoum') && (
                                <CircleMarker
                                    key={idx}
                                    center={[car.last_seen_lat || 15.5007 + (Math.random() * 0.5), car.last_seen_lng || 32.5599 + (Math.random() * 0.5)]}
                                    radius={10}
                                    pathOptions={{
                                        color: car.status === 'missing' ? 'red' : 'green',
                                        fillColor: car.status === 'missing' ? 'red' : 'green',
                                        fillOpacity: 0.5
                                    }}
                                >
                                    <Popup>{car.make} - {car.last_seen_location}</Popup>
                                </CircleMarker>
                            )
                        ))}
                    </MapContainer>
                </div>
            )}

            {/* Active Tab: Cases Management */}
            {activeTab === 'cases' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass"
                    style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}
                >
                    <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>سجل البلاغات ({filteredCars.length})</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>إدارة وتحديث حالات المركبات المفقودة</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary"><Plus size={16} /> إضافة جديد</button>
                            <button onClick={exportExcel} className="btn btn-outline"><Download size={16} /> Excel</button>
                            <button onClick={exportPDF} className="btn btn-outline"><Download size={16} /> PDF</button>
                            <button onClick={printDailyReport} className="btn btn-primary" style={{ background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', color: 'white', textShadow: 'none' }}><FileText size={16} /> التقرير</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="ابحث حسب الماركة أو الموديل أو رقم اللوحة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.8rem 1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '0.8rem 1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="">جميع الحالات</option>
                            <option value="missing">مفقود</option>
                            <option value="found">تم العثور عليه</option>
                            <option value="stolen">مسروق</option>
                        </select>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>المركبة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>اللوحة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>الحالة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>الموقع</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCars.map(car => (
                                    <tr key={car.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                {car.image_url && <img src={car.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{car.make} {car.model}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{car.year}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{car.plate_number}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={car.status}
                                                onChange={(e) => updateStatus(car.id, e.target.value)}
                                                style={{
                                                    background: 'transparent',
                                                    color: car.status === 'missing' ? 'var(--status-error)' : car.status === 'found' ? 'var(--status-success)' : 'orange',
                                                    border: '1px solid var(--border-color)',
                                                    padding: '0.3rem',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <option value="missing">مفقود</option>
                                                <option value="stolen">مسروق</option>
                                                <option value="found">تم العثور عليه</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{car.last_seen_location}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => handleDelete(car.id)} style={{ color: 'var(--status-error)' }}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCars.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                لا توجد بلاغات مطابقة
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Active Tab: Ownership Verification */}
            {activeTab === 'verification' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass"
                    style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}
                >
                    <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>التحقق من ملكية المركبات</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>راجع والموافق على طلبات التحقق من الملكية</p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {cars.filter(c => !c.is_verified && c.owner_email).length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <CheckCircle size={32} style={{ marginBottom: '1rem', color: 'var(--status-success)' }} />
                                <p>جميع البلاغات تم التحقق منها ✓</p>
                            </div>
                        ) : (
                            cars.filter(c => !c.is_verified && c.owner_email).map(car => (
                                <motion.div
                                    key={car.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass"
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid var(--accent-primary)'
                                    }}
                                >
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                            {car.year} {car.make} {car.model}
                                        </h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            اللوحة: <strong>{car.plate_number}</strong>
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            البريد: <strong>{car.owner_email}</strong>
                                        </p>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        justifyContent: 'space-between'
                                    }}>
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from('cars')
                                                    .update({ is_verified: true, verified_at: new Date().toISOString() })
                                                    .eq('id', car.id);
                                                if (!error) {
                                                    alert('تم التحقق بنجاح');
                                                    fetchData();
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                background: 'var(--status-success)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            ✓ وافق
                                        </button>
                                        <button
                                            onClick={() => window.open(`/verify/${car.id}`, '_blank')}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                background: 'var(--accent-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            🔍 معاينة
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* Active Tab: Users */}
            {activeTab === 'users' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass"
                    style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>إدارة المشرفين</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>أضف مشرفين جدد للمنصة</p>
                    </div>

                    <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', maxWidth: '600px' }}>
                        <input
                            className="input-field"
                            type="email"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                            placeholder="أدخل البريد الإلكتروني..."
                            required
                            style={{ flex: 1, padding: '0.8rem 1rem' }}
                        />
                        <button className="btn btn-primary"><Plus size={18} /> إضافة</button>
                    </form>

                    <div style={{ display: 'grid', gap: '0.8rem', maxWidth: '700px' }}>
                        {allowedUsers.length > 0 ? (
                            allowedUsers.map((u, idx) => (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass"
                                    style={{
                                        padding: '1.2rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        borderLeft: '3px solid var(--accent-primary)'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Shield size={18} color="var(--accent-primary)" />
                                        {u.email}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--status-success)', fontWeight: 'bold' }}>✓ مشرف نشط</span>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                لا يوجد مشرفين حالياً
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Active Tab: Reports */}
            {activeTab === 'reports' && (
                <ReportViewer />
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--bg-card), rgba(15, 23, 42, 0.5))',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>إضافة بلاغ جديد</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>أدخل معلومات المركبة المفقودة بدقة</p>
                        </div>

                        <form onSubmit={handleSubmitCar} style={{ display: 'grid', gap: '1.2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input className="input-field" placeholder="الماركة" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} required />
                                <input className="input-field" placeholder="الموديل" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                            </div>
                            <input className="input-field" placeholder="سنة الصنع" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                            <input className="input-field" placeholder="رقم اللوحة" value={formData.plate_number} onChange={e => setFormData({ ...formData, plate_number: e.target.value })} required />
                            <input className="input-field" placeholder="اللون" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                            <input className="input-field" placeholder="الموقع" value={formData.last_seen_location} onChange={e => setFormData({ ...formData, last_seen_location: e.target.value })} />
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                                    <input className="input-field" type="number" step="any" placeholder="Latitude (اختياري)" value={formData.last_seen_lat} onChange={e => setFormData({ ...formData, last_seen_lat: e.target.value })} />
                                    <input className="input-field" type="number" step="any" placeholder="Longitude (اختياري)" value={formData.last_seen_lng} onChange={e => setFormData({ ...formData, last_seen_lng: e.target.value })} />
                                </div>
                                <button type="button" onClick={handleGetLocation} className="btn btn-outline" style={{ whiteSpace: 'nowrap', height: '44px' }}>
                                    <MapPin size={16} /> موقعي
                                </button>
                            </div>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="البريد الإلكتروني للمالك (للإشعارات)"
                                value={formData.owner_email}
                                onChange={e => setFormData({ ...formData, owner_email: e.target.value })}
                            />
                            <textarea className="input-field" placeholder="تفاصيل..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                            <input type="file" onChange={e => setImageFile(e.target.files[0])} style={{ color: '#fff' }} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '1rem' }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'جاري الحفظ...' : 'حفظ البلاغ'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="btn btn-outline"
                                    style={{ padding: '1rem' }}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            <style>{`
                .input-field {
                    width: 100%; padding: 0.8rem; border-radius: 6px; 
                    border: 1px solid var(--border-color); background: var(--bg-primary); 
                    color: #fff; font-family: inherit;
                }
             `}</style>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className="glass flex-center" style={{ padding: '1.5rem', flexDirection: 'column', borderRadius: 'var(--radius-sm)', borderTop: `4px solid ${color || 'var(--accent-primary)'}` }}>
        <h4 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</h4>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</span>
    </div>
);

export default Dashboard;
