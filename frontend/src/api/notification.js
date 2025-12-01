const API_BASE_URL = 'http://localhost:8000';

export const NotificationService = {
    /**
     * Lấy danh sách notifications của user
     * @param {string} userId - ID của user
     * @param {boolean} unreadOnly - Chỉ lấy notifications chưa đọc
     */
    async getNotifications(userId, unreadOnly = false) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/user/${userId}?unread_only=${unreadOnly}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy notifications:", error);
            return [];
        }
    },

    /**
     * Lấy số lượng notifications chưa đọc
     * @param {string} userId - ID của user
     */
    async getUnreadCount(userId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/user/${userId}/unread-count`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error("Lỗi khi lấy số lượng notifications chưa đọc:", error);
            return 0;
        }
    },

    /**
     * Đánh dấu notification là đã đọc
     * @param {string} userId - ID của user
     * @param {string} notificationId - ID của notification
     */
    async markAsRead(userId, notificationId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/user/${userId}/read/${notificationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đánh dấu notification là đã đọc:", error);
            return { success: false };
        }
    },

    /**
     * Đánh dấu tất cả notifications là đã đọc
     * @param {string} userId - ID của user
     */
    async markAllAsRead(userId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/user/${userId}/read-all`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả notifications là đã đọc:", error);
            return { success: false };
        }
    },

    /**
     * Xóa notification
     * @param {string} userId - ID của user
     * @param {string} notificationId - ID của notification
     */
    async deleteNotification(userId, notificationId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/notifications/user/${userId}/${notificationId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa notification:", error);
            return { success: false };
        }
    }
};

export default NotificationService;

