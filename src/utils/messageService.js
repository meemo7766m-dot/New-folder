import { supabase } from '../lib/supabaseClient';

export const getOrCreateConversation = async (userEmail, otherUserEmail, carId) => {
    try {
        const { data: existingConversation, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('car_id', carId)
            .or(`and(user1_email.eq.${userEmail},user2_email.eq.${otherUserEmail}),and(user1_email.eq.${otherUserEmail},user2_email.eq.${userEmail})`)
            .single();

        if (existingConversation) {
            return { success: true, conversation: existingConversation };
        }

        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                car_id: carId,
                user1_email: userEmail,
                user2_email: otherUserEmail
            })
            .select()
            .single();

        if (createError) throw createError;

        return { success: true, conversation: newConversation };
    } catch (err) {
        console.error('Error getting/creating conversation:', err);
        return { success: false, error: err.message };
    }
};

export const sendMessage = async (conversationId, senderEmail, content) => {
    try {
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_email: senderEmail,
                content
            })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('conversations')
            .update({
                last_message_at: new Date().toISOString(),
                last_message: content
            })
            .eq('id', conversationId);

        return { success: true, message };
    } catch (err) {
        console.error('Error sending message:', err);
        return { success: false, error: err.message };
    }
};

export const getConversationMessages = async (conversationId) => {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return { success: true, messages: messages || [] };
    } catch (err) {
        console.error('Error fetching messages:', err);
        return { success: false, error: err.message, messages: [] };
    }
};

export const markMessagesAsRead = async (conversationId, userEmail) => {
    try {
        const { error } = await supabase
            .from('messages')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('conversation_id', conversationId)
            .neq('sender_email', userEmail)
            .eq('is_read', false);

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error marking messages as read:', err);
        return { success: false, error: err.message };
    }
};

export const getUserConversations = async (userEmail) => {
    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                cars:car_id(id, year, make, model, license_plate)
            `)
            .or(`user1_email.eq.${userEmail},user2_email.eq.${userEmail}`)
            .eq('is_closed', false)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        return { success: true, conversations: conversations || [] };
    } catch (err) {
        console.error('Error fetching conversations:', err);
        return { success: false, error: err.message, conversations: [] };
    }
};

export const getUnreadCount = async (conversationId, userEmail) => {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conversationId)
            .neq('sender_email', userEmail)
            .eq('is_read', false);

        if (error) throw error;

        return { success: true, count: count || 0 };
    } catch (err) {
        console.error('Error fetching unread count:', err);
        return { success: false, error: err.message, count: 0 };
    }
};

export const closeConversation = async (conversationId) => {
    try {
        const { error } = await supabase
            .from('conversations')
            .update({ is_closed: true })
            .eq('id', conversationId);

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error closing conversation:', err);
        return { success: false, error: err.message };
    }
};
