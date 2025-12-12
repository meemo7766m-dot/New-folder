import { supabase } from '../lib/supabaseClient';

export const getSecurityAgencies = async () => {
    try {
        const { data, error } = await supabase
            .from('security_agencies')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching agencies:', err);
        return [];
    }
};

export const shareCarWithAgency = async (carId, agencyId, caseData = {}) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const { data: caseShare, error } = await supabase
            .from('case_shares')
            .insert([{
                car_id: carId,
                agency_id: agencyId,
                shared_by: userId,
                status: 'pending',
                shared_data: caseData
            }])
            .select();

        if (error) throw error;

        return {
            success: true,
            data: caseShare[0],
            message: 'تم مشاركة البلاغ مع الجهة الأمنية بنجاح'
        };
    } catch (err) {
        console.error('Error sharing case:', err);
        return {
            success: false,
            error: err.message,
            message: 'خطأ في مشاركة البلاغ'
        };
    }
};

export const getSharedCases = async () => {
    try {
        const { data, error } = await supabase
            .from('case_shares')
            .select('*, cars(*), security_agencies(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching shared cases:', err);
        return [];
    }
};

export const updateCaseShareStatus = async (caseShareId, status, externalCaseId = null) => {
    try {
        const { data, error } = await supabase
            .from('case_shares')
            .update({
                status,
                external_case_id: externalCaseId,
                last_updated: new Date().toISOString()
            })
            .eq('id', caseShareId)
            .select();

        if (error) throw error;
        return data[0];
    } catch (err) {
        console.error('Error updating case share:', err);
        throw err;
    }
};

export const syncWithExternalAPI = async (agencyId, caseData) => {
    try {
        const { data: agency, error: agencyError } = await supabase
            .from('security_agencies')
            .select('*')
            .eq('id', agencyId)
            .single();

        if (agencyError) throw agencyError;
        if (!agency.api_endpoint) {
            return {
                success: false,
                message: 'لم يتم تحديد API endpoint لهذه الجهة'
            };
        }

        const requestBody = {
            timestamp: new Date().toISOString(),
            source: 'missing_cars_platform',
            case_data: caseData
        };

        const response = await fetch(agency.api_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agency.api_key_encrypted}`,
                'X-API-Version': '1.0'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        return {
            success: true,
            data: responseData,
            message: 'تم مزامنة البيانات بنجاح مع الجهة الأمنية'
        };
    } catch (err) {
        console.error('Error syncing with external API:', err);
        return {
            success: false,
            error: err.message,
            message: 'خطأ في مزامنة البيانات مع الجهة الأمنية'
        };
    }
};

export const createSecurityAgency = async (agencyData) => {
    try {
        const { data, error } = await supabase
            .from('security_agencies')
            .insert([{
                name: agencyData.name,
                code: agencyData.code,
                api_endpoint: agencyData.apiEndpoint,
                api_key_encrypted: agencyData.apiKey,
                contact_email: agencyData.email,
                contact_phone: agencyData.phone,
                country: agencyData.country,
                region: agencyData.region
            }])
            .select();

        if (error) throw error;
        return {
            success: true,
            data: data[0],
            message: 'تم إضافة الجهة الأمنية بنجاح'
        };
    } catch (err) {
        console.error('Error creating agency:', err);
        return {
            success: false,
            error: err.message,
            message: 'خطأ في إضافة الجهة الأمنية'
        };
    }
};

export const updateSecurityAgency = async (agencyId, agencyData) => {
    try {
        const { data, error } = await supabase
            .from('security_agencies')
            .update({
                name: agencyData.name,
                api_endpoint: agencyData.apiEndpoint,
                contact_email: agencyData.email,
                contact_phone: agencyData.phone,
                region: agencyData.region,
                is_active: agencyData.isActive
            })
            .eq('id', agencyId)
            .select();

        if (error) throw error;
        return {
            success: true,
            data: data[0],
            message: 'تم تحديث الجهة الأمنية بنجاح'
        };
    } catch (err) {
        console.error('Error updating agency:', err);
        return {
            success: false,
            error: err.message,
            message: 'خطأ في تحديث الجهة الأمنية'
        };
    }
};

export const generateCaseShareReport = (carData, shareData) => {
    return {
        car: {
            id: carData.id,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            color: carData.color,
            plate_number: carData.plate_number,
            vin: carData.vin,
            last_seen_location: carData.last_seen_location,
            last_seen_date: carData.last_seen_date,
            status: carData.status
        },
        report: {
            reporter_id: shareData.shared_by,
            report_type: shareData.shared_data?.type || 'general',
            shared_at: shareData.created_at,
            share_id: shareData.id
        },
        metadata: {
            platform: 'missing_cars_system',
            version: '1.0',
            timestamp: new Date().toISOString()
        }
    };
};

export const validateAgencyAPIConfig = async (apiEndpoint, apiKey) => {
    try {
        const response = await fetch(`${apiEndpoint}/health`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Version': '1.0'
            }
        });

        return {
            valid: response.ok,
            status: response.status,
            message: response.ok ? 'API Connection successful' : 'API Connection failed'
        };
    } catch (err) {
        return {
            valid: false,
            error: err.message,
            message: 'Failed to validate API configuration'
        };
    }
};

export const getBatchCaseStats = async () => {
    try {
        const { data, error } = await supabase
            .from('case_shares')
            .select('status, created_at');

        if (error) throw error;

        const stats = {
            total: data.length,
            pending: data.filter(c => c.status === 'pending').length,
            shared: data.filter(c => c.status === 'shared').length,
            acknowledged: data.filter(c => c.status === 'acknowledged').length,
            rejected: data.filter(c => c.status === 'rejected').length
        };

        return stats;
    } catch (err) {
        console.error('Error fetching stats:', err);
        return {
            total: 0,
            pending: 0,
            shared: 0,
            acknowledged: 0,
            rejected: 0
        };
    }
};
