import { FaCalendar, FaPaperclip, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaGlobe, FaExclamationTriangle, FaSpinner, FaBook, FaFileUpload, FaLink, FaStickyNote, FaSave } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";
import SessionService from "../../api/session";

function Meeting() {
  const tutorId = localStorage.getItem("username") || "b.tutor";
  const [activeTab, setActiveTab] = useState("sessions"); // Chỉ còn "sessions"
  
  // State cho slots (lịch rảnh)
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // State cho sessions (buổi tư vấn đã xác nhận)
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // State cho modals
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [showSlotDetailModal, setShowSlotDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // State cho session management
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSessionCancelModal, setShowSessionCancelModal] = useState(false);
  const [showSessionRescheduleModal, setShowSessionRescheduleModal] = useState(false);
  const [sessionResources, setSessionResources] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // State cho resource form
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    type: "Document",
    url: "",
    accessLevel: "session",
    allowedMentees: [],
    source: "upload",
    libraryResourceId: ""
  });
  
  // State cho note form
  const [noteForm, setNoteForm] = useState({
    content: "",
    is_draft: false
  });
  
  // State cho form
  const [formData, setFormData] = useState({
    topic: "",
    start_time: "",
    end_time: "",
    mode: "Online",
    location: "",
    max_participants: 5,
    min_participants: 2
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadSlots();
    loadSessions();
    
    // Tự động refresh mỗi 10 giây để kiểm tra slot đã đạt ngưỡng chưa
    const interval = setInterval(() => {
      loadSlots();
      loadSessions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [tutorId]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await AvailableSlotService.getTutorSlots(tutorId);
      setSlots(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch rảnh:", error);
      showMessage("Không thể tải danh sách lịch rảnh", "error");
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      // Lấy sessions từ tutor
      const data = await SessionService.getUserSessions(tutorId);
      // Chỉ hiển thị "Sắp diễn ra" và "Đã hủy" (không hiển thị "Đã hoàn thành" và "Đang mở đăng ký")
      const filteredSessions = data.filter(session => 
        session.status === "Sắp diễn ra" || 
        session.status === "Đã hủy" || 
        session.status === "Bị hủy" ||
        session.status === "Đang diễn ra"
      );
      setSessions(filteredSessions);
    } catch (error) {
      console.error("Lỗi khi tải buổi tư vấn:", error);
    } finally {
      setLoadingSessions(false);
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
        loadSessions();
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

  const handleCancelSession = async () => {
    if (!selectedSession) return;
    
    try {
      const result = await SessionService.cancelSessionByTutor(
        selectedSession.sessionID,
        tutorId,
        sessionCancelReason || null
      );
      
      if (result.success) {
        showMessage("Đã gửi thông báo hủy session. Đang chờ phản hồi từ sinh viên.", "success");
        setShowSessionCancelModal(false);
        setSessionCancelReason("");
        loadSessions();
      }
    } catch (error) {
      showMessage(error.message || "Hủy session thất bại", "error");
    }
  };

  const handleRescheduleSession = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      const result = await SessionService.rescheduleSessionByTutor(
        selectedSession.sessionID,
        tutorId,
        sessionRescheduleForm.new_start_time,
        sessionRescheduleForm.new_end_time,
        sessionRescheduleForm.new_location || null,
        sessionRescheduleForm.reason || null
      );
      
      if (result.success) {
        showMessage("Đã gửi đề xuất đổi lịch. Đang chờ phản hồi từ sinh viên.", "success");
        setShowSessionRescheduleModal(false);
        setSessionRescheduleForm({
          new_start_time: "",
          new_end_time: "",
          new_location: "",
          reason: ""
        });
        loadSessions();
      }
    } catch (error) {
      showMessage(error.message || "Đề xuất đổi lịch thất bại", "error");
    }
  };

  const loadSessionDetails = async (sessionId) => {
    setLoadingResources(true);
    setLoadingNotes(true);
    try {
      const [resources, notes] = await Promise.all([
        SessionService.getSessionResources(sessionId, tutorId),
        SessionService.getSessionNotes(sessionId, tutorId)
      ]);
      setSessionResources(resources || []);
      setSessionNotes(notes || []);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết session:", error);
      setSessionResources([]);
      setSessionNotes([]);
    } finally {
      setLoadingResources(false);
      setLoadingNotes(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      const result = await SessionService.createResource(selectedSession.sessionID, {
        title: resourceForm.title,
        description: resourceForm.description,
        type: resourceForm.type,
        url: resourceForm.url,
        accessLevel: resourceForm.accessLevel,
        allowedMentees: resourceForm.allowedMentees,
        source: resourceForm.source,
        libraryResourceId: resourceForm.libraryResourceId || null
      }, tutorId);
      
      if (result.success) {
        showMessage("Thêm tài liệu thành công!", "success");
        setShowResourceModal(false);
        resetResourceForm();
        loadSessionDetails(selectedSession.sessionID);
      }
    } catch (error) {
      showMessage(error.message || "Thêm tài liệu thất bại", "error");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!selectedSession) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    
    try {
      const result = await SessionService.deleteResource(selectedSession.sessionID, resourceId, tutorId);
      if (result.success) {
        showMessage("Đã xóa tài liệu thành công!", "success");
        loadSessionDetails(selectedSession.sessionID);
      }
    } catch (error) {
      showMessage(error.message || "Xóa tài liệu thất bại", "error");
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      let result;
      if (sessionNotes.length > 0 && sessionNotes[0].note_id) {
        // Cập nhật note hiện có
        result = await SessionService.updateSessionNote(sessionNotes[0].note_id, {
          content: noteForm.content,
          is_draft: noteForm.is_draft
        }, tutorId);
      } else {
        // Tạo note mới
        result = await SessionService.createSessionNote(selectedSession.sessionID, {
          content: noteForm.content,
          is_draft: noteForm.is_draft
        }, tutorId);
      }
      
      if (result.success) {
        showMessage(noteForm.is_draft ? "Đã lưu nháp!" : "Đã lưu ghi chú thành công!", "success");
        setShowNoteModal(false);
        resetNoteForm();
        loadSessionDetails(selectedSession.sessionID);
      }
    } catch (error) {
      showMessage(error.message || "Lưu ghi chú thất bại", "error");
    }
  };

  const resetResourceForm = () => {
    setResourceForm({
      title: "",
      description: "",
      type: "Document",
      url: "",
      accessLevel: "session",
      allowedMentees: [],
      source: "upload",
      libraryResourceId: ""
    });
  };

  const resetNoteForm = () => {
    setNoteForm({
      content: "",
      is_draft: false
    });
  };

  const openResourceModal = () => {
    resetResourceForm();
    setShowResourceModal(true);
  };

  const openNoteModal = () => {
    if (sessionNotes.length > 0) {
      setNoteForm({
        content: sessionNotes[0].content || "",
        is_draft: sessionNotes[0].is_draft || false
      });
    } else {
      resetNoteForm();
    }
    setShowNoteModal(true);
  };

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case "draft": return "Nháp";
      case "private": return "Chỉ định mentee";
      case "session": return "Cả lớp/phiên";
      case "public": return "Công khai";
      default: return level;
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "Document": return <FaPaperclip style={{ color: "#ef4444" }} />;
      case "Video": return <FaBook style={{ color: "#3b82f6" }} />;
      case "Link": return <FaGlobe style={{ color: "#10b981" }} />;
      default: return <FaPaperclip style={{ color: "#64748b" }} />;
    }
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
    
    if (slot.status === "Đã chuyển thành session") {
      return { text: "Đã chuyển thành session", color: "#10b981", bg: "#d1fae5" };
    }
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

  return (
    <>
      <div className="tutor-dashboard">
        <main className="main-content">
          <div className="tutor-header">
            <h1 className="tutor-title">Tutor</h1>
            <div className="tutor-email">{tutorId}@hcmut.edu.vn</div>
          </div>
          
          <h2 className="main-title">Quản lý buổi tư vấn</h2>
          
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
          
          {/* Content */}
          <div>
              {loadingSessions ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24 }} />
                  <p>Đang tải...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b" }}>Chưa có buổi tư vấn nào</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {sessions.map((session) => (
                    <div
                      key={session.sessionID}
                      style={{
                        background: "#fff",
                        padding: 20,
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 12px 0", fontSize: 18, color: "#1e293b" }}>
                            {session.topic || "Buổi tư vấn"}
                          </h3>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "#64748b" }}>
                            <span><FaClock /> {session.startTime} - {session.endTime}</span>
                            <span><FaGlobe /> {session.mode}</span>
                            <span><FaUsers /> {session.participants?.length || 0}/{session.maxParticipants}</span>
                            {session.resources && session.resources.length > 0 && (
                              <span><FaPaperclip /> {session.resources.length} tài liệu</span>
                            )}
                          </div>
                          {session.location && (
                            <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                              <FaGlobe style={{ marginRight: 6 }} />
                              {session.location}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{
                            padding: "4px 12px",
                            background: session.status === "Đã hoàn thành" ? "#d1fae5" : session.status === "Bị hủy" ? "#fee2e2" : "#e0e7ff",
                            color: session.status === "Đã hoàn thành" ? "#065f46" : session.status === "Bị hủy" ? "#991b1b" : "#3730a3",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {session.status}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              loadSessionDetails(session.sessionID);
                              setShowSessionDetailModal(true);
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
                            Quản lý
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                Cần {'>='} 50% đồng ý để áp dụng thay đổi.
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

      {/* Modal quản lý session (học liệu & ghi chú) */}
      {showSessionDetailModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-detail-form" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <button className="modal-close" onClick={() => {
              setShowSessionDetailModal(false);
              setSelectedSession(null);
              setSessionResources([]);
              setSessionNotes([]);
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Quản lý buổi tư vấn</h2>
            
            {/* Thông tin session */}
            <div className="modal-detail-grid" style={{ marginBottom: 24 }}>
              <div>
                <label>Chủ đề</label>
                <input value={selectedSession.topic || "Chưa có"} readOnly />
              </div>
              <div>
                <label>Thời gian</label>
                <input value={`${selectedSession.startTime} - ${selectedSession.endTime}`} readOnly />
              </div>
              <div>
                <label>Hình thức</label>
                <input value={selectedSession.mode} readOnly />
              </div>
              <div>
                <label>Địa điểm / Link</label>
                <input value={selectedSession.location || "Chưa có"} readOnly />
              </div>
              <div>
                <label>Số lượng tham gia</label>
                <input value={`${selectedSession.participants?.length || 0}/${selectedSession.maxParticipants}`} readOnly />
              </div>
              <div>
                <label>Trạng thái</label>
                <input value={selectedSession.status} readOnly />
              </div>
            </div>

            {/* Danh sách participants */}
            {selectedSession.participants && selectedSession.participants.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Danh sách sinh viên tham gia:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedSession.participants.map((participantId, idx) => (
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

            {/* Học liệu */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 16 }}>Học liệu</label>
                <button
                  onClick={openResourceModal}
                  style={{
                    padding: "6px 12px",
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
                  <FaFileUpload /> Thêm tài liệu
                </button>
              </div>
              
              {loadingResources ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                  <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
                  Đang tải...
                </div>
              ) : sessionResources.length === 0 ? (
                <div style={{ padding: 20, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#94a3b8" }}>
                  Chưa có tài liệu nào
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {sessionResources.map((resource) => (
                    <div
                      key={resource.resourceID}
                      style={{
                        padding: 12,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div style={{ fontSize: 20 }}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                            {resource.title}
                          </div>
                          {resource.description && (
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                              {resource.description}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {getAccessLevelLabel(resource.accessLevel)} • {resource.source === "library" ? "HCMUT_LIBRARY" : "Tải lên"} • {new Date(resource.uploadDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {resource.url && (
                          <button
                            onClick={() => window.open(resource.url, '_blank')}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer"
                            }}
                          >
                            <FaGlobe style={{ marginRight: 4 }} /> Truy cập
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteResource(resource.resourceID)}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer"
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ghi chú & biên bản */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 16 }}>Ghi chú & biên bản</label>
                <button
                  onClick={openNoteModal}
                  style={{
                    padding: "6px 12px",
                    background: "#6366f1",
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
                  <FaStickyNote /> {sessionNotes.length > 0 ? "Chỉnh sửa" : "Thêm ghi chú"}
                </button>
              </div>
              
              {loadingNotes ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                  <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
                  Đang tải...
                </div>
              ) : sessionNotes.length === 0 ? (
                <div style={{ padding: 20, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#94a3b8" }}>
                  Chưa có ghi chú nào
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {sessionNotes.map((note) => (
                    <div
                      key={note.note_id}
                      style={{
                        padding: 16,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(note.created_at).toLocaleString("vi-VN")}
                          {note.is_draft && (
                            <span style={{ marginLeft: 8, padding: "2px 8px", background: "#fef3c7", color: "#92400e", borderRadius: 4, fontSize: 11 }}>
                              Nháp
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setNoteForm({
                              content: note.content,
                              is_draft: note.is_draft
                            });
                            setShowNoteModal(true);
                          }}
                          style={{
                            padding: "4px 8px",
                            background: "transparent",
                            color: "#6366f1",
                            border: "1px solid #6366f1",
                            borderRadius: 4,
                            fontSize: 11,
                            cursor: "pointer"
                          }}
                        >
                          <FaEdit /> Chỉnh sửa
                        </button>
                      </div>
                      <div style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap" }}>
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nút hủy và đổi lịch session */}
            {selectedSession && (selectedSession.status === "Sắp diễn ra" || selectedSession.status === "Đang diễn ra") && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowSessionCancelModal(true)}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  <FaTimesCircle style={{ marginRight: 6 }} />
                  Hủy buổi tư vấn
                </button>
                <button
                  onClick={() => {
                    setSessionRescheduleForm({
                      new_start_time: selectedSession.startTime,
                      new_end_time: selectedSession.endTime,
                      new_location: selectedSession.location || "",
                      reason: ""
                    });
                    setShowSessionRescheduleModal(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  <FaEdit style={{ marginRight: 6 }} />
                  Đề xuất đổi lịch
                </button>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setShowSessionDetailModal(false);
                  setSelectedSession(null);
                  setSessionResources([]);
                  setSessionNotes([]);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm tài liệu */}
      {showResourceModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-create-form" style={{ maxWidth: "600px" }}>
            <button className="modal-close" onClick={() => {
              setShowResourceModal(false);
              resetResourceForm();
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Thêm tài liệu</h2>
            <form onSubmit={handleCreateResource}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label>Nguồn tài liệu *</label>
                  <select
                    value={resourceForm.source}
                    onChange={(e) => setResourceForm({ ...resourceForm, source: e.target.value })}
                    required
                  >
                    <option value="upload">Tải lên</option>
                    <option value="library">HCMUT_LIBRARY</option>
                  </select>
                </div>

                {resourceForm.source === "library" && (
                  <div>
                    <label>ID tài liệu từ HCMUT_LIBRARY *</label>
                    <input
                      type="text"
                      value={resourceForm.libraryResourceId}
                      onChange={(e) => setResourceForm({ ...resourceForm, libraryResourceId: e.target.value })}
                      placeholder="Nhập ID tài liệu từ thư viện"
                      required={resourceForm.source === "library"}
                    />
                    <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                      Cần xác thực quyền truy cập từ HCMUT_LIBRARY
                    </div>
                  </div>
                )}

                <div>
                  <label>Tiêu đề *</label>
                  <input
                    type="text"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    placeholder="VD: Tài liệu hướng dẫn DSA"
                    required
                  />
                </div>

                <div>
                  <label>Mô tả</label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả về tài liệu..."
                  />
                </div>

                <div>
                  <label>Loại *</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    required
                  >
                    <option value="Document">Tài liệu</option>
                    <option value="Video">Video</option>
                    <option value="Link">Liên kết</option>
                  </select>
                </div>

                <div>
                  <label>URL / Link *</label>
                  <input
                    type="text"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    placeholder={resourceForm.source === "library" ? "URL từ HCMUT_LIBRARY" : "https://..."}
                    required
                  />
                </div>

                <div>
                  <label>Quyền truy cập *</label>
                  <select
                    value={resourceForm.accessLevel}
                    onChange={(e) => setResourceForm({ ...resourceForm, accessLevel: e.target.value })}
                    required
                  >
                    <option value="draft">Nháp (chỉ tutor thấy)</option>
                    <option value="private">Chỉ định mentee</option>
                    <option value="session">Cả lớp/phiên</option>
                    <option value="public">Công khai</option>
                  </select>
                </div>

                {resourceForm.accessLevel === "private" && selectedSession.participants && (
                  <div>
                    <label>Chọn mentee được phép truy cập</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                      {selectedSession.participants.map((participantId) => (
                        <label key={participantId} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={resourceForm.allowedMentees.includes(participantId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setResourceForm({
                                  ...resourceForm,
                                  allowedMentees: [...resourceForm.allowedMentees, participantId]
                                });
                              } else {
                                setResourceForm({
                                  ...resourceForm,
                                  allowedMentees: resourceForm.allowedMentees.filter(id => id !== participantId)
                                });
                              }
                            }}
                          />
                          <span style={{ fontSize: 14 }}>{participantId}@hcmut.edu.vn</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="modal-submit" style={{ marginTop: 20 }}>
                <FaSave style={{ marginRight: 6 }} /> Thêm tài liệu
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  type="button"
                  className="back-link"
                  onClick={() => {
                    setShowResourceModal(false);
                    resetResourceForm();
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hủy session */}
      {showSessionCancelModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-detail-form" style={{ maxWidth: 500 }}>
            <button className="modal-close" onClick={() => {
              setShowSessionCancelModal(false);
              setSessionCancelReason("");
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Xác nhận hủy buổi tư vấn</h2>
            <p style={{ marginBottom: 20, color: "#64748b" }}>
              Bạn có chắc chắn muốn hủy buổi tư vấn này? Tất cả sinh viên đã đăng ký sẽ nhận được thông báo với lựa chọn Đồng ý/Từ chối.
            </p>
            <div style={{ marginBottom: 20, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
              <strong>{selectedSession.topic || "Buổi tư vấn"}</strong>
              <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
                {selectedSession.startTime} - {selectedSession.endTime}
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                Đã có {selectedSession.participants?.length || 0} sinh viên tham gia
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Lý do hủy (tùy chọn)</label>
              <textarea
                value={sessionCancelReason}
                onChange={(e) => setSessionCancelReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do hủy buổi tư vấn..."
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0" }}
              />
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
              Thông báo sẽ được gửi đến tất cả sinh viên. Cần {'>='} 50% đồng ý để hủy buổi tư vấn.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleCancelSession}
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
                  setShowSessionCancelModal(false);
                  setSessionCancelReason("");
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

      {/* Modal đề xuất đổi lịch session */}
      {showSessionRescheduleModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-edit-form">
            <button className="modal-close" onClick={() => {
              setShowSessionRescheduleModal(false);
              setSessionRescheduleForm({
                new_start_time: "",
                new_end_time: "",
                new_location: "",
                reason: ""
              });
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Đề xuất đổi lịch buổi tư vấn</h2>
            <form onSubmit={handleRescheduleSession}>
              <div className="modal-create-grid">
                <div>
                  <label>Thời gian bắt đầu mới *</label>
                  <input
                    type="text"
                    value={sessionRescheduleForm.new_start_time}
                    onChange={(e) => setSessionRescheduleForm({ ...sessionRescheduleForm, new_start_time: e.target.value })}
                    placeholder="01/11/2025 14:00"
                    required
                  />
                </div>
                <div>
                  <label>Thời gian kết thúc mới *</label>
                  <input
                    type="text"
                    value={sessionRescheduleForm.new_end_time}
                    onChange={(e) => setSessionRescheduleForm({ ...sessionRescheduleForm, new_end_time: e.target.value })}
                    placeholder="01/11/2025 16:00"
                    required
                  />
                </div>
                <div>
                  <label>Địa điểm / Link mới</label>
                  <input
                    value={sessionRescheduleForm.new_location}
                    onChange={(e) => setSessionRescheduleForm({ ...sessionRescheduleForm, new_location: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Lý do (tùy chọn)</label>
                  <textarea
                    value={sessionRescheduleForm.reason || ""}
                    onChange={(e) => setSessionRescheduleForm({ ...sessionRescheduleForm, reason: e.target.value })}
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
                Cần {'>='} 50% đồng ý để áp dụng thay đổi.
              </div>
              <button type="submit" className="modal-submit">Gửi đề xuất</button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button type="button" className="back-link" onClick={() => {
                  setShowSessionRescheduleModal(false);
                  setSessionRescheduleForm({
                    new_start_time: "",
                    new_end_time: "",
                    new_location: "",
                    reason: ""
                  });
                }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ghi chú/biên bản */}
      {showNoteModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-create-form" style={{ maxWidth: "700px" }}>
            <button className="modal-close" onClick={() => {
              setShowNoteModal(false);
              resetNoteForm();
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              {sessionNotes.length > 0 ? "Chỉnh sửa ghi chú" : "Thêm ghi chú/biên bản"}
            </h2>
            <form onSubmit={handleSaveNote}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label>Nội dung ghi chú/biên bản *</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    rows={10}
                    placeholder="Nhập nội dung ghi chú hoặc biên bản buổi tư vấn..."
                    required
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={noteForm.is_draft}
                      onChange={(e) => setNoteForm({ ...noteForm, is_draft: e.target.checked })}
                    />
                    <span>Lưu dưới dạng nháp (chỉ tutor thấy)</span>
                  </label>
                  <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                    Nếu không chọn, ghi chú sẽ được lưu và hiển thị cho tất cả participants sau khi buổi tư vấn kết thúc.
                  </div>
                </div>
              </div>

              <button type="submit" className="modal-submit" style={{ marginTop: 20 }}>
                <FaSave style={{ marginRight: 6 }} /> {noteForm.is_draft ? "Lưu nháp" : "Lưu ghi chú"}
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  type="button"
                  className="back-link"
                  onClick={() => {
                    setShowNoteModal(false);
                    resetNoteForm();
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Meeting;
