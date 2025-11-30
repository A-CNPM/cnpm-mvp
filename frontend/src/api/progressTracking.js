const API_BASE_URL = 'http://localhost:8000';

export const ProgressTrackingService = {
    /**
     * Tạo ghi nhận tiến bộ/hạn chế học tập
     * @param {Object} data - Dữ liệu ghi nhận
     * @param {string} tutorId - ID của tutor
     */
    async createProgressTracking(data, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress-tracking/create?tutor_id=${tutorId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo ghi nhận tiến bộ thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo ghi nhận tiến bộ:", error);
            throw error;
        }
    },

    /**
     * Cập nhật ghi nhận tiến bộ
     * @param {string} trackingId - ID của ghi nhận
     * @param {Object} data - Dữ liệu cập nhật
     * @param {string} tutorId - ID của tutor
     */
    async updateProgressTracking(trackingId, data, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress-tracking/${trackingId}?tutor_id=${tutorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật ghi nhận tiến bộ thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật ghi nhận tiến bộ:", error);
            throw error;
        }
    },

    /**
     * Xóa ghi nhận tiến bộ
     * @param {string} trackingId - ID của ghi nhận
     * @param {string} tutorId - ID của tutor
     */
    async deleteProgressTracking(trackingId, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress-tracking/${trackingId}?tutor_id=${tutorId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xóa ghi nhận tiến bộ thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa ghi nhận tiến bộ:", error);
            throw error;
        }
    },

    /**
     * Lấy tất cả ghi nhận tiến bộ của một mentee
     * @param {string} menteeId - ID của mentee
     * @param {string} tutorId - ID của tutor (tùy chọn)
     */
    async getMenteeProgressTrackings(menteeId, tutorId = null) {
        try {
            const url = tutorId
                ? `${API_BASE_URL}/progress-tracking/mentee/${menteeId}?tutor_id=${tutorId}`
                : `${API_BASE_URL}/progress-tracking/mentee/${menteeId}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy ghi nhận tiến bộ của mentee:", error);
            return [];
        }
    },

    /**
     * Lấy tất cả ghi nhận tiến bộ của một session
     * @param {string} sessionId - ID của session
     * @param {string} tutorId - ID của tutor (tùy chọn)
     */
    async getSessionProgressTrackings(sessionId, tutorId = null) {
        try {
            const url = tutorId
                ? `${API_BASE_URL}/progress-tracking/session/${sessionId}?tutor_id=${tutorId}`
                : `${API_BASE_URL}/progress-tracking/session/${sessionId}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy ghi nhận tiến bộ của session:", error);
            return [];
        }
    },

    /**
     * Lấy tất cả ghi nhận tiến bộ của một tutor
     * @param {string} tutorId - ID của tutor
     */
    async getTutorProgressTrackings(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress-tracking/tutor/${tutorId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy ghi nhận tiến bộ của tutor:", error);
            return [];
        }
    },

    /**
     * Lấy tổng hợp tiến bộ của một mentee
     * @param {string} menteeId - ID của mentee
     * @param {string} tutorId - ID của tutor (tùy chọn)
     */
    async getMenteeProgressSummary(menteeId, tutorId = null) {
        try {
            const url = tutorId
                ? `${API_BASE_URL}/progress-tracking/mentee/${menteeId}/summary?tutor_id=${tutorId}`
                : `${API_BASE_URL}/progress-tracking/mentee/${menteeId}/summary`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy tổng hợp tiến bộ:", error);
            return null;
        }
    },

    /**
     * Lấy danh sách sessions của tutor kèm phản hồi từ mentee
     * @param {string} tutorId - ID của tutor
     */
    async getTutorSessionsWithFeedback(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress-tracking/tutor/${tutorId}/sessions-with-feedback`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy sessions với phản hồi:", error);
            return [];
        }
    }
};

export default ProgressTrackingService;

