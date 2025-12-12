import { supabase } from '../lib/supabaseClient';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'missing-cars-secret-key-2024';

export const enableTwoFactor = async (userEmail) => {
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { error } = await supabase
            .from('user_security')
            .insert({
                user_email: userEmail,
                two_factor_enabled: true,
                two_factor_code: code,
                two_factor_verified: false,
                code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            });

        if (error) throw error;

        return {
            success: true,
            code: code,
            message: 'تم إنشاء رمز المصادقة. أدخله في التطبيق'
        };
    } catch (err) {
        console.error('Error enabling 2FA:', err);
        return { success: false, error: err.message };
    }
};

export const verifyTwoFactor = async (userEmail, code) => {
    try {
        const { data: security, error: fetchError } = await supabase
            .from('user_security')
            .select('*')
            .eq('user_email', userEmail)
            .eq('two_factor_code', code)
            .single();

        if (fetchError) throw new Error('رمز غير صحيح');

        if (new Date(security.code_expires_at) < new Date()) {
            throw new Error('انتهت صلاحية الرمز');
        }

        const { error: updateError } = await supabase
            .from('user_security')
            .update({ two_factor_verified: true })
            .eq('id', security.id);

        if (updateError) throw updateError;

        return { success: true, message: 'تم التحقق بنجاح' };
    } catch (err) {
        console.error('Error verifying 2FA:', err);
        return { success: false, error: err.message };
    }
};

export const encryptSensitiveData = (data) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    } catch (err) {
        console.error('Encryption error:', err);
        return null;
    }
};

export const decryptSensitiveData = (encrypted) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (err) {
        console.error('Decryption error:', err);
        return null;
    }
};

export const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
};

export const generateSecureToken = () => {
    return CryptoJS.lib.WordArray.random(32).toString();
};

export const logSecurityEvent = async (userEmail, eventType, description) => {
    try {
        const { error } = await supabase
            .from('security_logs')
            .insert({
                user_email: userEmail,
                event_type: eventType,
                description: description,
                ip_address: await getClientIP(),
                user_agent: navigator.userAgent,
                logged_at: new Date().toISOString()
            });

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error logging security event:', err);
        return { success: false, error: err.message };
    }
};

export const getClientIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (err) {
        return 'unknown';
    }
};

export const checkPasswordStrength = (password) => {
    let strength = 0;
    const feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');

    if (password.length >= 12) strength++;

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('أضف أحرف كبيرة');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('أضف أرقام');

    if (/[!@#$%^&*]/.test(password)) strength++;
    else feedback.push('أضف علامات خاصة (!@#$%^&*)');

    const strengthLevels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];

    return {
        score: strength,
        level: strengthLevels[strength],
        feedback: feedback
    };
};

export const setupSessionTimeout = (timeoutMinutes = 30) => {
    let timeoutId;

    const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            logSecurityEvent('unknown', 'session_timeout', 'انتهت جلسة المستخدم بسبب عدم النشاط');
            window.location.href = '/';
        }, timeoutMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keypress', resetTimer);
        window.removeEventListener('click', resetTimer);
    };
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
};
