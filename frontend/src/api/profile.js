const API_BASE_URL = 'http://localhost:8000';

export const ProfileService = {
    /**
     * Lấy thông tin profile của user
     * @param {string} userId - ID của user
     */
    async getProfile(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
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
            console.error("Lỗi khi lấy profile:", error);
            throw error;
        }
    },

    /**
     * Cập nhật profile - chỉ cho phép cập nhật các trường bổ sung
     * @param {string} userId - ID của user
     * @param {Object} updateData - Dữ liệu cập nhật
     */
    async updateProfile(userId, updateData) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
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

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử thay đổi của profile
     * @param {string} userId - ID của user
     */
    async getProfileHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${userId}/history`, {
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
     * @param {string} userId - ID của user
     */
    async syncFromDatacore(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/sync/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đồng bộ profile:", error);
            throw error;
        }
    }
};

export default ProfileService;

