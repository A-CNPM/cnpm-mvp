const API_BASE_URL = 'http://localhost:8000';

export const TutorRegistrationService = {
    /**
     * Nộp hồ sơ đăng ký Tutor
     * @param {Object} data - Dữ liệu hồ sơ đăng ký
     */
    async submitRegistration(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor-registration/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Nộp hồ sơ thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi nộp hồ sơ:", error);
            throw error;
        }
    },

    /**
     * Lấy hồ sơ đăng ký của user
     * @param {string} userId - ID của user
     */
    async getUserRegistration(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor-registration/user/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Chưa có hồ sơ
                }
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            // Nếu response là null hoặc empty, trả về null
            return data || null;
        } catch (error) {
            console.error("Lỗi khi lấy hồ sơ:", error);
            return null;
        }
    },

    /**
     * Cập nhật hồ sơ đăng ký (khi yêu cầu bổ sung)
     * @param {string} registrationId - ID của hồ sơ
     * @param {Object} data - Dữ liệu cập nhật
     */
    async updateRegistration(registrationId, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor-registration/${registrationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật hồ sơ thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử của một hồ sơ đăng ký
     * @param {string} registrationId - ID của hồ sơ
     */
    async getRegistrationHistory(registrationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor-registration/${registrationId}/history`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử:", error);
            return [];
        }
    }
};

export default TutorRegistrationService;

