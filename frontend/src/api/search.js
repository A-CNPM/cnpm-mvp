const API_BASE_URL = 'http://localhost:8000';

export const SearchService = {
    /**
     * Tìm kiếm Gia sư (Tutor)
     * @param {Object} criteria - Tiêu chí tìm kiếm
     * @param {string} [criteria.keyword] - Từ khóa tên
     * @param {string[]} [criteria.tags] - Danh sách tags
     * @param {number} [criteria.min_rating] - Đánh giá tối thiểu
     * @param {string} [criteria.major] - Chuyên ngành
     */
    async searchTutors(criteria = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/searching/tutor`, {
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
            return data; // Trả về danh sách Tutor
        } catch (error) {
            console.error("Lỗi khi tìm kiếm Tutor:", error);
            return [];
        }
    },

    /**
     * Lấy chi tiết Tutor theo ID
     */
    async getTutorDetail(tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/searching/tutor/${tutorId}`, {
                method: "GET",
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error("Lỗi lấy chi tiết Tutor:", error);
            return null;
        }
    }
};

export default SearchService;