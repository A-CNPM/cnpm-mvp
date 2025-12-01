import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import ProgressTrackingService from "../../api/progressTracking";
import { FaStar, FaCalendarAlt, FaUser, FaBook, FaCheckCircle, FaExclamationTriangle, FaEdit, FaTrash, FaPlus, FaChartLine, FaSpinner } from "react-icons/fa";

function Feedback() {
  const tutorId = localStorage.getItem("username") || "b.tutor";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [sessionsWithFeedback, setSessionsWithFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState("sessions"); // "sessions" hoặc "students"
  
  // State cho modal ghi nhận tiến bộ
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [progressForm, setProgressForm] = useState({
    progress_type: "progress",
    content: ""
  });

  useEffect(() => {
    loadData();
  }, [tutorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sessions = await ProgressTrackingService.getTutorSessionsWithFeedback(tutorId);
      // Chỉ hiển thị sessions "Đã hoàn thành" hoặc "Đã kết thúc"
      const completedSessions = sessions.filter(session => 
        session.status === "Hoàn thành" || 
        session.status === "Đã kết thúc" ||
        session.status === "Đã hoàn thành"
      );
      setSessionsWithFeedback(completedSessions);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showMessage("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
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

  const handleOpenProgressModal = (session, menteeId) => {
    setSelectedSession(session);
    setSelectedMentee(menteeId);
    setProgressForm({
      progress_type: "progress",
      content: ""
    });
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setSelectedSession(null);
    setSelectedMentee(null);
    setProgressForm({
      progress_type: "progress",
      content: ""
    });
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedMentee) return;
    
    try {
      const result = await ProgressTrackingService.createProgressTracking({
        session_id: selectedSession.sessionID,
        mentee_id: selectedMentee,
        progress_type: progressForm.progress_type,
        content: progressForm.content
      }, tutorId);
      
      if (result.success) {
        showMessage("Đã ghi nhận tiến bộ thành công!", "success");
        handleCloseProgressModal();
        loadData();
      }
    } catch (error) {
      showMessage(error.message || "Ghi nhận tiến bộ thất bại", "error");
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            style={{
              fontSize: 16,
              color: star <= rating ? "#fbbf24" : "#d1d5db"
            }}
          />
        ))}
      </div>
    );
  };

  // Lấy danh sách mentees duy nhất từ tất cả sessions
  const getUniqueMentees = () => {
    const menteeMap = new Map();
    sessionsWithFeedback.forEach(session => {
      session.participants?.forEach(menteeId => {
        if (!menteeMap.has(menteeId)) {
          menteeMap.set(menteeId, {
            mentee_id: menteeId,
            sessions: []
          });
        }
        menteeMap.get(menteeId).sessions.push(session);
      });
    });
    return Array.from(menteeMap.values());
  };

  return (
    <div className="tutor-dashboard">
      <main className="main-content">
        <div className="tutor-header">
          <h1 className="tutor-title">Tutor</h1>
          <div className="tutor-email">{tutorId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Theo dõi & Phản hồi</h2>

        {/* Thông báo */}
        {message && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            background: messageType === "success" ? "#d1fae5" : "#fee2e2",
            color: messageType === "success" ? "#065f46" : "#991b1b",
            fontSize: 14
          }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          borderBottom: "2px solid #e2e8f0"
        }}>
          <button
            onClick={() => setActiveTab("sessions")}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "sessions" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "sessions" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "sessions" ? 600 : 400,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Lịch sử buổi tư vấn ({sessionsWithFeedback.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "students" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "students" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "students" ? 600 : 400,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Sinh viên ({getUniqueMentees().length})
          </button>
        </div>

        {/* Tab: Lịch sử buổi tư vấn */}
        {activeTab === "sessions" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
                <p>Đang tải...</p>
              </div>
            ) : sessionsWithFeedback.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 40,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ color: "#64748b", fontSize: 16 }}>
                  Chưa có buổi tư vấn nào.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {sessionsWithFeedback.map((session) => (
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
                    {/* Thông tin session */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <FaBook style={{ color: "#4f46e5" }} />
                        <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>{session.topic}</h3>
                        <span style={{
                          padding: "4px 12px",
                          background: session.status === "Hoàn thành" ? "#d1fae5" : "#e0e7ff",
                          color: session.status === "Hoàn thành" ? "#065f46" : "#3730a3",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {session.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "#64748b", marginLeft: 28 }}>
                        <span><FaCalendarAlt /> {session.startTime} - {session.endTime}</span>
                        <span><FaUser /> {session.participants?.length || 0} sinh viên</span>
                      </div>
                    </div>

                    {/* Phản hồi từ mentee */}
                    {session.reviews && session.reviews.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1e293b" }}>
                          Phản hồi từ sinh viên ({session.reviews.length})
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {session.reviews.map((review) => (
                            <div
                              key={review.review_id}
                              style={{
                                padding: 12,
                                background: "#f8fafc",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                                    {review.user_name || review.user_id}
                                  </div>
                                  <div style={{ fontSize: 12, color: "#64748b" }}>
                                    {new Date(review.created_at).toLocaleString("vi-VN")}
                                  </div>
                                </div>
                                {renderStars(review.rating)}
                              </div>
                              {review.comment && (
                                <div style={{ fontSize: 14, color: "#374151", marginTop: 8 }}>
                                  {review.comment}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ghi nhận tiến bộ */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
                          Ghi nhận tiến bộ ({session.progress_trackings?.length || 0})
                        </h4>
                      </div>
                      {session.progress_trackings && session.progress_trackings.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {session.progress_trackings.map((tracking) => (
                            <div
                              key={tracking.tracking_id}
                              style={{
                                padding: 12,
                                background: tracking.progress_type === "progress" ? "#d1fae5" : "#fef3c7",
                                borderRadius: 8,
                                border: `1px solid ${tracking.progress_type === "progress" ? "#10b981" : "#f59e0b"}`
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    {tracking.progress_type === "progress" ? (
                                      <FaCheckCircle style={{ color: "#10b981" }} />
                                    ) : (
                                      <FaExclamationTriangle style={{ color: "#f59e0b" }} />
                                    )}
                                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                      {tracking.mentee_name || tracking.mentee_id}
                                    </span>
                                    <span style={{
                                      padding: "2px 8px",
                                      background: tracking.progress_type === "progress" ? "#10b981" : "#f59e0b",
                                      color: "#fff",
                                      borderRadius: 4,
                                      fontSize: 11,
                                      fontWeight: 600
                                    }}>
                                      {tracking.progress_type === "progress" ? "Tiến bộ" : "Hạn chế"}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 12, color: "#64748b" }}>
                                    {new Date(tracking.created_at).toLocaleString("vi-VN")}
                                  </div>
                                </div>
                              </div>
                              <div style={{ fontSize: 14, color: "#374151", marginTop: 8 }}>
                                {tracking.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                          Chưa có ghi nhận tiến bộ nào
                        </div>
                      )}
                      
                      {/* Nút thêm ghi nhận tiến bộ */}
                      {session.participants && session.participants.length > 0 && (
                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {session.participants.map((menteeId) => (
                            <button
                              key={menteeId}
                              onClick={() => handleOpenProgressModal(session, menteeId)}
                              style={{
                                padding: "6px 12px",
                                background: "#6366f1",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 12,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6
                              }}
                            >
                              <FaPlus /> Ghi nhận cho {menteeId}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Sinh viên */}
        {activeTab === "students" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
                <p>Đang tải...</p>
              </div>
            ) : getUniqueMentees().length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 40,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ color: "#64748b", fontSize: 16 }}>
                  Chưa có sinh viên nào.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {getUniqueMentees().map((mentee) => (
                  <div
                    key={mentee.mentee_id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1e293b" }}>
                          {mentee.mentee_id}@hcmut.edu.vn
                        </h3>
                        <div style={{ fontSize: 14, color: "#64748b" }}>
                          Đã tham gia {mentee.sessions.length} buổi tư vấn
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const summary = await ProgressTrackingService.getMenteeProgressSummary(mentee.mentee_id, tutorId);
                            if (summary) {
                              alert(`Tổng hợp tiến bộ:\n- Tổng số buổi: ${summary.total_sessions}\n- Ghi nhận tiến bộ: ${summary.total_progress_records}\n- Ghi nhận hạn chế: ${summary.total_limitation_records}\n- Điểm đánh giá trung bình: ${summary.average_rating || "N/A"}`);
                            }
                          } catch (error) {
                            showMessage("Không thể lấy tổng hợp tiến bộ", "error");
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaChartLine /> Xem tổng hợp
                      </button>
                    </div>
                    
                    {/* Danh sách sessions của mentee này */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {mentee.sessions.slice(0, 5).map((session) => (
                        <div
                          key={session.sessionID}
                          style={{
                            padding: 12,
                            background: "#f8fafc",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                            {session.topic}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {session.startTime} - {session.endTime}
                          </div>
                        </div>
                      ))}
                      {mentee.sessions.length > 5 && (
                        <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", padding: 8 }}>
                          Và {mentee.sessions.length - 5} buổi tư vấn khác...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal ghi nhận tiến bộ */}
        {showProgressModal && selectedSession && selectedMentee && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              padding: 25,
              borderRadius: 12,
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b" }}>
                Ghi nhận tiến bộ/hạn chế học tập
              </h3>
              
              <div style={{ marginBottom: 20, padding: 15, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Buổi tư vấn:</strong> {selectedSession.topic}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Sinh viên:</strong> {selectedMentee}@hcmut.edu.vn
                </div>
                <div>
                  <strong>Thời gian:</strong> {selectedSession.startTime} - {selectedSession.endTime}
                </div>
              </div>

              <form onSubmit={handleSubmitProgress}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    Loại ghi nhận <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={progressForm.progress_type}
                    onChange={(e) => setProgressForm({ ...progressForm, progress_type: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14
                    }}
                  >
                    <option value="progress">Tiến bộ</option>
                    <option value="limitation">Hạn chế</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    Nội dung <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={progressForm.content}
                    onChange={(e) => setProgressForm({ ...progressForm, content: e.target.value })}
                    rows={6}
                    placeholder="Mô tả chi tiết về tiến bộ hoặc hạn chế học tập của sinh viên..."
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleCloseProgressModal}
                    style={{
                      padding: "10px 20px",
                      background: "transparent",
                      color: "#64748b",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Lưu ghi nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Feedback;

