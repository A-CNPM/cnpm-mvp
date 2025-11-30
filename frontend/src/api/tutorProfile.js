const API_BASE_URL = 'http://localhost:8000';

export const TutorProfileService = {
    /**
     * Lấy thông tin hồ sơ chuyên môn của Tutor
     * @param {string} tutorId - ID của Tutor
     */
    async getProfile(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor/profile/${tutorId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.profile;
        } catch (error) {
            console.error("Lỗi khi lấy profile:", error);
            throw error;
        }
    },

    /**
     * Cập nhật hồ sơ chuyên môn - chỉ cho phép cập nhật các trường bổ sung
     * @param {string} tutorId - ID của Tutor
     * @param {Object} updateData - Dữ liệu cập nhật
     */
    async updateProfile(tutorId, updateData) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor/profile/${tutorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật thất bại");
            }

            const data = await response.json();
            return data.profile;
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử thay đổi của hồ sơ
     * @param {string} tutorId - ID của Tutor
     */
    async getProfileHistory(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor/profile/${tutorId}/history`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.history || [];
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử profile:", error);
            return [];
        }
    },

    /**
     * Đồng bộ thông tin từ HCMUT_DATACORE
     * @param {string} tutorId - ID của Tutor
     */
    async syncFromDatacore(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tutor/profile/${tutorId}/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.profile;
        } catch (error) {
            console.error("Lỗi khi đồng bộ profile:", error);
            throw error;
        }
    }
};

export default TutorProfileService;

