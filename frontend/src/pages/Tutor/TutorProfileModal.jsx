import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import TutorProfileService from "../../api/tutorProfile";
import { FaUser, FaEdit, FaSave, FaTimes, FaHistory, FaCheckCircle, FaExclamationCircle, FaSync, FaLock, FaUnlock } from "react-icons/fa";

function TutorProfileModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tutorId = id?.split("=")[1] || localStorage.getItem("username") || "b.tutor";
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    linh_vuc_chuyen_mon: [],
    mon_phu_trach: [],
    kinh_nghiem_giang_day: "",
    phuong_thuc_lien_he: "",
    mo_ta: "",
    tags: []
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Temp inputs
  const [tempLinhVuc, setTempLinhVuc] = useState("");
  const [tempMonPhuTrach, setTempMonPhuTrach] = useState("");
  const [tempTag, setTempTag] = useState("");

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, [tutorId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await TutorProfileService.getProfile(tutorId);
      setProfile(data);
      setFormData({
        linh_vuc_chuyen_mon: data.linh_vuc_chuyen_mon || [],
        mon_phu_trach: data.mon_phu_trach || [],
        kinh_nghiem_giang_day: data.kinh_nghiem_giang_day || "",
        phuong_thuc_lien_he: data.phuong_thuc_lien_he || "",
        mo_ta: data.mo_ta || "",
        tags: data.tags || []
      });
    } catch (error) {
      console.error("Lỗi khi tải profile:", error);
      showNotification("Không thể tải thông tin profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await TutorProfileService.getProfileHistory(tutorId);
      setHistory(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const handleSyncFromDatacore = async () => {
    setSyncing(true);
    try {
      const data = await TutorProfileService.syncFromDatacore(tutorId);
      setProfile(data);
      showNotification("Đồng bộ thông tin từ HCMUT_DATACORE thành công!", "success");
      loadHistory();
    } catch (error) {
      console.error("Lỗi khi đồng bộ:", error);
      showNotification(error.message || "Đồng bộ thất bại", "error");
    } finally {
      setSyncing(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.kinh_nghiem_giang_day && formData.kinh_nghiem_giang_day.length > 2000) {
      newErrors.kinh_nghiem_giang_day = "Kinh nghiệm giảng dạy không được vượt quá 2000 ký tự";
    }
    
    if (formData.phuong_thuc_lien_he && formData.phuong_thuc_lien_he.length > 500) {
      newErrors.phuong_thuc_lien_he = "Phương thức liên hệ không được vượt quá 500 ký tự";
    }
    
    if (formData.mo_ta && formData.mo_ta.length > 2000) {
      newErrors.mo_ta = "Mô tả không được vượt quá 2000 ký tự";
    }
    
    if (formData.linh_vuc_chuyen_mon && formData.linh_vuc_chuyen_mon.length > 20) {
      newErrors.linh_vuc_chuyen_mon = "Lĩnh vực chuyên môn không được vượt quá 20 mục";
    }
    
    if (formData.mon_phu_trach && formData.mon_phu_trach.length > 20) {
      newErrors.mon_phu_trach = "Môn phụ trách không được vượt quá 20 mục";
    }
    
    if (formData.tags && formData.tags.length > 20) {
      newErrors.tags = "Tags không được vượt quá 20 mục";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showNotification("Vui lòng kiểm tra lại thông tin đã nhập", "error");
      return;
    }

    try {
      const updateData = {
        linh_vuc_chuyen_mon: formData.linh_vuc_chuyen_mon.length > 0 ? formData.linh_vuc_chuyen_mon : null,
        mon_phu_trach: formData.mon_phu_trach.length > 0 ? formData.mon_phu_trach : null,
        kinh_nghiem_giang_day: formData.kinh_nghiem_giang_day || null,
        phuong_thuc_lien_he: formData.phuong_thuc_lien_he || null,
        mo_ta: formData.mo_ta || null,
        tags: formData.tags.length > 0 ? formData.tags : null
      };

      const updatedProfile = await TutorProfileService.updateProfile(tutorId, updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      loadHistory();
      showNotification("Cập nhật hồ sơ thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      showNotification(error.message || "Cập nhật thất bại", "error");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        linh_vuc_chuyen_mon: profile.linh_vuc_chuyen_mon || [],
        mon_phu_trach: profile.mon_phu_trach || [],
        kinh_nghiem_giang_day: profile.kinh_nghiem_giang_day || "",
        phuong_thuc_lien_he: profile.phuong_thuc_lien_he || "",
        mo_ta: profile.mo_ta || "",
        tags: profile.tags || []
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const addLinhVuc = () => {
    if (tempLinhVuc.trim() && !formData.linh_vuc_chuyen_mon.includes(tempLinhVuc.trim())) {
      setFormData({
        ...formData,
        linh_vuc_chuyen_mon: [...formData.linh_vuc_chuyen_mon, tempLinhVuc.trim()]
      });
      setTempLinhVuc("");
    }
  };

  const removeLinhVuc = (item) => {
    setFormData({
      ...formData,
      linh_vuc_chuyen_mon: formData.linh_vuc_chuyen_mon.filter(lv => lv !== item)
    });
  };

  const addMonPhuTrach = () => {
    if (tempMonPhuTrach.trim() && !formData.mon_phu_trach.includes(tempMonPhuTrach.trim())) {
      setFormData({
        ...formData,
        mon_phu_trach: [...formData.mon_phu_trach, tempMonPhuTrach.trim()]
      });
      setTempMonPhuTrach("");
    }
  };

  const removeMonPhuTrach = (item) => {
    setFormData({
      ...formData,
      mon_phu_trach: formData.mon_phu_trach.filter(m => m !== item)
    });
  };

  const addTag = () => {
    if (tempTag.trim() && !formData.tags.includes(tempTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tempTag.trim()]
      });
      setTempTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const getApprovalStatusBadge = () => {
    if (!profile) return null;
    
    const status = profile.approval_status;
    const tutorType = profile.tutor_type;
    
    // Giảng viên và Nghiên cứu sinh: tự động có hiệu lực
    if (tutorType in ["Giảng viên", "Nghiên cứu sinh"]) {
      return (
        <span style={{
          padding: "6px 12px",
          background: "#d1fae5",
          color: "#065f46",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          <FaCheckCircle style={{ marginRight: 4 }} />
          Tự động có hiệu lực
        </span>
      );
    }
    
    // Sinh viên: hiển thị trạng thái phê duyệt
    if (status === "approved") {
      return (
        <span style={{
          padding: "6px 12px",
          background: "#d1fae5",
          color: "#065f46",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          <FaCheckCircle style={{ marginRight: 4 }} />
          Đã được phê duyệt
        </span>
      );
    } else if (status === "pending") {
      return (
        <span style={{
          padding: "6px 12px",
          background: "#fef3c7",
          color: "#92400e",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          <FaLock style={{ marginRight: 4 }} />
          Chờ phê duyệt
        </span>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="mentee-dashboard">
        <main className="main-content">
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải thông tin...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mentee-dashboard">
        <main className="main-content">
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Không tìm thấy hồ sơ Tutor</p>
            <button onClick={() => navigate(-1)}>Quay lại</button>
          </div>
        </main>
      </div>
    );
  }

  const canEdit = profile.is_editable;

  return (
    <div className="mentee-dashboard">
      <main className="main-content" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {/* Notification */}
        {notification && (
          <div style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "15px 20px",
            background: notification.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideIn 0.3s ease"
          }}>
            {notification.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: "#1e293b" }}>Hồ sơ chuyên môn</h1>
            {getApprovalStatusBadge()}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleSyncFromDatacore}
              disabled={syncing}
              style={{
                padding: "10px 20px",
                background: syncing ? "#94a3b8" : "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: syncing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <FaSync style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
              Đồng bộ DATACORE
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <FaHistory /> Lịch sử
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={!canEdit}
                style={{
                  padding: "10px 20px",
                  background: canEdit ? "#10b981" : "#94a3b8",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: canEdit ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                {canEdit ? <FaEdit /> : <FaLock />}
                {canEdit ? "Chỉnh sửa" : "Chưa được phép chỉnh sửa"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "10px 20px",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "10px 20px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <FaSave /> Lưu
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thông báo nếu chưa được phê duyệt */}
        {!canEdit && profile.tutor_type === "Sinh viên năm trên" && (
          <div style={{
            padding: "16px 20px",
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: 8,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            <FaExclamationCircle style={{ color: "#f59e0b", fontSize: 20 }} />
            <div>
              <strong style={{ color: "#92400e" }}>Hồ sơ đang chờ phê duyệt</strong>
              <p style={{ margin: "4px 0 0 0", color: "#78350f", fontSize: 14 }}>
                Hồ sơ của bạn đang chờ ban quản trị phê duyệt. Sau khi được phê duyệt, bạn mới có thể chỉnh sửa thông tin chuyên môn.
              </p>
            </div>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: showHistory ? "1fr 400px" : "1fr",
          gap: 20
        }}>
          {/* Main Content */}
          <div>
            {/* Thông tin từ DATACORE - Chỉ đọc */}
            <div style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, color: "#1e293b", fontSize: 20 }}>
                  Thông tin từ HCMUT_DATACORE
                </h2>
                <span style={{
                  padding: "4px 8px",
                  background: "#e0e7ff",
                  color: "#6366f1",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  Chỉ đọc
                </span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16
              }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    {profile.tutor_type === "Sinh viên năm trên" ? "MSSV" : "Mã cán bộ"}
                  </label>
                  <input
                    type="text"
                    value={profile.ma_can_bo_mssv}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Khoa
                  </label>
                  <input
                    type="text"
                    value={profile.khoa}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
                {profile.bo_mon && (
                  <div>
                    <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                      Bộ môn
                    </label>
                    <input
                      type="text"
                      value={profile.bo_mon}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        background: "#f8fafc",
                        color: "#64748b"
                      }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Trạng thái
                  </label>
                  <input
                    type="text"
                    value={profile.trang_thai}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Loại Tutor
                  </label>
                  <input
                    type="text"
                    value={profile.tutor_type}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung - Có thể chỉnh sửa */}
            <div style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0"
            }}>
              <h2 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 20 }}>
                Thông tin bổ sung
              </h2>

              {/* Lĩnh vực chuyên môn */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Lĩnh vực chuyên môn
                </label>
                {isEditing ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={tempLinhVuc}
                        onChange={(e) => setTempLinhVuc(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLinhVuc())}
                        placeholder="Nhập lĩnh vực và nhấn Enter"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: errors.linh_vuc_chuyen_mon ? "1px solid #ef4444" : "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                      <button
                        onClick={addLinhVuc}
                        style={{
                          padding: "10px 20px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer"
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                    {errors.linh_vuc_chuyen_mon && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.linh_vuc_chuyen_mon}</span>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {formData.linh_vuc_chuyen_mon.map((lv, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "6px 12px",
                            background: "#e0e7ff",
                            color: "#6366f1",
                            borderRadius: 20,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                        >
                          {lv}
                          <button
                            onClick={() => removeLinhVuc(lv)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#6366f1",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 16
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    minHeight: 40
                  }}>
                    {profile.linh_vuc_chuyen_mon && profile.linh_vuc_chuyen_mon.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {profile.linh_vuc_chuyen_mon.map((lv, idx) => (
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
                            {lv}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>Chưa có thông tin</span>
                    )}
                  </div>
                )}
              </div>

              {/* Môn phụ trách */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Môn phụ trách
                </label>
                {isEditing ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={tempMonPhuTrach}
                        onChange={(e) => setTempMonPhuTrach(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMonPhuTrach())}
                        placeholder="Nhập môn phụ trách và nhấn Enter"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: errors.mon_phu_trach ? "1px solid #ef4444" : "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                      <button
                        onClick={addMonPhuTrach}
                        style={{
                          padding: "10px 20px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer"
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                    {errors.mon_phu_trach && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.mon_phu_trach}</span>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {formData.mon_phu_trach.map((m, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "6px 12px",
                            background: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: 20,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                        >
                          {m}
                          <button
                            onClick={() => removeMonPhuTrach(m)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#1e40af",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 16
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    minHeight: 40
                  }}>
                    {profile.mon_phu_trach && profile.mon_phu_trach.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {profile.mon_phu_trach.map((m, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "6px 12px",
                              background: "#dbeafe",
                              color: "#1e40af",
                              borderRadius: 20,
                              fontSize: 13
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>Chưa có thông tin</span>
                    )}
                  </div>
                )}
              </div>

              {/* Kinh nghiệm giảng dạy */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Kinh nghiệm giảng dạy
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      value={formData.kinh_nghiem_giang_day}
                      onChange={(e) => setFormData({ ...formData, kinh_nghiem_giang_day: e.target.value })}
                      rows={4}
                      maxLength={2000}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.kinh_nghiem_giang_day ? "1px solid #ef4444" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: "inherit"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {errors.kinh_nghiem_giang_day && (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.kinh_nghiem_giang_day}</span>
                      )}
                      <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>
                        {formData.kinh_nghiem_giang_day.length}/2000
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: profile.kinh_nghiem_giang_day ? "#1e293b" : "#64748b",
                    minHeight: 60,
                    whiteSpace: "pre-wrap"
                  }}>
                    {profile.kinh_nghiem_giang_day || "Chưa có thông tin"}
                  </div>
                )}
              </div>

              {/* Phương thức liên hệ */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Phương thức liên hệ
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      value={formData.phuong_thuc_lien_he}
                      onChange={(e) => setFormData({ ...formData, phuong_thuc_lien_he: e.target.value })}
                      rows={3}
                      maxLength={500}
                      placeholder="VD: Email: example@hcmut.edu.vn, Phone: 0901234567"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.phuong_thuc_lien_he ? "1px solid #ef4444" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: "inherit"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {errors.phuong_thuc_lien_he && (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.phuong_thuc_lien_he}</span>
                      )}
                      <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>
                        {formData.phuong_thuc_lien_he.length}/500
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: profile.phuong_thuc_lien_he ? "#1e293b" : "#64748b",
                    minHeight: 50
                  }}>
                    {profile.phuong_thuc_lien_he || "Chưa có thông tin"}
                  </div>
                )}
              </div>

              {/* Mô tả */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Mô tả giới thiệu
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      value={formData.mo_ta}
                      onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                      rows={5}
                      maxLength={2000}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.mo_ta ? "1px solid #ef4444" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: "inherit"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {errors.mo_ta && (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.mo_ta}</span>
                      )}
                      <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>
                        {formData.mo_ta.length}/2000
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: profile.mo_ta ? "#1e293b" : "#64748b",
                    minHeight: 80,
                    whiteSpace: "pre-wrap"
                  }}>
                    {profile.mo_ta || "Chưa có thông tin"}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Tags
                </label>
                {isEditing ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={tempTag}
                        onChange={(e) => setTempTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="Nhập tag và nhấn Enter"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: errors.tags ? "1px solid #ef4444" : "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                      <button
                        onClick={addTag}
                        style={{
                          padding: "10px 20px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer"
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                    {errors.tags && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.tags}</span>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "6px 12px",
                            background: "#fef3c7",
                            color: "#f59e0b",
                            borderRadius: 20,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#f59e0b",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 16
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    minHeight: 40
                  }}>
                    {profile.tags && profile.tags.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {profile.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "6px 12px",
                              background: "#fef3c7",
                              color: "#f59e0b",
                              borderRadius: 20,
                              fontSize: 13
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#64748b" }}>Chưa có tags</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              height: "fit-content",
              position: "sticky",
              top: 20
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                Lịch sử thay đổi
              </h3>
              {history.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                  Chưa có lịch sử thay đổi
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8, fontSize: 14 }}>
                        {item.field_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <strong>Cũ:</strong> {item.old_value || "Trống"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                        <strong>Mới:</strong> {item.new_value || "Trống"}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {formatDate(item.changed_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TutorProfileModal;
