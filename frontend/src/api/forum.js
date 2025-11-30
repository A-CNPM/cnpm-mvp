const API_BASE_URL = 'http://localhost:8000';

export const ForumService = {
    /**
     * Tạo bài đăng mới
     * @param {Object} data - Dữ liệu bài đăng
     */
    async createPost(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo bài đăng thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo bài đăng:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng
     * @param {Object} criteria - Tiêu chí tìm kiếm
     */
    async getPosts(criteria = {}) {
        try {
            const params = new URLSearchParams();
            if (criteria.keyword) params.append("keyword", criteria.keyword);
            if (criteria.category) params.append("category", criteria.category);
            if (criteria.author_id) params.append("author_id", criteria.author_id);
            if (criteria.sort_by) params.append("sort_by", criteria.sort_by);

            const response = await fetch(`${API_BASE_URL}/forum/posts?${params.toString()}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài đăng:", error);
            return [];
        }
    },

    /**
     * Lấy chi tiết bài đăng
     * @param {string} postId - ID của bài đăng
     */
    async getPostDetail(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
                method: "GET",
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết bài đăng:", error);
            return null;
        }
    },

    /**
     * Cập nhật bài đăng
     * @param {string} postId - ID của bài đăng
     * @param {Object} data - Dữ liệu cập nhật
     * @param {string} userId - ID của user
     */
    async updatePost(postId, data, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data, user_id: userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật bài đăng thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật bài đăng:", error);
            throw error;
        }
    },

    /**
     * Xóa bài đăng
     * @param {string} postId - ID của bài đăng
     * @param {string} userId - ID của user
     */
    async deletePost(postId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}?user_id=${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xóa bài đăng thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa bài đăng:", error);
            throw error;
        }
    },

    /**
     * Like bài đăng
     * @param {string} postId - ID của bài đăng
     * @param {string} userId - ID của user
     */
    async likePost(postId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Like thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi like bài đăng:", error);
            throw error;
        }
    },

    /**
     * Tạo bình luận
     * @param {Object} data - Dữ liệu bình luận
     */
    async createComment(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo bình luận thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo bình luận:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bình luận
     * @param {string} postId - ID của bài đăng
     */
    async getComments(postId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/comments`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bình luận:", error);
            return [];
        }
    },

    /**
     * Xóa bình luận
     * @param {string} commentId - ID của bình luận
     * @param {string} userId - ID của user
     */
    async deleteComment(commentId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/comments/${commentId}?user_id=${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xóa bình luận thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa bình luận:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách categories
     */
    async getCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/forum/categories`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách categories:", error);
            return [];
        }
    }
};

export default ForumService;

