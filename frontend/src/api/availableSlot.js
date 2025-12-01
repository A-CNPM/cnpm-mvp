const API_BASE_URL = 'http://localhost:8000';

export const AvailableSlotService = {
    /**
     * Lấy tất cả lịch rảnh của tutor
     * @param {string} tutorId - ID của tutor
     * @param {string} status - Trạng thái (tùy chọn)
     */
    async getTutorSlots(tutorId, status = null) {
        try {
            const url = status 
                ? `${API_BASE_URL}/available-slot/tutor/${tutorId}?status=${status}`
                : `${API_BASE_URL}/available-slot/tutor/${tutorId}`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy lịch rảnh:", error);
            return [];
        }
    },

    /**
     * Đăng ký lịch rảnh
     * @param {string} slotId - ID của slot
     * @param {string} userId - ID của user
     */
    async registerSlot(slotId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    slot_id: slotId,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Đăng ký thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đăng ký lịch rảnh:", error);
            throw error;
        }
    },

    /**
     * Hủy đăng ký lịch rảnh
     * @param {string} slotId - ID của slot
     * @param {string} userId - ID của user
     */
    async cancelSlotRegistration(slotId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/${slotId}/cancel?user_id=${userId}`, {
                method: "POST",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Hủy đăng ký thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi hủy đăng ký:", error);
            throw error;
        }
    },

    /**
     * Thay đổi lịch đã đăng ký
     * @param {string} oldSlotId - ID của slot cũ
     * @param {string} newSlotId - ID của slot mới
     * @param {string} userId - ID của user
     */
    async changeSlot(oldSlotId, newSlotId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    old_slot_id: oldSlotId,
                    new_slot_id: newSlotId,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Đổi lịch thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đổi lịch:", error);
            throw error;
        }
    },

    /**
     * Lấy tất cả lịch rảnh mà user đã đăng ký
     * @param {string} userId - ID của user
     */
    async getUserRegisteredSlots(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/user/${userId}/registered`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy lịch rảnh đã đăng ký:", error);
            return [];
        }
    },

    /**
     * Tutor tạo lịch rảnh mới
     * @param {Object} slotData - Dữ liệu lịch rảnh
     */
    async createSlot(slotData) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(slotData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo lịch rảnh thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo lịch rảnh:", error);
            throw error;
        }
    },

    /**
     * Tutor cập nhật lịch rảnh
     * @param {Object} updateData - Dữ liệu cập nhật
     */
    async updateSlot(updateData) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật lịch rảnh thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật lịch rảnh:", error);
            throw error;
        }
    },

    /**
     * Tutor xác nhận slot (chuyển thành session)
     * @param {string} slotId - ID của slot
     * @param {string} tutorId - ID của tutor
     */
    async confirmSlot(slotId, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ slot_id: slotId, tutor_id: tutorId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xác nhận lịch rảnh thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xác nhận lịch rảnh:", error);
            throw error;
        }
    },

    /**
     * Tutor hủy slot
     * @param {string} slotId - ID của slot
     * @param {string} tutorId - ID của tutor
     * @param {string} reason - Lý do hủy (tùy chọn)
     */
    async cancelSlot(slotId, tutorId, reason = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ slot_id: slotId, tutor_id: tutorId, reason }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Hủy lịch rảnh thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi hủy lịch rảnh:", error);
            throw error;
        }
    },

    /**
     * Tutor đề xuất đổi lịch
     * @param {Object} rescheduleData - Dữ liệu đề xuất đổi lịch
     */
    async proposeReschedule(rescheduleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slot/propose-reschedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(rescheduleData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Đề xuất đổi lịch thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đề xuất đổi lịch:", error);
            throw error;
        }
    }
};

export default AvailableSlotService;

