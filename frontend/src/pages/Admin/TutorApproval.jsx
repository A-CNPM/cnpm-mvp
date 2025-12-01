import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AdminService from "../../api/admin";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner, FaUser, FaGraduationCap, FaBook, FaAward, FaFileAlt, FaClock } from "react-icons/fa";

function TutorApproval() {
  const adminId = localStorage.getItem("username") || "admin.khoa";
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve", "reject", "request_more_info"
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "", "Chờ duyệt", "Yêu cầu bổ sung"

  useEffect(() => {
    loadRegistrations();
  }, [adminId, filterStatus]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getPendingTutorRegistrations(adminId);
      // Lọc theo status nếu có
      let filtered = data;
      if (filterStatus) {
        filtered = data.filter(reg => reg.status === filterStatus);
      }
      setRegistrations(filtered);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hồ sơ:", error);
      showMessage("Không thể tải danh sách hồ sơ đăng ký", "error");
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

  const handleViewDetail = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleOpenActionModal = (registration, action) => {
    setSelectedRegistration(registration);
    setActionType(action);
    setReason("");
    setShowActionModal(true);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!selectedRegistration) return;

    // Kiểm tra reason cho reject và request_more_info
    if ((actionType === "reject" || actionType === "request_more_info") && !reason.trim()) {
      showMessage("Vui lòng nhập lý do", "error");
      return;
    }

    try {
      const result = await AdminService.approveTutorRegistration({
        registration_id: selectedRegistration.registration_id,
        action: actionType,
        reason: reason.trim() || null,
        admin_id: adminId
      });

      if (result.success) {
        showMessage(result.message, "success");
        setShowActionModal(false);
        setShowDetailModal(false);
        setSelectedRegistration(null);
        loadRegistrations();
      }
    } catch (error) {
      showMessage(error.message || "Thao tác thất bại", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return { text: "Chờ duyệt", color: "#f59e0b", bg: "#fef3c7" };
      case "Yêu cầu bổ sung":
        return { text: "Yêu cầu bổ sung", color: "#6366f1", bg: "#e0e7ff" };
      case "Đã phê duyệt":
        return { text: "Đã phê duyệt", color: "#10b981", bg: "#d1fae5" };
      case "Từ chối":
        return { text: "Từ chối", color: "#ef4444", bg: "#fee2e2" };
      default:
        return { text: status, color: "#64748b", bg: "#f1f5f9" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="admin-dashboard">
        <main className="main-content">
          <div className="admin-header">
            <h1 className="admin-title">Admin</h1>
            <div className="admin-email">{adminId}@hcmut.edu.vn</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="main-title">Xác thực vai trò Tutor</h2>
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
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Yêu cầu bổ sung">Yêu cầu bổ sung</option>
            </select>
            <div style={{ fontSize: 13, color: "#64748b", marginLeft: "auto" }}>
              Tổng số: <strong>{registrations.length}</strong> hồ sơ
            </div>
          </div>
          
          {/* Danh sách hồ sơ */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
              <p>Đang tải...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <FaFileAlt style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
              <p style={{ color: "#64748b" }}>
                {filterStatus ? `Không có hồ sơ nào với trạng thái "${filterStatus}"` : "Không có hồ sơ đăng ký nào đang chờ duyệt"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {registrations.map((reg) => {
                const statusBadge = getStatusBadge(reg.status);
                
                return (
                  <div
                    key={reg.registration_id}
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
                            {reg.user_name || reg.user_id}
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
                        
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaUser /> {reg.user_email || `${reg.user_id}@hcmut.edu.vn`}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaGraduationCap /> {reg.khoa || "N/A"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaClock /> {formatDate(reg.submitted_at)}
                          </span>
                        </div>

                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                          <strong>GPA:</strong> {reg.gpa || "N/A"} | <strong>Năm học:</strong> {reg.nam_hoc || "N/A"}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleViewDetail(reg)}
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
                          Xem chi tiết
                        </button>
                        {reg.status === "Chờ duyệt" && (
                          <>
                            <button
                              onClick={() => handleOpenActionModal(reg, "approve")}
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
                              <FaCheckCircle /> Phê duyệt
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(reg, "reject")}
                              style={{
                                padding: "8px 16px",
                                background: "#ef4444",
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
                              <FaTimesCircle /> Từ chối
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(reg, "request_more_info")}
                              style={{
                                padding: "8px 16px",
                                background: "#f59e0b",
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
                              <FaExclamationTriangle /> Yêu cầu bổ sung
                            </button>
                          </>
                        )}
                        {reg.status === "Yêu cầu bổ sung" && (
                          <>
                            <button
                              onClick={() => handleOpenActionModal(reg, "approve")}
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
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(reg, "reject")}
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
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal chi tiết hồ sơ */}
      {showDetailModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal-detail-form" style={{ maxWidth: 800, maxHeight: "90vh", overflowY: "auto" }}>
            <button className="modal-close" onClick={() => {
              setShowDetailModal(false);
              setSelectedRegistration(null);
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>Chi tiết hồ sơ đăng ký Tutor</h2>
            
            <div className="modal-detail-grid">
              <div>
                <label>Họ và tên</label>
                <input value={selectedRegistration.user_name || selectedRegistration.user_id} readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value={selectedRegistration.user_email || `${selectedRegistration.user_id}@hcmut.edu.vn`} readOnly />
              </div>
              <div>
                <label>Khoa</label>
                <input value={selectedRegistration.khoa || "N/A"} readOnly />
              </div>
              <div>
                <label>GPA</label>
                <input value={selectedRegistration.gpa || "N/A"} readOnly />
              </div>
              <div>
                <label>Năm học</label>
                <input value={selectedRegistration.nam_hoc || "N/A"} readOnly />
              </div>
              <div>
                <label>Tình trạng học tập</label>
                <input value={selectedRegistration.tinh_trang_hoc_tap || "N/A"} readOnly />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Hồ sơ năng lực</label>
              <textarea
                value={selectedRegistration.ho_so_nang_luc || "Chưa có"}
                readOnly
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#f8fafc"
                }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Chứng chỉ</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedRegistration.chung_chi && selectedRegistration.chung_chi.length > 0 ? (
                  selectedRegistration.chung_chi.map((cert, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "6px 12px",
                        background: "#e0e7ff",
                        color: "#6366f1",
                        borderRadius: 20,
                        fontSize: 13
                      }}
                    >
                      <FaAward style={{ marginRight: 4 }} />
                      {cert}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#64748b" }}>Chưa có chứng chỉ</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Môn muốn dạy</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedRegistration.mon_muon_day && selectedRegistration.mon_muon_day.length > 0 ? (
                  selectedRegistration.mon_muon_day.map((mon, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "6px 12px",
                        background: "#d1fae5",
                        color: "#065f46",
                        borderRadius: 20,
                        fontSize: 13
                      }}
                    >
                      <FaBook style={{ marginRight: 4 }} />
                      {mon}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#64748b" }}>Chưa có</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Kinh nghiệm</label>
              <textarea
                value={selectedRegistration.kinh_nghiem || "Chưa có"}
                readOnly
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#f8fafc"
                }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Lý do đăng ký</label>
              <textarea
                value={selectedRegistration.ly_do_dang_ky || "Chưa có"}
                readOnly
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#f8fafc"
                }}
              />
            </div>

            <div style={{ marginTop: 20, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                <strong>Thời gian nộp:</strong> {formatDate(selectedRegistration.submitted_at)}
              </div>
              {selectedRegistration.updated_at && (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  <strong>Cập nhật lần cuối:</strong> {formatDate(selectedRegistration.updated_at)}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {selectedRegistration.status === "Chờ duyệt" && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenActionModal(selectedRegistration, "approve");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FaCheckCircle /> Phê duyệt
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenActionModal(selectedRegistration, "reject");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FaTimesCircle /> Từ chối
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenActionModal(selectedRegistration, "request_more_info");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      background: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FaExclamationTriangle /> Yêu cầu bổ sung
                  </button>
                </>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button type="button" className="back-link" onClick={() => {
                setShowDetailModal(false);
                setSelectedRegistration(null);
              }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal phê duyệt/từ chối/yêu cầu bổ sung */}
      {showActionModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal-edit-form" style={{ maxWidth: 600 }}>
            <button className="modal-close" onClick={() => {
              setShowActionModal(false);
              setSelectedRegistration(null);
              setActionType("");
              setReason("");
            }}>×</button>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              {actionType === "approve" ? "Phê duyệt hồ sơ" :
               actionType === "reject" ? "Từ chối hồ sơ" :
               "Yêu cầu bổ sung thông tin"}
            </h2>
            <form onSubmit={handleSubmitAction}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Hồ sơ của: <strong>{selectedRegistration.user_name || selectedRegistration.user_id}</strong>
                </label>
              </div>
              
              {(actionType === "reject" || actionType === "request_more_info") && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Lý do <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder={actionType === "reject" ? "Nhập lý do từ chối..." : "Nhập thông tin cần bổ sung..."}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              )}

              {actionType === "approve" && (
                <div style={{
                  padding: 12,
                  background: "#d1fae5",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#065f46"
                }}>
                  <FaCheckCircle style={{ marginRight: 6 }} />
                  Bạn có chắc chắn muốn phê duyệt hồ sơ này? Sau khi phê duyệt, user sẽ được cấp quyền Tutor.
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: actionType === "approve" ? "#10b981" : actionType === "reject" ? "#ef4444" : "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {actionType === "approve" ? "Phê duyệt" :
                   actionType === "reject" ? "Từ chối" :
                   "Gửi yêu cầu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedRegistration(null);
                    setActionType("");
                    setReason("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
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

export default TutorApproval;

