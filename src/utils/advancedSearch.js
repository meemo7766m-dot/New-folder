import { supabase } from '../lib/supabaseClient';

const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return new SpeechRecognition();
};

export const startVoiceSearch = async (onResult, onError) => {
    try {
        const recognition = initializeSpeechRecognition();

        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event) => {
            onError('خطأ في التعرف الصوتي: ' + event.error);
        };

        recognition.start();

        return { success: true, recognition };
    } catch (err) {
        onError('الميزة الصوتية غير مدعومة في هذا المتصفح');
        return { success: false, error: err.message };
    }
};

export const extractSearchParameters = (voiceText) => {
    const carBrands = ['تويوتا', 'هونداي', 'نيسان', 'بي إم دبليو', 'مرسيدس', 'كيا', 'فورد', 'شيفروليه', 'هيونداي'];
    const colors = ['أحمر', 'أسود', 'أبيض', 'رمادي', 'فضي', 'أزرق', 'بني', 'بيج', 'أصفر', 'أخضر'];
    const arabicNumbers = {
        'صفر': '0', 'واحد': '1', 'اثنين': '2', 'ثلاثة': '3', 'أربعة': '4',
        'خمسة': '5', 'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تسعة': '9'
    };

    const textLower = voiceText.toLowerCase();
    const params = {
        brand: null,
        color: null,
        year: null,
        plateNumber: null
    };

    carBrands.forEach(brand => {
        if (textLower.includes(brand.toLowerCase())) {
            params.brand = brand;
        }
    });

    colors.forEach(color => {
        if (textLower.includes(color.toLowerCase())) {
            params.color = color;
        }
    });

    const yearMatch = textLower.match(/\d{4}/);
    if (yearMatch) {
        params.year = parseInt(yearMatch[0]);
    }

    const plateMatch = textLower.match(/\d{3,6}/);
    if (plateMatch) {
        params.plateNumber = plateMatch[0];
    }

    return params;
};

export const searchByVoice = async (voiceText) => {
    try {
        const params = extractSearchParameters(voiceText);

        let query = supabase.from('cars').select('*').eq('status', 'missing');

        if (params.brand) {
            query = query.ilike('make', `%${params.brand}%`);
        }

        if (params.color) {
            query = query.ilike('color', `%${params.color}%`);
        }

        if (params.year) {
            query = query.eq('year', params.year);
        }

        if (params.plateNumber) {
            query = query.ilike('license_plate', `%${params.plateNumber}%`);
        }

        const { data: cars, error } = await query.limit(20);

        if (error) throw error;

        return {
            success: true,
            cars: cars || [],
            extractedParams: params,
            query: voiceText
        };
    } catch (err) {
        console.error('Voice search error:', err);
        return {
            success: false,
            error: err.message,
            cars: []
        };
    }
};

export const searchByFeatures = async (features) => {
    try {
        let query = supabase.from('cars').select('*').eq('status', 'missing');

        if (features.make) {
            query = query.ilike('make', `%${features.make}%`);
        }

        if (features.model) {
            query = query.ilike('model', `%${features.model}%`);
        }

        if (features.color) {
            query = query.ilike('color', `%${features.color}%`);
        }

        if (features.year) {
            query = query.eq('year', features.year);
        }

        if (features.bodyType) {
            query = query.ilike('body_type', `%${features.bodyType}%`);
        }

        const { data: cars, error } = await query.limit(20);

        if (error) throw error;

        return {
            success: true,
            cars: cars || []
        };
    } catch (err) {
        console.error('Feature search error:', err);
        return {
            success: false,
            error: err.message,
            cars: []
        };
    }
};

export const saveSearchHistory = async (userEmail, searchQuery, searchType, resultsCount) => {
    try {
        const { error } = await supabase
            .from('search_history')
            .insert({
                user_email: userEmail,
                search_query: searchQuery,
                search_type: searchType,
                results_count: resultsCount,
                searched_at: new Date().toISOString()
            });

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error saving search history:', err);
        return { success: false, error: err.message };
    }
};

export const getSearchHistory = async (userEmail) => {
    try {
        const { data: history, error } = await supabase
            .from('search_history')
            .select('*')
            .eq('user_email', userEmail)
            .order('searched_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        return { success: true, history: history || [] };
    } catch (err) {
        console.error('Error fetching search history:', err);
        return { success: false, error: err.message, history: [] };
    }
};
