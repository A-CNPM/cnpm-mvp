const API_BASE_URL = 'http://localhost:8000';

export const SessionService = {
    /**
     * Tìm kiếm Buổi tư vấn (Session)
     * @param {Object} criteria - Tiêu chí tìm kiếm
     * @param {string} [criteria.keyword] - Tìm theo topic hoặc content
     * @param {string} [criteria.mode] - 'Online' hoặc 'Offline'
     * @param {string} [criteria.status] - Trạng thái buổi học
     * @param {string} [criteria.tutor_name] - Tên gia sư
     * @param {string} [criteria.date_from] - Từ ngày (YYYY-MM-DD)
     */
    async searchSessions(criteria = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/searching/session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(criteria),
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data; // Trả về danh sách Session
        } catch (error) {
            console.error("Lỗi khi tìm kiếm Session:", error);
            return [];
        }
    },

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
