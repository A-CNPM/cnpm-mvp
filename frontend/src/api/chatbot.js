const API_BASE_URL = 'http://localhost:8000';

export const ChatbotService = {
    /**
     * Gửi tin nhắn đến chatbot
     * @param {string} message - Tin nhắn của user
     * @param {string} userId - ID của user
     * @param {string} conversationId - ID của conversation (optional)
     */
    async sendMessage(message, userId, conversationId = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    user_id: userId,
                    conversation_id: conversationId
                }),
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            throw error;
        }
    },

    /**
     * Lấy thông tin conversation
     * @param {string} conversationId - ID của conversation
     */
    async getConversation(conversationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/conversation/${conversationId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy conversation:", error);
            throw error;
        }
    },

    /**
     * Lấy tất cả conversations của user
     * @param {string} userId - ID của user
     */
    async getUserConversations(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/user/${userId}/conversations`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy conversations:", error);
            return [];
        }
    }
};

export default ChatbotService;

