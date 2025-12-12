import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, AlertCircle } from 'lucide-react';

const ReportViewer = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            // Fetch reports and join with cars table to get car details
            // Note: This requires the foreign key relationship to be detected by Supabase
            const { data, error } = await supabase
                .from('case_reports')
                .select('*, cars(make, model, plate_number, year)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reports:', error);
            } else {
                setReports(data || []);
            }
            setLoading(false);
        };

        fetchReports();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>جاري تحميل البلاغات...</div>;

    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--status-success)" />
                    البلاغات السرية والشكاوى ({reports.length})
                </h3>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {reports.length > 0 ? (
                    reports.map(report => (
                        <div key={report.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-sm)',
                            borderRight: `4px solid ${report.report_type === 'sighting' ? 'var(--status-success)' : 'var(--status-error)'}`
                        }}>
                            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {report.report_type === 'sighting' ? 'مشاهدة محتملة' : report.report_type === 'suspect' ? 'معلومة عن مشتبه به' : 'معلومة عامة'}
                                    </h4>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {report.cars && (
                                    <a href={`/car/${report.car_id}`} style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>
                                        بخصوص: {report.cars.make} {report.cars.model} ({report.cars.plate_number})
                                    </a>
                                )}
                            </div>

                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                                {report.description}
                            </p>

                            {report.contact_info && (
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                    <span style={{ color: 'var(--status-success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        للتواصل: {report.contact_info}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
                        <p>لا توجد بلاغات سرية لعرضها حالياً.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportViewer;
