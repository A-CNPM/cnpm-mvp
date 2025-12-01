const API_BASE_URL = 'http://localhost:8000';

export const AdminService = {
    /**
     * Đăng nhập Admin
     * @param {string} email - Email của admin
     * @param {string} password - Mật khẩu
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Đăng nhập thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đăng nhập admin:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách hồ sơ đăng ký Tutor đang chờ duyệt
     * @param {string} adminId - ID của admin
     */
    async getPendingTutorRegistrations(adminId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tutor-registrations/pending?admin_id=${adminId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.registrations || [];
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hồ sơ đăng ký:", error);
            return [];
        }
    },

    /**
     * Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ Tutor
     * @param {Object} request - Dữ liệu phê duyệt
     */
    async approveTutorRegistration(request) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tutor-registrations/approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Phê duyệt thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi phê duyệt hồ sơ:", error);
            throw error;
        }
    },

    /**
     * Tìm kiếm users
     * @param {string} adminId - ID của admin
     * @param {Object} criteria - Tiêu chí tìm kiếm
     */
    async searchUsers(adminId, criteria = {}) {
        try {
            const params = new URLSearchParams({ admin_id: adminId });
            if (criteria.keyword) params.append("keyword", criteria.keyword);
            if (criteria.role) params.append("role", criteria.role);
            if (criteria.khoa) params.append("khoa", criteria.khoa);
            if (criteria.bo_mon) params.append("bo_mon", criteria.bo_mon);
            if (criteria.status) params.append("status", criteria.status);

            const response = await fetch(`${API_BASE_URL}/admin/users/search?${params}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error("Lỗi khi tìm kiếm users:", error);
            return [];
        }
    },

    /**
     * Lấy báo cáo hoạt động
     * @param {string} adminId - ID của admin
     */
    async getActivityReport(adminId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/activity?admin_id=${adminId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.report || {};
        } catch (error) {
            console.error("Lỗi khi lấy báo cáo hoạt động:", error);
            return {};
        }
    },

    /**
     * Lấy báo cáo chất lượng
     * @param {string} adminId - ID của admin
     */
    async getQualityReport(adminId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/quality?admin_id=${adminId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.report || {};
        } catch (error) {
            console.error("Lỗi khi lấy báo cáo chất lượng:", error);
            return {};
        }
    }
};

export default AdminService;

