import { FaCalendar, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaGlobe, FaExclamationTriangle, FaSpinner, FaPlus, FaCalendarAlt } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";

function Schedule() {
  const tutorId = localStorage.getItem("username") || "b.tutor";
  
  // State cho slots (lịch rảnh)
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // State cho modals
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [showSlotDetailModal, setShowSlotDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // State cho form
  const [formData, setFormData] = useState({
    topic: "",
    start_time: "",
    end_time: "",
    mode: "Online",
    location: "",
    max_participants: 5,
    min_participants: 2,
    reason: ""
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // State cho filter
  const [filterStatus, setFilterStatus] = useState(""); // "", "Mở đăng ký", "Đã chuyển thành session", etc.

  useEffect(() => {
    loadSlots();
    
    // Tự động refresh mỗi 30 giây để kiểm tra slot đã đạt ngưỡng chưa (giảm tần suất để tối ưu performance)
    const interval = setInterval(() => {
      loadSlots();
    }, 30000); // Tăng từ 10s lên 30s
    
    return () => clearInterval(interval);
  }, [tutorId, filterStatus]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await AvailableSlotService.getTutorSlots(tutorId, filterStatus || null);
      // Lọc bỏ các slot đã chuyển thành session (chỉ hiển thị lịch rảnh chưa trở thành session)
      const filteredData = data.filter(slot => slot.status !== "Đã chuyển thành session");
      setSlots(filteredData);
    } catch (error) {
      console.error("Lỗi khi tải lịch rảnh:", error);
      showMessage("Không thể tải danh sách lịch rảnh", "error");
    } finally {
      setLoadingSlots(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const result = await AvailableSlotService.createSlot({
        tutor_id: tutorId,
        ...formData
      });
      
      if (result.success) {
        showMessage("Tạo lịch rảnh thành công!", "success");
        setShowCreateSlotModal(false);
        resetForm();
        loadSlots();
      }
    } catch (error) {
      showMessage(error.message || "Tạo lịch rảnh thất bại", "error");
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    try {
      const result = await AvailableSlotService.updateSlot({
        slot_id: selectedSlot.slot_id,
        tutor_id: tutorId,
        ...formData
      });
      
      if (result.success) {
        if (result.requires_approval) {
          showMessage("Đã gửi yêu cầu thay đổi. Đang chờ phản hồi từ sinh viên.", "success");
        } else {
          showMessage("Cập nhật lịch rảnh thành công!", "success");
        }
        setShowEditSlotModal(false);
        resetForm();
        setSelectedSlot(null);
        loadSlots();
      }
    } catch (error) {
      showMessage(error.message || "Cập nhật lịch rảnh thất bại", "error");
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    
    try {
      const result = await AvailableSlotService.cancelSlot(selectedSlot.slot_id, tutorId);
      if (result.success) {
        showMessage("Đã xóa lịch rảnh thành công!", "success");
        setShowCancelModal(false);
        setSelectedSlot(null);
        loadSlots();
      }
    } catch (error) {
      showMessage(error.message || "Xóa lịch rảnh thất bại", "error");
    }
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlot) return;
    
    try {
      const result = await AvailableSlotService.confirmSlot(selectedSlot.slot_id, tutorId);
      if (result.success) {
        showMessage("Đã xác nhận và chuyển thành buổi tư vấn!", "success");
        setShowSlotDetailModal(false);
        setSelectedSlot(null);
        loadSlots();
      }
    } catch (error) {
      showMessage(error.message || "Xác nhận thất bại", "error");
    }
  };

  const handleProposeReschedule = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    try {
      const result = await AvailableSlotService.proposeReschedule({
        slot_id: selectedSlot.slot_id,
        tutor_id: tutorId,
        new_start_time: formData.start_time,
        new_end_time: formData.end_time,
        new_location: formData.location,
        reason: formData.reason || ""
      });
      
      if (result.success) {
        showMessage("Đã gửi đề xuất đổi lịch. Đang chờ phản hồi từ sinh viên.", "success");
        setShowRescheduleModal(false);
        resetForm();
        setSelectedSlot(null);
        loadSlots();
      }
    } catch (error) {
      showMessage(error.message || "Đề xuất đổi lịch thất bại", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      topic: "",
      start_time: "",
      end_time: "",
      mode: "Online",
      location: "",
      max_participants: 5,
      min_participants: 2,
      reason: ""
    });
  };

  const openEditModal = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      topic: slot.topic || "",
      start_time: slot.start_time || "",
      end_time: slot.end_time || "",
      mode: slot.mode || "Online",
      location: slot.location || "",
      max_participants: slot.max_participants || 5,
      min_participants: slot.min_participants || 2
    });
    setShowEditSlotModal(true);
  };

  const openRescheduleModal = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      start_time: slot.start_time || "",
      end_time: slot.end_time || "",
      location: slot.location || "",
      reason: ""
    });
    setShowRescheduleModal(true);
  };

  const getStatusBadge = (slot) => {
    const registeredCount = slot.registered_participants?.length || 0;
    const minParticipants = slot.min_participants || 1;
    
    // Không cần xử lý "Đã chuyển thành session" vì các slot này đã bị lọc bỏ
    if (slot.status === "Đã đóng") {
      return { text: "Đã đóng", color: "#6b7280", bg: "#f3f4f6" };
    }
    if (slot.status === "Đã thay đổi") {
      return { text: "Đã thay đổi", color: "#6366f1", bg: "#e0e7ff" };
    }
    if (registeredCount === 0) {
      return { text: "Không đăng ký", color: "#94a3b8", bg: "#f1f5f9" };
    }
    if (registeredCount < minParticipants) {
      return { text: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7" };
    }
    return { text: "Đã xác nhận", color: "#10b981", bg: "#d1fae5" };
  };

  const canConfirm = (slot) => {
    const registeredCount = slot.registered_participants?.length || 0;
    const minParticipants = slot.min_participants || 1;
    return slot.status === "Mở đăng ký" && registeredCount >= minParticipants;
  };

  // Lọc slots theo filter
  const filteredSlots = filterStatus 
    ? slots.filter(s => s.status === filterStatus)
    : slots;

  return (
    <>
      <div className="tutor-dashboard">
        <main className="main-content">
          <div className="tutor-header">
            <h1 className="tutor-title">Tutor</h1>
            <div className="tutor-email">{tutorId}@hcmut.edu.vn</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="main-title">Quản lý lịch rảnh</h2>
            <button
              onClick={() => {
                resetForm();
                setShowCreateSlotModal(true);
              }}
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600
              }}
            >
              <FaPlus /> Tạo lịch rảnh mới
            </button>
          </div>
          
          {/* Message */}
          {message && (
            <div style={{
              padding: "12px 16px",
              background: messageType === "success" ? "#d1fae5" : "#fee2e2",
              color: messageType === "success" ? "#065f46" : "#991b1b",
              borderRadius: 8,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              {messageType === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
              {message}
            </div>
          )}

          {/* Filter */}
          <div style={{
            marginBottom: 20,
            padding: 15,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 15
          }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              Lọc theo trạng thái:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                minWidth: 200
              }}
            >
              <option value="">Tất cả</option>
              <option value="Mở đăng ký">Mở đăng ký</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã đóng">Đã đóng</option>
              <option value="Đã thay đổi">Đã thay đổi</option>
            </select>
            <div style={{ fontSize: 13, color: "#64748b", marginLeft: "auto" }}>
              Tổng số: <strong>{filteredSlots.length}</strong> lịch rảnh
            </div>
          </div>
          
          {/* Danh sách lịch rảnh */}
          {loadingSlots ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
              <p>Đang tải...</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <FaCalendarAlt style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
              <p style={{ color: "#64748b" }}>
                {filterStatus ? `Không có lịch rảnh nào với trạng thái "${filterStatus}"` : "Chưa có lịch rảnh nào"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filteredSlots.map((slot) => {
                const statusBadge = getStatusBadge(slot);
                const registeredCount = slot.registered_participants?.length || 0;
                
                return (
                  <div
                    key={slot.slot_id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
                            {slot.topic || "Buổi tư vấn"}
                          </h3>
                          <span style={{
                            padding: "4px 12px",
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {statusBadge.text}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "#64748b" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaClock /> {slot.start_time} - {slot.end_time}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaGlobe /> {slot.mode}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, color: registeredCount >= (slot.min_participants || 1) ? "#10b981" : "#f59e0b" }}>
                            <FaUsers /> Đã đăng ký: {registeredCount}/{slot.max_participants} (Tối thiểu: {slot.min_participants || 1})
                          </span>
                        </div>
                        
                        {slot.location && (
                          <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                            <FaGlobe style={{ marginRight: 6 }} />
                            {slot.location}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowSlotDetailModal(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#6366f1",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          Chi tiết
                        </button>
                        {slot.status === "Mở đăng ký" && (
                          <>
                            <button
                              onClick={() => openEditModal(slot)}
                              style={{
                                padding: "8px 16px",
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 13
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowCancelModal(true);
                              }}
                              style={{
                                padding: "8px 16px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 13
                              }}
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {canConfirm(slot) && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            handleConfirmSlot();
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <FaCheckCircle /> Xác nhận và chuyển thành buổi tư vấn
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal tạo lịch rảnh */}
      {showCreateSlotModal && (
        <div className="modal-overlay">
          <div className="modal-create-form">
            <button className="modal-close" onClick={() => {
              setShowCreateSlotModal(false);
              resetForm();
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Tạo lịch rảnh mới</h2>
            <form onSubmit={handleCreateSlot}>
              <div className="modal-create-grid">
                <div>
                  <label>Chủ đề (tùy chọn)</label>
                  <input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="VD: Hướng dẫn DSA"
                  />
                </div>
                <div>
                  <label>Thời gian bắt đầu *</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="01/11/2025 14:00"
                    required
                  />
                </div>
                <div>
                  <label>Thời gian kết thúc *</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="01/11/2025 16:00"
                    required
                  />
                </div>
                <div>
                  <label>Hình thức *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    required
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label>Địa điểm / Link *</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={formData.mode === "Online" ? "www.meet.google.com/..." : "Phòng A201, Tòa nhà A2"}
                    required
                  />
                </div>
                <div>
                  <label>Số lượng tối đa *</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label>Số lượng tối thiểu để xác nhận *</label>
                  <input
                    type="number"
                    value={formData.min_participants}
                    onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="modal-submit">Tạo lịch rảnh</button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button type="button" className="back-link" onClick={() => {
                  setShowCreateSlotModal(false);
                  resetForm();
                }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa lịch rảnh */}
      {showEditSlotModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-edit-form">
            <button className="modal-close" onClick={() => {
              setShowEditSlotModal(false);
              setSelectedSlot(null);
              resetForm();
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Chỉnh sửa lịch rảnh</h2>
            <form onSubmit={handleUpdateSlot}>
              <div className="modal-create-grid">
                <div>
                  <label>Chủ đề</label>
                  <input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>
                <div>
                  <label>Thời gian bắt đầu</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="01/11/2025 14:00"
                  />
                </div>
                <div>
                  <label>Thời gian kết thúc</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="01/11/2025 16:00"
                  />
                </div>
                <div>
                  <label>Hình thức</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label>Địa điểm / Link</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label>Số lượng tối đa</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
              {selectedSlot.registered_participants?.length > 0 && (
                <div style={{
                  padding: 12,
                  background: "#fef3c7",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#92400e"
                }}>
                  <FaExclamationTriangle style={{ marginRight: 6 }} />
                  Lịch rảnh này đã có {selectedSlot.registered_participants.length} sinh viên đăng ký. 
                  Thay đổi sẽ cần được phê duyệt từ sinh viên.
                </div>
              )}
              <button type="submit" className="modal-submit">Cập nhật</button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button type="button" className="back-link" onClick={() => {
                  setShowEditSlotModal(false);
                  setSelectedSlot(null);
                  resetForm();
                }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết lịch rảnh */}
      {showSlotDetailModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-detail-form">
            <button className="modal-close" onClick={() => {
              setShowSlotDetailModal(false);
              setSelectedSlot(null);
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Chi tiết lịch rảnh</h2>
            <div className="modal-detail-grid">
              <div>
                <label>Chủ đề</label>
                <input value={selectedSlot.topic || "Chưa có"} readOnly />
              </div>
              <div>
                <label>Thời gian</label>
                <input value={`${selectedSlot.start_time} - ${selectedSlot.end_time}`} readOnly />
              </div>
              <div>
                <label>Hình thức</label>
                <input value={selectedSlot.mode} readOnly />
              </div>
              <div>
                <label>Địa điểm / Link</label>
                <input value={selectedSlot.location || "Chưa có"} readOnly />
              </div>
              <div>
                <label>Số lượng đăng ký</label>
                <input value={`${selectedSlot.registered_participants?.length || 0}/${selectedSlot.max_participants} (Tối thiểu: ${selectedSlot.min_participants || 1})`} readOnly />
              </div>
              <div>
                <label>Trạng thái</label>
                <input value={getStatusBadge(selectedSlot).text} readOnly />
              </div>
            </div>
            {selectedSlot.registered_participants && selectedSlot.registered_participants.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Danh sách sinh viên đã đăng ký:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedSlot.registered_participants.map((participantId, idx) => (
                    <div key={idx} style={{
                      padding: 8,
                      background: "#f8fafc",
                      borderRadius: 6,
                      fontSize: 14
                    }}>
                      {participantId}@hcmut.edu.vn
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {canConfirm(selectedSlot) && (
                <button
                  onClick={handleConfirmSlot}
                  className="modal-submit"
                  style={{ flex: 1 }}
                >
                  <FaCheckCircle style={{ marginRight: 6 }} />
                  Xác nhận và chuyển thành buổi tư vấn
                </button>
              )}
              {selectedSlot.status === "Mở đăng ký" && selectedSlot.registered_participants?.length > 0 && (
                <button
                  onClick={() => openRescheduleModal(selectedSlot)}
                  style={{
                    padding: "12px 24px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Đề xuất đổi lịch
                </button>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button type="button" className="back-link" onClick={() => {
                setShowSlotDetailModal(false);
                setSelectedSlot(null);
              }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đề xuất đổi lịch */}
      {showRescheduleModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-edit-form">
            <button className="modal-close" onClick={() => {
              setShowRescheduleModal(false);
              setSelectedSlot(null);
              resetForm();
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Đề xuất đổi lịch</h2>
            <form onSubmit={handleProposeReschedule}>
              <div className="modal-create-grid">
                <div>
                  <label>Thời gian bắt đầu mới *</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="01/11/2025 14:00"
                    required
                  />
                </div>
                <div>
                  <label>Thời gian kết thúc mới *</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="01/11/2025 16:00"
                    required
                  />
                </div>
                <div>
                  <label>Địa điểm / Link mới</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Lý do (tùy chọn)</label>
                  <textarea
                    value={formData.reason || ""}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    placeholder="Nhập lý do đề xuất đổi lịch..."
                  />
                </div>
              </div>
              <div style={{
                padding: 12,
                background: "#fef3c7",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: "#92400e"
              }}>
                <FaExclamationTriangle style={{ marginRight: 6 }} />
                Đề xuất đổi lịch sẽ được gửi đến tất cả sinh viên đã đăng ký. 
                Cần >= 50% đồng ý để áp dụng thay đổi.
              </div>
              <button type="submit" className="modal-submit">Gửi đề xuất</button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button type="button" className="back-link" onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedSlot(null);
                  resetForm();
                }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy */}
      {showCancelModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-detail-form" style={{ maxWidth: 500 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Xác nhận hủy lịch rảnh</h2>
            <p style={{ marginBottom: 20, color: "#64748b" }}>
              Bạn có chắc chắn muốn hủy lịch rảnh này? Tất cả sinh viên đã đăng ký sẽ nhận được thông báo.
            </p>
            <div style={{ marginBottom: 20, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
              <strong>{selectedSlot.topic || "Buổi tư vấn"}</strong>
              <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
                {selectedSlot.start_time} - {selectedSlot.end_time}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                Đã có {selectedSlot.registered_participants?.length || 0} sinh viên đăng ký
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDeleteSlot}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Xác nhận hủy
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSlot(null);
                }}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Schedule;

