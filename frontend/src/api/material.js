const API_BASE_URL = 'http://localhost:8000';

export const MaterialService = {
    /**
     * Lấy tất cả học liệu của user
     * @param {string} userId - ID của user
     */
    async getUserMaterials(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}`, {
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
            console.error("Lỗi khi lấy học liệu:", error);
            return [];
        }
    },

    /**
     * Lấy chi tiết học liệu
     * @param {string} userId - ID của user
     * @param {string} materialId - ID của học liệu
     */
    async getMaterialDetail(userId, materialId) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}/detail/${materialId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.material;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết học liệu:", error);
            return null;
        }
    },

    /**
     * Tìm kiếm học liệu
     * @param {string} userId - ID của user
     * @param {Object} criteria - Tiêu chí tìm kiếm
     */
    async searchMaterials(userId, criteria = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(criteria),
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tìm kiếm học liệu:", error);
            return [];
        }
    },

    /**
     * Lấy danh sách categories
     * @param {string} userId - ID của user
     */
    async getCategories(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}/categories`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.categories || [];
        } catch (error) {
            console.error("Lỗi khi lấy categories:", error);
            return [];
        }
    },

    /**
     * Lấy danh sách subjects
     * @param {string} userId - ID của user
     */
    async getSubjects(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}/subjects`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.subjects || [];
        } catch (error) {
            console.error("Lỗi khi lấy subjects:", error);
            return [];
        }
    },

    /**
     * Ghi nhận lượt tải xuống
     * @param {string} userId - ID của user
     * @param {string} materialId - ID của học liệu
     */
    async recordDownload(userId, materialId) {
        try {
            const response = await fetch(`${API_BASE_URL}/materials/user/${userId}/download/${materialId}`, {
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
            console.error("Lỗi khi ghi nhận lượt tải:", error);
            return { success: false };
        }
    }
};

export default MaterialService;

