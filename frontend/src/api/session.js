const API_BASE_URL = 'http://localhost:8000';

export const SessionService = {
    /**
     * Đăng ký tham gia session
     * @param {string} sessionId - ID của session
     * @param {string} menteeId - ID của mentee
     */
    async registerSession(sessionId, menteeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mentee_id: menteeId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Đăng ký thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi đăng ký session:", error);
            throw error;
        }
    },

    /**
     * Hủy đăng ký session
     * @param {string} sessionId - ID của session
     * @param {string} menteeId - ID của mentee
     */
    async cancelSession(sessionId, menteeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mentee_id: menteeId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Hủy đăng ký thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi hủy đăng ký session:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách sessions của user
     * @param {string} userId - ID của user
     */
    async getUserSessions(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/user/${userId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sessions:", error);
            return [];
        }
    },

    /**
     * Lấy chi tiết session
     * @param {string} sessionId - ID của session
     */
    async getSessionDetail(sessionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
                method: "GET",
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết session:", error);
            return null;
        }
    },

    /**
     * Ghi nhận vi phạm: không tham gia buổi đã đăng ký
     * @param {string} sessionId - ID của session
     * @param {string} menteeId - ID của mentee
     */
    async markAbsence(sessionId, menteeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/mark-absence`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mentee_id: menteeId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Ghi nhận vi phạm thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi ghi nhận vi phạm:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách tài nguyên của session
     * @param {string} sessionId - ID của session
     * @param {string} userId - ID của user (tùy chọn, để lọc theo quyền truy cập)
     */
    async getSessionResources(sessionId, userId = null) {
        try {
            const url = userId 
                ? `${API_BASE_URL}/session/${sessionId}/resources?user_id=${userId}`
                : `${API_BASE_URL}/session/${sessionId}/resources`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tài nguyên:", error);
            return [];
        }
    },

    /**
     * Download tài nguyên từ session
     * @param {string} sessionId - ID của session
     * @param {string} resourceId - ID của resource
     */
    async downloadResource(sessionId, resourceId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/download-resource/${resourceId}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const resource = await response.json();
            // Mở link download trong tab mới
            if (resource && resource.url) {
                window.open(resource.url, '_blank');
            }
            return resource;
        } catch (error) {
            console.error("Lỗi khi tải tài nguyên:", error);
            throw error;
        }
    },

    /**
     * Tutor tạo resource mới
     * @param {string} sessionId - ID của session
     * @param {Object} resourceData - Dữ liệu resource
     * @param {string} tutorId - ID của tutor
     */
    async createResource(sessionId, resourceData, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/resources/create?tutor_id=${tutorId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(resourceData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo tài liệu thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo tài liệu:", error);
            throw error;
        }
    },

    /**
     * Tutor cập nhật resource
     * @param {string} sessionId - ID của session
     * @param {string} resourceId - ID của resource
     * @param {Object} resourceData - Dữ liệu cập nhật
     * @param {string} tutorId - ID của tutor
     */
    async updateResource(sessionId, resourceId, resourceData, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/resources/${resourceId}?tutor_id=${tutorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(resourceData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật tài liệu thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật tài liệu:", error);
            throw error;
        }
    },

    /**
     * Tutor xóa resource
     * @param {string} sessionId - ID của session
     * @param {string} resourceId - ID của resource
     * @param {string} tutorId - ID của tutor
     */
    async deleteResource(sessionId, resourceId, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/resources/${resourceId}?tutor_id=${tutorId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xóa tài liệu thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa tài liệu:", error);
            throw error;
        }
    },

    /**
     * Tutor tạo ghi chú/biên bản
     * @param {string} sessionId - ID của session
     * @param {Object} noteData - Dữ liệu ghi chú
     * @param {string} tutorId - ID của tutor
     */
    async createSessionNote(sessionId, noteData, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/notes?tutor_id=${tutorId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Tạo ghi chú thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi tạo ghi chú:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách ghi chú của session
     * @param {string} sessionId - ID của session
     * @param {string} userId - ID của user (tùy chọn)
     */
    async getSessionNotes(sessionId, userId = null) {
        try {
            const url = userId 
                ? `${API_BASE_URL}/session/${sessionId}/notes?user_id=${userId}`
                : `${API_BASE_URL}/session/${sessionId}/notes`;
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy ghi chú:", error);
            return [];
        }
    },

    /**
     * Tutor cập nhật ghi chú
     * @param {string} noteId - ID của ghi chú
     * @param {Object} noteData - Dữ liệu cập nhật
     * @param {string} tutorId - ID của tutor
     */
    async updateSessionNote(noteId, noteData, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/notes/${noteId}?tutor_id=${tutorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Cập nhật ghi chú thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi cập nhật ghi chú:", error);
            throw error;
        }
    },

    /**
     * Tutor xóa ghi chú
     * @param {string} noteId - ID của ghi chú
     * @param {string} tutorId - ID của tutor
     */
    async deleteSessionNote(noteId, tutorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/notes/${noteId}?tutor_id=${tutorId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Xóa ghi chú thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi xóa ghi chú:", error);
            throw error;
        }
    },

    /**
     * Tutor hủy session
     * @param {string} sessionId - ID của session
     * @param {string} tutorId - ID của tutor
     * @param {string} reason - Lý do hủy (tùy chọn)
     */
    async cancelSessionByTutor(sessionId, tutorId, reason = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    tutor_id: tutorId,
                    reason: reason
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Hủy session thất bại");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi hủy session:", error);
            throw error;
        }
    },

    /**
     * Tutor đề xuất đổi lịch session
     * @param {string} sessionId - ID của session
     * @param {string} tutorId - ID của tutor
     * @param {string} newStartTime - Thời gian bắt đầu mới
     * @param {string} newEndTime - Thời gian kết thúc mới
     * @param {string} newLocation - Địa điểm mới (tùy chọn)
     * @param {string} reason - Lý do đổi lịch (tùy chọn)
     */
    async rescheduleSessionByTutor(sessionId, tutorId, newStartTime, newEndTime, newLocation = null, reason = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/session/reschedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    tutor_id: tutorId,
                    new_start_time: newStartTime,
                    new_end_time: newEndTime,
                    new_location: newLocation,
                    reason: reason
                }),
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
    },

    /**
     * Mentee phản hồi thay đổi session
     * @param {string} changeRequestId - ID của change request
     * @param {string} userId - ID của user
     * @param {string} response - "accept" hoặc "reject"
     */
    async respondToSessionChange(changeRequestId, userId, response) {
        try {
            const response_data = await fetch(`${API_BASE_URL}/session/change/respond`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    change_request_id: changeRequestId,
                    user_id: userId,
                    response: response
                }),
            });

            if (!response_data.ok) {
                const error = await response_data.json();
                throw new Error(error.detail || "Phản hồi thất bại");
            }

            return await response_data.json();
        } catch (error) {
            console.error("Lỗi khi phản hồi thay đổi:", error);
            throw error;
        }
    }
};

export default SessionService;

