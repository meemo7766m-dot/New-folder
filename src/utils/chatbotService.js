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
    RATINGS: 'ratings',
    COMPLAINTS: 'complaints',
    MEDIA_UPLOAD: 'media_upload',
    IMAGE_SEARCH: 'image_search',
    UNKNOWN: 'unknown'
};

const keywords = {
    [intents.SEARCH_CAR]: ['ابحث', 'بحث', 'أين', 'موقع', 'مفقود', 'ضائع', 'سيارة', 'العثور', 'ابحث عن', 'أوجد', 'فين', 'وين'],
    [intents.REPORT_CAR]: ['أبلغ', 'بلاغ', 'أود أن أبلغ', 'أريد الإبلاغ', 'إبلاغ', 'تقرير', 'أبلغ عن', 'سأبلغ'],
    [intents.GET_HELP]: ['ساعد', 'مساعدة', 'أحتاج مساعدة', 'كيف', 'كيفية', 'شرح', 'تساعدني', 'أساعدك'],
    [intents.FAQ]: ['سؤال', 'استفسار', 'ماذا', 'ما هو', 'هل', 'الأسئلة الشائعة', 'سؤال شامل'],
    [intents.INVESTIGATION]: ['محقق', 'تحقيق', 'محقق متخصص', 'احجز محقق', 'أريد محقق', 'أحتاج محقق'],
    [intents.ALERT_SETUP]: ['تنبيهات', 'تنبيه', 'إخطار', 'أريد تنبيهات', 'الإشعارات', 'نبهني', 'أخبرني'],
    [intents.WITNESS]: ['شاهد', 'رأيت', 'مشهود', 'معلومات', 'رؤية', 'شهادة', 'شهود', 'رايت سيارة'],
    [intents.GREETING]: ['السلام', 'مرحبا', 'هاي', 'صباح', 'مساء', 'تحية', 'أهلا', 'والسلام'],
    [intents.RATINGS]: ['تقييم', 'تقيم', 'قيم', 'رأيك', 'انطباعك', 'ملاحظاتك'],
    [intents.COMPLAINTS]: ['شكوى', 'شكاوى', 'اقتراح', 'مشكلة', 'خطأ', 'عيب', 'مشاكل'],
    [intents.MEDIA_UPLOAD]: ['صورة', 'صور', 'فيديو', 'فيديوهات', 'رفع', 'أرفع', 'أحمل'],
    [intents.IMAGE_SEARCH]: ['البحث بالصورة', 'بحث بصورة', 'ابحث بصورة', 'صورة السيارة', 'اعتماد على صورة']
};

