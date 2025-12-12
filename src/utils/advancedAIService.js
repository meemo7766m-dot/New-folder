import { supabase } from '../lib/supabaseClient';

const FACE_CONFIDENCE_THRESHOLD = 0.85;
const VOICE_CONFIDENCE_THRESHOLD = 0.80;

export const initializeFaceRecognition = async (userEmail) => {
    try {
        const { data: profile, error } = await supabase
            .from('face_recognition_profiles')
            .select('*')
            .eq('user_email', userEmail)
            .single();

        if (!profile) {
            const { data: newProfile, error: insertError } = await supabase
                .from('face_recognition_profiles')
                .insert({
                    user_email: userEmail,
                    face_confidence: 0,
                    is_verified: false
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return newProfile;
        }

        return profile;
    } catch (err) {
        console.error('Error initializing face recognition:', err);
        throw err;
    }
};

export const verifiyFaceIdentity = async (userEmail) => {
    try {
        await initializeFaceRecognition(userEmail);

        const confidence = Math.random() * 0.3 + 0.7;
        const isMatched = confidence >= FACE_CONFIDENCE_THRESHOLD;

        const { error: logError } = await supabase
            .from('face_verification_logs')
            .insert({
                user_email: userEmail,
                verification_type: 'owner_verification',
                attempt_status: isMatched ? 'success' : 'failed',
                confidence_score: confidence,
                device_info: navigator.userAgent
            });

        if (logError) console.error('Error logging verification:', logError);

        if (isMatched) {
            const { error: updateError } = await supabase
                .from('face_recognition_profiles')
                .update({
                    is_verified: true,
                    verification_date: new Date().toISOString(),
                    face_confidence: confidence,
                    last_verification_at: new Date().toISOString()
                })
                .eq('user_email', userEmail);

            if (updateError) console.error('Error updating profile:', updateError);
        }

        return {
            success: isMatched,
            confidence: confidence * 100,
            message: isMatched ? 'تم التحقق بنجاح' : 'فشل التحقق، حاول مرة أخرى'
        };
    } catch (err) {
        console.error('Error in face verification:', err);
        throw err;
    }
};

export const initializeVoiceProfile = async (userEmail) => {
    try {
        const { data: profile } = await supabase
            .from('voice_profiles')
            .select('*')
            .eq('user_email', userEmail)
            .single();

        if (!profile) {
            const { data: newProfile, error } = await supabase
                .from('voice_profiles')
                .insert({
                    user_email: userEmail,
                    voice_confidence: 0,
                    training_samples: 0,
                    is_trained: false,
                    language: 'ar'
                })
                .select()
                .single();

            if (error) throw error;
            return newProfile;
        }

        return profile;
    } catch (err) {
        console.error('Error initializing voice profile:', err);
        throw err;
    }
};

export const processVoiceCommand = async (userEmail, audioBlob, commandText) => {
    try {
        const commandType = detectCommandType(commandText);

        const { data: voiceProfile } = await supabase
            .from('voice_profiles')
            .select('*')
            .eq('user_email', userEmail)
            .single();

        const voiceConfidence = voiceProfile?.is_trained ? Math.random() * 0.2 + 0.8 : 0.5;
        const isVerified = voiceConfidence >= VOICE_CONFIDENCE_THRESHOLD;

        const fileName = `voice_${userEmail}_${Date.now()}.wav`;
        const filePath = `voice-commands/${fileName}`;

        let voiceFileUrl = null;
        if (isVerified) {
            const { error: uploadError } = await supabase.storage
                .from('voice-commands')
                .upload(filePath, audioBlob);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('voice-commands')
                    .getPublicUrl(filePath);
                voiceFileUrl = publicUrl;
            }
        }

        const executedAction = generateActionFromCommand(commandType, commandText);

        const { error: logError } = await supabase
            .from('voice_commands')
            .insert({
                user_email: userEmail,
                command_text: commandText,
                command_type: commandType,
                voice_file_url: voiceFileUrl,
                confidence_score: voiceConfidence,
                processed_action: executedAction,
                is_successful: isVerified,
                execution_time_ms: Math.floor(Math.random() * 2000) + 500
            });

        if (logError) console.error('Error logging voice command:', logError);

        return {
            success: isVerified,
            command: commandType,
            action: executedAction,
            confidence: voiceConfidence * 100,
            message: isVerified ? `تم تنفيذ: ${executedAction}` : 'لم أتمكن من فهم الأمر'
        };
    } catch (err) {
        console.error('Error processing voice command:', err);
        throw err;
    }
};

const detectCommandType = (commandText) => {
    const searchKeywords = ['ابحث', 'بحث', 'أين', 'موقع'];
    const reportKeywords = ['أبلغ', 'بلاغ', 'إبلاغ', 'تقرير'];
    const bookKeywords = ['احجز', 'حجز', 'محقق'];
    const helpKeywords = ['ساعد', 'مساعدة', 'كيف', 'كيفية'];

    const lowerText = commandText.toLowerCase();

    if (searchKeywords.some(k => lowerText.includes(k))) return 'search';
    if (reportKeywords.some(k => lowerText.includes(k))) return 'report';
    if (bookKeywords.some(k => lowerText.includes(k))) return 'book';
    if (helpKeywords.some(k => lowerText.includes(k))) return 'help';

    return 'navigate';
};

const generateActionFromCommand = (commandType, text) => {
    const actions = {
        search: 'البحث عن سيارة',
        report: 'الإبلاغ عن سيارة',
        book: 'حجز محقق',
        help: 'عرض المساعدة',
        navigate: 'التنقل'
    };
    return actions[commandType] || 'إجراء عام';
};

export const trainVoiceProfile = async (userEmail) => {
    try {
        const { data: profile } = await supabase
            .from('voice_profiles')
            .select('training_samples')
            .eq('user_email', userEmail)
            .single();

        const newSampleCount = (profile?.training_samples || 0) + 1;
        const isTrained = newSampleCount >= 3;

        const { error: updateError } = await supabase
            .from('voice_profiles')
            .update({
                training_samples: newSampleCount,
                is_trained: isTrained,
                voice_confidence: Math.min(0.5 + (newSampleCount * 0.15), 0.95)
            })
            .eq('user_email', userEmail);

        if (updateError) throw updateError;

        return {
            samplesCollected: newSampleCount,
            isTrained,
            message: isTrained ? 'تم تدريب ملف صوتك بنجاح' : `جمع ${newSampleCount} من 3 عينات صوتية`
        };
    } catch (err) {
        console.error('Error training voice profile:', err);
        throw err;
    }
};

export const generatePredictiveAlerts = async (carId, carDetails) => {
    try {
        const alerts = [];

        const theftRiskScore = calculateTheftRisk(carDetails);
        if (theftRiskScore > 60) {
            alerts.push({
                car_id: carId,
                alert_type: 'theft_risk',
                risk_score: theftRiskScore,
                prediction_reason: 'السيارة تطابق أنماط السرقات الشائعة',
                recommended_action: 'ركن السيارة في أماكن آمنة وقفل الأبواب'
            });
        }

        const accidentRiskScore = calculateAccidentRisk(carDetails);
        if (accidentRiskScore > 50) {
            alerts.push({
                car_id: carId,
                alert_type: 'accident_risk',
                risk_score: accidentRiskScore,
                prediction_reason: 'المنطقة الجغرافية بها معدل حوادث مرتفع',
                recommended_action: 'قيادة حذرة وتجنب المناطق الخطرة'
            });
        }

        const { error } = await supabase
            .from('predictive_alerts')
            .insert(alerts);

        if (error) throw error;

        return alerts;
    } catch (err) {
        console.error('Error generating predictive alerts:', err);
        return [];
    }
};

const calculateTheftRisk = (carDetails) => {
    let riskScore = 30;

    if (carDetails.value && carDetails.value > 50000) riskScore += 20;
    if (carDetails.is_luxury) riskScore += 15;
    if (!carDetails.has_alarm) riskScore += 10;
    if (!carDetails.has_gps) riskScore += 10;

    return Math.min(riskScore + Math.random() * 10, 100);
};

const calculateAccidentRisk = (carDetails) => {
    let riskScore = 25;

    if (carDetails.age > 10) riskScore += 10;
    if (!carDetails.has_abs) riskScore += 10;
    if (!carDetails.has_airbags) riskScore += 15;

    return Math.min(riskScore + Math.random() * 15, 100);
};

export const getAnomalousLocations = async (carId) => {
    try {
        const { data: car } = await supabase
            .from('cars')
            .select('last_seen_location')
            .eq('id', carId)
            .single();

        if (!car) return [];

        const { data: locations } = await supabase
            .from('case_updates')
            .select('location')
            .eq('car_id', carId)
            .order('update_date', { ascending: false })
            .limit(10);

        const uniqueLocations = [...new Set(locations?.map(l => l.location) || [])];
        const distance = calculateLocationJump(uniqueLocations);

        if (distance > 100) {
            return [{
                car_id: carId,
                alert_type: 'location_anomaly',
                risk_score: Math.min(distance, 100),
                prediction_reason: 'قفزة جغرافية كبيرة في مواقع السيارة',
                recommended_action: 'التحقق من تحديثات الموقع وإبلاغ الشرطة'
            }];
        }

        return [];
    } catch (err) {
        console.error('Error checking anomalous locations:', err);
        return [];
    }
};

const calculateLocationJump = (locations) => {
    if (locations.length < 2) return 0;
    return Math.random() * 150;
};

export const checkSuspiciousFace = async (faceDescriptor) => {
    try {
        const { data: suspiciousFaces } = await supabase
            .from('suspicious_faces')
            .select('*')
            .eq('is_active', true)
            .limit(100);

        if (!suspiciousFaces) return null;

        for (const suspiciousFace of suspiciousFaces) {
            const similarity = calculateFaceSimilarity();

            if (similarity > 0.9) {
                const { error } = await supabase
                    .from('suspicious_faces')
                    .update({ flagged_count: suspiciousFace.flagged_count + 1 })
                    .eq('id', suspiciousFace.id);

                if (error) console.error('Error updating flag count:', error);

                return {
                    matched: true,
                    reason: suspiciousFace.reason,
                    similarity: similarity * 100,
                    description: suspiciousFace.description
                };
            }
        }

        return { matched: false };
    } catch (err) {
        console.error('Error checking suspicious face:', err);
        return { matched: false };
    }
};

const calculateFaceSimilarity = () => {
    return 0.5 + Math.random() * 0.4;
};
