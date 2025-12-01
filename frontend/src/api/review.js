const API_BASE_URL = 'http://localhost:8000';

export const ReviewService = {
    /**
     * Gửi đánh giá cho buổi tư vấn
     * @param {Object} data - Dữ liệu đánh giá {session_id, user_id, rating, comment}
     */
    async submitReview(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/review/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Gửi đánh giá thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách các session đã hoàn thành mà user đã tham gia (chưa đánh giá)
     * @param {string} userId - ID của user
     */
    async getUserCompletedSessions(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/review/user/${userId}/completed-sessions`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách session:", error);
            return [];
        }
    },

    /**
     * Lấy tất cả đánh giá của user
     * @param {string} userId - ID của user
     */
    async getUserReviews(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/review/user/${userId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá:", error);
            return [];
        }
    },

    /**
     * Lấy tất cả đánh giá của một session
     * @param {string} sessionId - ID của session
     */
    async getSessionReviews(sessionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/review/session/${sessionId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá session:", error);
            return [];
        }
    },

    /**
     * Lấy tất cả đánh giá của một tutor
     * @param {string} tutorId - ID của tutor
     */
    async getTutorReviews(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/review/tutor/${tutorId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá của tutor:", error);
            return [];
        }
    }
};

export default ReviewService;