const responses = {
    [intents.SEARCH_CAR]: {
        text: 'سأساعدك في البحث عن السيارة المفقودة 🔍\nيمكنك البحث بطرق مختلفة:',
        suggestions: [
            { text: 'ابحث برقم اللوحة', action: 'search_plate' },
            { text: 'ابحث بالماركة والموديل', action: 'search_model' },
            { text: 'ابحث بالمدينة', action: 'search_location' },
            { text: 'ابحث بالصورة', action: 'image_search' }
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
        text: 'أهلاً وسهلاً! 👋 أنا المساعد الذكي وهنا لمساعدتك في البحث عن السيارات المفقودة والإبلاغ عنها. كيف يمكنني مساعدتك؟',
        suggestions: [
            { text: 'ابحث عن سيارة', action: 'search' },
            { text: 'ابلغ عن سيارة', action: 'report' },
            { text: 'أريد شهادة شاهد', action: 'witness' },
            { text: 'أرني جميع الخدمات', action: 'help' }
        ],
        action: 'greeting'
    },
    [intents.RATINGS]: {
        text: 'شكراً لك على تقييمك! تقييماتك تساعدنا في تحسين الخدمات 🌟',
        suggestions: [
            { text: 'قيم خدمة', action: 'rate_service' },
            { text: 'اعرض التقييمات', action: 'view_ratings' },
            { text: 'عودة للقائمة الرئيسية', action: 'help' }
        ],
        action: 'ratings'
    },
    [intents.COMPLAINTS]: {
        text: 'نحن نقدر ملاحظاتك وشكاويك لأنها تساعدنا على التحسن 💬',
        suggestions: [
            { text: 'أرسل شكوى', action: 'submit_complaint' },
            { text: 'اقترح ميزة جديدة', action: 'suggest_feature' },
            { text: 'ابلغ عن خطأ', action: 'report_bug' }
        ],
        action: 'complaints'
    },
    [intents.MEDIA_UPLOAD]: {
        text: 'يمكنك رفع صور وفيديوهات للسيارات المفقودة لمساعدة في البحث 📸',
        suggestions: [
            { text: 'رفع صور الآن', action: 'upload_media' },
            { text: 'معلومات عن الصور المدعومة', action: 'media_info' }
        ],
        action: 'media'
    },
    [intents.IMAGE_SEARCH]: {
        text: 'البحث بالصورة يساعدك في إيجاد سيارات مشابهة بناءً على الألوان والشكل 🖼️',
        suggestions: [
            { text: 'ابدأ البحث بصورة', action: 'start_image_search' },
            { text: 'كيفية استخدام البحث بالصورة', action: 'image_search_help' }
        ],
        action: 'image_search'
    },
    [intents.UNKNOWN]: {
        text: 'معذرة، لم أفهم سؤالك بوضوح تماماً 🤔 لكن يمكنك اختيار مما يلي:',
        suggestions: [
            { text: 'ابحث عن سيارة', action: 'search' },
            { text: 'ابلغ عن سيارة', action: 'report' },
            { text: 'اعرض الخدمات', action: 'help' },
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
        if (!query || query.trim().length === 0) {
            return [];
        }

        const searchQuery = query.toLowerCase().trim();
        
        let queryBuilder = supabase
            .from('cars')
            .select('id, year, make, model, status, license_plate, color');

        const { data, error } = await queryBuilder
            .or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,license_plate.ilike.%${searchQuery}%,color.ilike.%${searchQuery}%`)
            .eq('status', 'missing')
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error searching cars:', err);
        return [];
    }
};

export const extractSearchTerms = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    const years = message.match(/\d{4}/g) || [];
    
    const carBrands = ['تويوتا', 'هونداي', 'بي إم دبليو', 'مرسيدس', 'نيسان', 'كيا', 'هيونداي', 'فورد', 'شيفروليه'];
    const foundBrands = carBrands.filter(brand => message.includes(brand));
    
    const colors = ['أبيض', 'أسود', 'رمادي', 'فضي', 'أحمر', 'أزرق', 'بني', 'بيج'];
    const foundColors = colors.filter(color => message.includes(color));
    
    const plateMatch = message.match(/([أ-ي]{1,3}\s*\d{1,3}\s*[أ-ي]{1,2})/g) || [];
    
    return {
        years,
        brands: foundBrands,
        colors: foundColors,
        plates: plateMatch,
        fullQuery: message
    };
};

export const generateSmartResponse = async (userMessage, intent) => {
    const searchTerms = extractSearchTerms(userMessage);
    
    if (intent === intents.SEARCH_CAR && searchTerms.fullQuery.length > 0) {
        const results = await searchCars(searchTerms.fullQuery);
        
        if (results.length > 0) {
            const resultText = results.map(car => 
                `${car.year} ${car.make} ${car.model} - ${car.license_plate} (${car.color})`
            ).join('\n');
            
            return {
                text: `وجدت ${results.length} سيارة مفقودة تطابق البحث:\n${resultText}`,
                hasResults: true,
                results
            };
        } else {
            return {
                text: 'للأسف لم أجد سيارات تطابق بحثك. حاول البحث برقم لوحة أو علامة مختلفة.',
                hasResults: false,
                results: []
            };
        }
    }
    
    return generateResponse(intent);
};
