import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import ProfileService from "../../api/profile";
import ProgressTrackingService from "../../api/progressTracking";
import { FaUser, FaEdit, FaSave, FaTimes, FaHistory, FaCheckCircle, FaExclamationCircle, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";

function MenteeProfileModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = id?.split("=")[1] || localStorage.getItem("username") || "a.nguyen";
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);
  const [progressTrackings, setProgressTrackings] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nhu_cau_ho_tro: "",
    linh_vuc_quan_tam: [],
    phuong_thuc_lien_he: "",
    mo_ta: "",
    tags: []
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Temp input for linh_vuc_quan_tam
  const [tempLinhVuc, setTempLinhVuc] = useState("");
  const [tempTag, setTempTag] = useState("");

  useEffect(() => {
    loadProfile();
    loadHistory();
    loadProgressTrackings();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await ProfileService.getProfile(userId);
      setProfile(data);
      setFormData({
        nhu_cau_ho_tro: data.nhu_cau_ho_tro || "",
        linh_vuc_quan_tam: data.linh_vuc_quan_tam || [],
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
      const data = await ProfileService.getProfileHistory(userId);
      setHistory(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const loadProgressTrackings = async () => {
    setLoadingProgress(true);
    try {
      const data = await ProgressTrackingService.getMenteeProgressTrackings(userId);
      setProgressTrackings(data);
    } catch (error) {
      console.error("Lỗi khi tải ghi nhận tiến bộ:", error);
    } finally {
      setLoadingProgress(false);
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (formData.nhu_cau_ho_tro && formData.nhu_cau_ho_tro.length > 1000) {
      newErrors.nhu_cau_ho_tro = "Nhu cầu hỗ trợ không được vượt quá 1000 ký tự";
    }
    
    if (formData.phuong_thuc_lien_he && formData.phuong_thuc_lien_he.length > 500) {
      newErrors.phuong_thuc_lien_he = "Phương thức liên hệ không được vượt quá 500 ký tự";
    }
    
    if (formData.mo_ta && formData.mo_ta.length > 2000) {
      newErrors.mo_ta = "Mô tả không được vượt quá 2000 ký tự";
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
        nhu_cau_ho_tro: formData.nhu_cau_ho_tro || null,
        linh_vuc_quan_tam: formData.linh_vuc_quan_tam.length > 0 ? formData.linh_vuc_quan_tam : null,
        phuong_thuc_lien_he: formData.phuong_thuc_lien_he || null,
        mo_ta: formData.mo_ta || null,
        tags: formData.tags.length > 0 ? formData.tags : null
      };

      const updatedProfile = await ProfileService.updateProfile(userId, updateData);
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
        nhu_cau_ho_tro: profile.nhu_cau_ho_tro || "",
        linh_vuc_quan_tam: profile.linh_vuc_quan_tam || [],
        phuong_thuc_lien_he: profile.phuong_thuc_lien_he || "",
        mo_ta: profile.mo_ta || "",
        tags: profile.tags || []
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const addLinhVuc = () => {
    if (tempLinhVuc.trim() && !formData.linh_vuc_quan_tam.includes(tempLinhVuc.trim())) {
      setFormData({
        ...formData,
        linh_vuc_quan_tam: [...formData.linh_vuc_quan_tam, tempLinhVuc.trim()]
      });
      setTempLinhVuc("");
    }
  };

  const removeLinhVuc = (item) => {
    setFormData({
      ...formData,
      linh_vuc_quan_tam: formData.linh_vuc_quan_tam.filter(lv => lv !== item)
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
            <p>Không tìm thấy thông tin profile</p>
            <button onClick={() => navigate("/dashboard")}>Quay lại</button>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 style={{ margin: 0, fontSize: 28, color: "#1e293b" }}>Hồ sơ cá nhân</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowProgress(!showProgress)}
              style={{
                padding: "10px 20px",
                background: showProgress ? "#10b981" : "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <FaChartLine /> Ghi nhận tiến bộ
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
                <FaEdit /> Chỉnh sửa
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

        <div style={{
          display: "grid",
          gridTemplateColumns: (showHistory || showProgress) ? "1fr 400px" : "1fr",
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
              <h2 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 20 }}>
                Thông tin cơ bản 
              </h2>
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
                    MSSV
                  </label>
                  <input
                    type="text"
                    value={profile.mssv}
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
                    Khoa/Ngành
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
                <div>
                  <label style={{ display: "block", marginBottom: 8, color: "#64748b", fontSize: 14 }}>
                    Ngành
                  </label>
                  <input
                    type="text"
                    value={profile.nganh}
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
                    Trạng thái học tập
                  </label>
                  <input
                    type="text"
                    value={profile.trinh_do}
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

              {/* Nhu cầu hỗ trợ */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Nhu cầu hỗ trợ
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      value={formData.nhu_cau_ho_tro}
                      onChange={(e) => setFormData({ ...formData, nhu_cau_ho_tro: e.target.value })}
                      rows={4}
                      maxLength={1000}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.nhu_cau_ho_tro ? "1px solid #ef4444" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: "inherit"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {errors.nhu_cau_ho_tro && (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.nhu_cau_ho_tro}</span>
                      )}
                      <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>
                        {formData.nhu_cau_ho_tro.length}/1000
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: profile.nhu_cau_ho_tro ? "#1e293b" : "#64748b",
                    minHeight: 60
                  }}>
                    {profile.nhu_cau_ho_tro || "Chưa có thông tin"}
                  </div>
                )}
              </div>

              {/* Lĩnh vực quan tâm */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}>
                  Lĩnh vực quan tâm
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
                          border: "1px solid #e2e8f0",
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {formData.linh_vuc_quan_tam.map((lv, idx) => (
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
                    {profile.linh_vuc_quan_tam && profile.linh_vuc_quan_tam.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {profile.linh_vuc_quan_tam.map((lv, idx) => (
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
                      placeholder="VD: Email: example@hcmut.edu.vn, Zalo: 0123456789"
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
                          border: "1px solid #e2e8f0",
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

          {/* Progress Tracking Sidebar */}
          {showProgress && (
            <div style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              height: "fit-content",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "sticky",
              top: 20
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                Ghi nhận tiến bộ
              </h3>
              {loadingProgress ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                  Đang tải...
                </p>
              ) : progressTrackings.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                  Chưa có ghi nhận tiến bộ nào
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {progressTrackings.map((tracking, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        background: tracking.tracking_type === "Tiến bộ" ? "#d1fae5" : "#fee2e2",
                        borderRadius: 8,
                        border: `1px solid ${tracking.tracking_type === "Tiến bộ" ? "#10b981" : "#ef4444"}`
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        {tracking.tracking_type === "Tiến bộ" ? (
                          <FaArrowUp style={{ color: "#10b981" }} />
                        ) : (
                          <FaArrowDown style={{ color: "#ef4444" }} />
                        )}
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                          {tracking.tracking_type}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: "#374151", marginBottom: 8, lineHeight: 1.5 }}>
                        {tracking.content}
                      </div>
                      {tracking.session_topic && (
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                          <strong>Buổi tư vấn:</strong> {tracking.session_topic}
                        </div>
                      )}
                      {tracking.tutor_name && (
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                          <strong>Tutor:</strong> {tracking.tutor_name}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                        {formatDate(tracking.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

export default MenteeProfileModal;
