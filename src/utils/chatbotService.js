import { supabase } from '../lib/supabaseClient';

const intents = {
    SEARCH_CAR: 'search_car',
    REPORT_CAR: 'report_car',
    GET_HELP: 'get_help',
    FAQ: 'faq',
    INVESTIGATION: 'investigation',
    ALERT_SETUP: 'alert_setup',
    WITNESS: 'witness',
    GREETING: 'greeting',
    UNKNOWN: 'unknown'
};

const keywords = {
    [intents.SEARCH_CAR]: ['ابحث', 'بحث', 'أين', 'موقع', 'مفقود', 'ضائع', 'سيارة', 'العثور', 'ابحث عن'],
    [intents.REPORT_CAR]: ['أبلغ', 'بلاغ', 'أود أن أبلغ', 'أريد الإبلاغ', 'إبلاغ', 'تقرير'],
    [intents.GET_HELP]: ['ساعد', 'مساعدة', 'أحتاج مساعدة', 'كيف', 'كيفية', 'شرح'],
    [intents.FAQ]: ['سؤال', 'استفسار', 'ماذا', 'ما هو', 'هل', 'الأسئلة الشائعة'],
    [intents.INVESTIGATION]: ['محقق', 'تحقيق', 'محقق متخصص', 'احجز محقق', 'أريد محقق'],
    [intents.ALERT_SETUP]: ['تنبيهات', 'تنبيه', 'إخطار', 'أريد تنبيهات', 'الإشعارات'],
    [intents.WITNESS]: ['شاهد', 'رأيت', 'مشهود', 'معلومات', 'رؤية'],
    [intents.GREETING]: ['السلام', 'مرحبا', 'هاي', 'صباح', 'مساء', 'تحية']
};

const responses = {
    [intents.SEARCH_CAR]: {
        text: 'سأساعدك في البحث عن السيارة المفقودة 🔍',
        suggestions: [
            { text: 'ابحث برقم اللوحة', action: 'search_plate' },
            { text: 'ابحث بالماركة والموديل', action: 'search_model' },
            { text: 'ابحث بالمدينة', action: 'search_location' }
        ],
        action: 'search'
    },
    [intents.REPORT_CAR]: {
        text: 'سأساعدك في الإبلاغ عن سيارة مفقودة 📋',
        suggestions: [
            { text: 'أبلغ عن سيارتي المفقودة', action: 'report_own_car' },
            { text: 'أبلغ عن سيارة أخرى', action: 'report_other_car' },
            { text: 'أضف معلومات لبلاغ موجود', action: 'add_info' }
        ],
        action: 'report'
    },
    [intents.GET_HELP]: {
        text: 'كيف يمكنني مساعدتك؟ 👋',
        suggestions: [
            { text: 'أريد البحث عن سيارة', action: 'search' },
            { text: 'أريد الإبلاغ عن سيارة', action: 'report' },
            { text: 'أريد حجز محقق', action: 'investigator' }
        ],
        action: 'help'
    },
    [intents.FAQ]: {
        text: 'إليك بعض الأسئلة الشائعة:',
        suggestions: [
            { text: 'كيف أبحث عن سيارة؟', action: 'faq_search' },
            { text: 'كيفية الإبلاغ عن سيارة مفقودة؟', action: 'faq_report' },
            { text: 'ما هي خدمات المنصة؟', action: 'faq_services' }
        ],
        action: 'faq'
    },
    [intents.INVESTIGATION]: {
        text: 'نحن نوفر محققين متخصصين في قضايا السيارات المفقودة 👮',
        suggestions: [
            { text: 'عرض المحققين المتاحين', action: 'list_investigators' },
            { text: 'احجز محقق متخصص', action: 'book_investigator' },
            { text: 'معلومات عن الخدمة', action: 'investigation_info' }
        ],
        action: 'investigation'
    },
    [intents.ALERT_SETUP]: {
        text: 'يمكنك إعداد تنبيهات للحصول على إشعارات بالسيارات القريبة من منطقتك 📍',
        suggestions: [
            { text: 'أنشئ تنبيه جديد', action: 'create_alert' },
            { text: 'أدير تنبيهاتي', action: 'manage_alerts' }
        ],
        action: 'alert'
    },
    [intents.WITNESS]: {
        text: 'شكراً لتقديمك معلومات! معلومات الشهود أساسية في حل هذه القضايا 🙏',
        suggestions: [
            { text: 'أضف شهادة لسيارة', action: 'add_witness' },
            { text: 'اعرض الشهادات', action: 'view_witness' }
        ],
        action: 'witness'
    },
    [intents.GREETING]: {
        text: 'أهلاً وسهلاً! 👋 أنا هنا لمساعدتك في البحث عن السيارات المفقودة. كيف يمكنني مساعدتك؟',
        suggestions: [
            { text: 'ابحث عن سيارة', action: 'search' },
            { text: 'ابلغ عن سيارة', action: 'report' },
            { text: 'أرني الخدمات', action: 'help' }
        ],
        action: 'greeting'
    },
    [intents.UNKNOWN]: {
        text: 'معذرة، لم أفهم سؤالك بوضوح. يمكنك اختيار من الخيارات التالية:',
        suggestions: [
            { text: 'ابحث عن سيارة', action: 'search' },
            { text: 'ابلغ عن سيارة', action: 'report' },
            { text: 'اتصل بنا', action: 'contact' }
        ],
        action: 'unknown'
    }
};

export const recognizeIntent = (userMessage) => {
    const message = userMessage.toLowerCase().trim();

    for (const [intent, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (message.includes(word)) {
                return intent;
            }
        }
    }

    return intents.UNKNOWN;
};

export const generateResponse = (intent, context = {}) => {
    const response = responses[intent] || responses[intents.UNKNOWN];
    return {
        ...response,
        intent,
        context
    };
};

export const saveChatMessage = async (conversationId, senderType, messageText, intent = null, entities = null) => {
    try {
        const { error } = await supabase
            .from('chatbot_messages')
            .insert({
                conversation_id: conversationId,
                sender_type: senderType,
                message_text: messageText,
                intent,
                entities,
                message_type: senderType === 'bot' ? 'text' : 'user'
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error saving message:', err);
        return false;
    }
};

export const createConversation = async (userEmail = null, carId = null) => {
    try {
        const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { data, error } = await supabase
            .from('chatbot_conversations')
            .insert({
                user_email: userEmail,
                session_id: sessionId,
                car_id: carId,
                conversation_type: 'general',
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error creating conversation:', err);
        return null;
    }
};

export const getFAQs = async (category = null) => {
    try {
        let query = supabase
            .from('chatbot_faqs')
            .select('*')
            .eq('is_active', true);

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query.limit(5);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching FAQs:', err);
        return [];
    }
};

export const updateConversation = async (conversationId) => {
    try {
        const { error } = await supabase
            .from('chatbot_conversations')
            .update({
                last_message_at: new Date().toISOString(),
                message_count: supabase.rpc('increment_message_count', { conversation_id: conversationId })
            })
            .eq('id', conversationId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error updating conversation:', err);
        return false;
    }
};

export const searchCars = async (query) => {
    try {
        const { data, error } = await supabase
            .from('cars')
            .select('id, year, make, model, status, image_url, last_seen_location')
            .or(`make.ilike.%${query}%,model.ilike.%${query}%,plate_number.ilike.%${query}%`)
            .limit(5);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error searching cars:', err);
        return [];
    }
};
