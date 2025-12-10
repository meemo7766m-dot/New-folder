import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Loader, LogOut, Users, Shield, BarChart2, Map as MapIcon, List, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ReportViewer from '../components/ReportViewer';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // overview, heatmap, cases, users
    const [cars, setCars] = useState([]);
    const [allowedUsers, setAllowedUsers] = useState([]);
    const [visitCount, setVisitCount] = useState(0); // New state for visits
    const [isLoading, setIsLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');

    // ... (keep existing code)

    const fetchData = async () => {
        setIsLoading(true);
        const [carsRes, usersRes, visitsRes] = await Promise.all([
            supabase.from('cars').select('*').order('created_at', { ascending: false }),
            supabase.from('allowed_users').select('*').order('created_at', { ascending: false }),
            supabase.from('site_visits').select('id', { count: 'exact' }) // Fetch count
        ]);

        if (carsRes.data) setCars(carsRes.data);
        if (usersRes.data) setAllowedUsers(usersRes.data);
        if (visitsRes.count !== null) setVisitCount(visitsRes.count);
        setIsLoading(false);
    };

    // ... (keep existing code)

    // In Render:
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>ملخص سريع</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StatCard title="إجمالي البلاغات" value={stats.total} />
            <StatCard title="إجمالي الزوار" value={visitCount} color="#3b82f6" /> {/* New Card */}
            <StatCard title="تم الحل" value={stats.found} color="var(--status-success)" />
            <StatCard title="مفقودات نشطة" value={stats.missing} color="var(--status-error)" />
            <StatCard title="تحت البحث" value={stats.stolen} color="var(--accent-secondary)" />
        </div>
    </div>

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
        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(22);
            doc.text("Daily Report", 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

            // Filter today's cars
            const today = new Date().toISOString().split('T')[0];
            const todaysCars = cars.filter(car => car.created_at && car.created_at.startsWith(today));

            if (todaysCars.length === 0) {
                alert("لم يتم العثور على بلاغات لهذا اليوم.");
                // Still generate the PDF with header
            }

            // Summary Stats
            doc.setFontSize(14);
            doc.text(`Total New Reports Today: ${todaysCars.length}`, 14, 50);

            // Table
            const tableColumn = ["Make", "Model", "Plate", "Status", "Time"];
            const tableRows = [];

            todaysCars.forEach(car => {
                const time = new Date(car.created_at).toLocaleTimeString();
                tableRows.push([
                    car.make, car.model, car.plate_number, car.status, time
                ]);
            });

            doc.autoTable(tableColumn, tableRows, { startY: 70 });
            doc.save(`daily_report_${today}.pdf`);

        } catch (error) {
            console.error("Error generating report:", error);
            alert("حدث خطأ أثناء إنشاء التقرير: " + error.message);
        }
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
            setCars(cars.map(c => c.id === id ? { ...c, status: newStatus } : c));

            // Log to timeline
            await supabase.from('case_updates').insert([{
                car_id: id,
                title: 'تغيير حالة البلاغ',
                description: `تم تغيير حالة المركبة إلى ${newStatus === 'missing' ? 'مفقود' : newStatus === 'found' ? 'تم العثور عليه' : 'مسروق'}`,
                update_type: 'status_change',
                update_date: new Date()
            }]);
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

    const handleSubmitCar = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let image_url = null;
            if (imageFile) {
                const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
                const { data } = await supabase.storage.from('car-images').upload(fileName, imageFile);
                const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(fileName);
                image_url = publicUrl;
            }

            const { error } = await supabase.from('cars').insert([{ ...formData, image_url }]);
            if (error) throw error;

            alert('تم إضافة البلاغ');
            setIsAddModalOpen(false);
            fetchData();
            // Reset form
            setFormData({ make: '', model: '', year: '', color: '', plate_number: '', last_seen_location: '', description: '', status: 'missing', last_seen_lat: '', last_seen_lng: '' });
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
            <div className="flex-between" style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>لوحة التحكم</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>أهلاً بك، {allowedUsers.length} مشرفين نشطين</p>
                </div>
                <button onClick={handleLogout} className="btn" style={{ color: 'var(--status-error)' }}>
                    <LogOut size={18} /> خروج
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'overview', label: 'الإحصائيات', icon: BarChart2 },
                    { id: 'heatmap', label: 'الخريطة الحرارية', icon: MapIcon },
                    { id: 'cases', label: 'إدارة البلاغات', icon: List },
                    { id: 'users', label: 'المشرفين', icon: Users },
                    { id: 'reports', label: 'البلاغات السرية', icon: Shield },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`glass flex-center ${activeTab === tab.id ? 'active-tab' : ''}`}
                        style={{
                            padding: '1.5rem', flexDirection: 'column', gap: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: activeTab === tab.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                            background: activeTab === tab.id ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            textShadow: activeTab === tab.id ? '0 0 10px rgba(251, 191, 36, 0.8)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <tab.icon size={24} color={activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.5px' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Active Tab: Overview */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>توزيع الحالات</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>ملخص سريع</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <StatCard title="إجمالي البلاغات" value={stats.total} />
                            <StatCard title="تم الحل" value={stats.found} color="var(--status-success)" />
                            <StatCard title="مفقودات نشطة" value={stats.missing} color="var(--status-error)" />
                            <StatCard title="تحت البحث" value={stats.stolen} color="var(--accent-secondary)" />
                        </div>
                    </div>
                </div>
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
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3>سجل البلاغات ({cars.length})</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary"><Plus size={16} /> إضافة جديد</button>
                            <button onClick={exportExcel} className="btn btn-outline"><Download size={16} /> Excel</button>
                            <button onClick={exportPDF} className="btn btn-outline"><Download size={16} /> PDF</button>
                            <button onClick={printDailyReport} className="btn btn-primary" style={{ background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)', color: 'white', textShadow: 'none' }}><FileText size={16} /> التقرير اليومي</button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>المركبة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>اللوحة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>الحالة</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>الموقع</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map(car => (
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
                    </div>
                </div>
            )}

            {/* Active Tab: Users */}
            {activeTab === 'users' && (
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                    <h3>إدارة المشرفين</h3>
                    <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', maxWidth: '500px' }}>
                        <input className="input-field" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder=" البريد الإلكتروني..." required style={{ flex: 1 }} />
                        <button className="btn btn-primary">إضافة</button>
                    </form>

                    <div style={{ display: 'grid', gap: '0.5rem', maxWidth: '600px' }}>
                        {allowedUsers.map(u => (
                            <div key={u.id} className="flex-between" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                <span>{u.email}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--status-success)' }}>مشرف نشط</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Tab: Reports */}
            {activeTab === 'reports' && (
                <ReportViewer />
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>إضافة بلاغ جديد</h2>
                        <form onSubmit={handleSubmitCar} style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input className="input-field" placeholder="الماركة" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} required />
                                <input className="input-field" placeholder="الموديل" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                            </div>
                            <input className="input-field" placeholder="سنة الصنع" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                            <input className="input-field" placeholder="رقم اللوحة" value={formData.plate_number} onChange={e => setFormData({ ...formData, plate_number: e.target.value })} required />
                            <input className="input-field" placeholder="اللون" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                            <input className="input-field" placeholder="الموقع" value={formData.last_seen_location} onChange={e => setFormData({ ...formData, last_seen_location: e.target.value })} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input className="input-field" type="number" step="any" placeholder="Latitude (اختياري)" value={formData.last_seen_lat} onChange={e => setFormData({ ...formData, last_seen_lat: e.target.value })} />
                                <input className="input-field" type="number" step="any" placeholder="Longitude (اختياري)" value={formData.last_seen_lng} onChange={e => setFormData({ ...formData, last_seen_lng: e.target.value })} />
                            </div>
                            <textarea className="input-field" placeholder="تفاصيل..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                            <input type="file" onChange={e => setImageFile(e.target.files[0])} style={{ color: '#fff' }} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? 'جاري الحفظ...' : 'حفظ'}</button>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
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
