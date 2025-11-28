const API_BASE_URL = 'http://localhost:8000';

export const SessionService = {
    /**
     * Đăng ký tham gia session
     * @param {string} sessionId - ID của session
     * @param {string} menteeId - ID của mentee
     */
    async registerSession(sessionId, menteeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "mentee_id": menteeId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || `Lỗi HTTP: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error("Lỗi đăng ký session:", error);
            throw error;
        }
    },

    /**
     * Hủy đăng ký session
     * @param {string} sessionId - ID của session
     * @param {string} menteeId - ID của mentee
     */
    async cancelSession(sessionId, menteeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ "mentee_id": menteeId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || `Lỗi HTTP: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error("Lỗi hủy đăng ký session:", error);
            throw error;
        }
    }
};

export default SessionService;
