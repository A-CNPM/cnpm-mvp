import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import TutorRegistrationService from "../../api/tutorRegistration";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaEdit } from "react-icons/fa";

function RegisterTutor() {
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "info"
  const [existingRegistration, setExistingRegistration] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    gpa: "",
    nam_hoc: "",
    tinh_trang_hoc_tap: "",
    ho_so_nang_luc: "",
    chung_chi: "",
    mon_muon_day: "",
    kinh_nghiem: "",
    ly_do_dang_ky: ""
  });

  // Load existing registration
  useEffect(() => {
    const loadRegistration = async () => {
      try {
        const reg = await TutorRegistrationService.getUserRegistration(userId);
        if (reg) {
          setExistingRegistration(reg);
          // Nếu status là "Yêu cầu bổ sung", cho phép chỉnh sửa
          if (reg.status === "Yêu cầu bổ sung") {
            setFormData({
              gpa: reg.gpa?.toString() || "",
              nam_hoc: reg.nam_hoc || "",
              tinh_trang_hoc_tap: reg.tinh_trang_hoc_tap || "",
              ho_so_nang_luc: reg.ho_so_nang_luc || "",
              chung_chi: reg.chung_chi?.join(", ") || "",
              mon_muon_day: reg.mon_muon_day?.join(", ") || "",
              kinh_nghiem: reg.kinh_nghiem || "",
              ly_do_dang_ky: reg.ly_do_dang_ky || ""
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      }
    };
    loadRegistration();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Parse chứng chỉ và môn muốn dạy từ string sang array
      const chung_chi_list = formData.chung_chi
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      const mon_muon_day_list = formData.mon_muon_day
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const registrationData = {
        user_id: userId,
        gpa: parseFloat(formData.gpa),
        nam_hoc: formData.nam_hoc,
        tinh_trang_hoc_tap: formData.tinh_trang_hoc_tap,
        ho_so_nang_luc: formData.ho_so_nang_luc,
        chung_chi: chung_chi_list,
        mon_muon_day: mon_muon_day_list,
        kinh_nghiem: formData.kinh_nghiem || null,
        ly_do_dang_ky: formData.ly_do_dang_ky || null
      };

      let result;
      if (existingRegistration && existingRegistration.status === "Yêu cầu bổ sung") {
        // Cập nhật hồ sơ
        result = await TutorRegistrationService.updateRegistration(
          existingRegistration.registration_id,
          registrationData
        );
      } else {
        // Nộp hồ sơ mới
        result = await TutorRegistrationService.submitRegistration(registrationData);
      }

      if (result.success) {
        setMessage(result.message);
        setMessageType("success");
        // Reload registration
        const reg = await TutorRegistrationService.getUserRegistration(userId);
        if (reg) {
          setExistingRegistration(reg);
        }
      }
    } catch (error) {
      setMessage(error.message || "Có lỗi xảy ra khi nộp hồ sơ");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Chờ duyệt": { color: "#f59e0b", bg: "#fef3c7", icon: <FaInfoCircle /> },
      "Đã phê duyệt": { color: "#10b981", bg: "#d1fae5", icon: <FaCheckCircle /> },
      "Từ chối": { color: "#ef4444", bg: "#fee2e2", icon: <FaTimesCircle /> },
      "Yêu cầu bổ sung": { color: "#3b82f6", bg: "#dbeafe", icon: <FaEdit /> }
    };
    
    const config = statusConfig[status] || statusConfig["Chờ duyệt"];
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        color: config.color,
        background: config.bg
      }}>
        {config.icon} {status}
      </span>
    );
  };

  return (
    <div className="mentee-dashboard">
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">{userId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Đăng ký trở thành Tutor</h2>

        {/* Hiển thị trạng thái hồ sơ hiện tại */}
        {existingRegistration && (
          <div style={{
            marginBottom: 20,
            padding: 15,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14, color: "#64748b", marginRight: 10 }}>Trạng thái hồ sơ:</strong>
                {getStatusBadge(existingRegistration.status)}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Nộp lúc: {new Date(existingRegistration.submitted_at).toLocaleString("vi-VN")}
              </div>
            </div>
            {existingRegistration.status === "Từ chối" && existingRegistration.updated_at && (
              <div style={{ marginTop: 10, padding: 10, background: "#fee2e2", borderRadius: 6, fontSize: 13 }}>
                <strong>Lý do từ chối:</strong> Vui lòng kiểm tra lịch sử để xem chi tiết.
              </div>
            )}
            {existingRegistration.status === "Yêu cầu bổ sung" && (
              <div style={{ marginTop: 10, padding: 10, background: "#dbeafe", borderRadius: 6, fontSize: 13 }}>
                <strong>Yêu cầu bổ sung:</strong> Vui lòng cập nhật thông tin theo yêu cầu và nộp lại hồ sơ.
              </div>
            )}
          </div>
        )}

        {/* Thông báo */}
        {message && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            background: messageType === "success" ? "#d1fae5" : messageType === "error" ? "#fee2e2" : "#dbeafe",
            color: messageType === "success" ? "#065f46" : messageType === "error" ? "#991b1b" : "#1e40af",
            fontSize: 14
          }}>
            {message}
          </div>
        )}

        {/* Form đăng ký */}
        {(!existingRegistration || existingRegistration.status === "Yêu cầu bổ sung") && (
          <form onSubmit={handleSubmit} style={{
            background: "#fff",
            padding: 25,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  GPA <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  min="0"
                  max="4"
                  step="0.01"
                  required
                  placeholder="VD: 3.5"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Năm học <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="nam_hoc"
                  value={formData.nam_hoc}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14
                  }}
                >
                  <option value="">-- Chọn năm học --</option>
                  <option value="Năm 1">Năm 1</option>
                  <option value="Năm 2">Năm 2</option>
                  <option value="Năm 3">Năm 3</option>
                  <option value="Năm 4">Năm 4</option>
                  <option value="Năm 5">Năm 5</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Tình trạng học tập <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="tinh_trang_hoc_tap"
                value={formData.tinh_trang_hoc_tap}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14
                }}
              >
                <option value="">-- Chọn tình trạng --</option>
                <option value="Đang học">Đang học</option>
                <option value="Tốt nghiệp">Tốt nghiệp</option>
                <option value="Tạm dừng">Tạm dừng</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Hồ sơ năng lực <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                name="ho_so_nang_luc"
                value={formData.ho_so_nang_luc}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Mô tả về năng lực, kỹ năng, kinh nghiệm của bạn..."
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Chứng chỉ (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                name="chung_chi"
                value={formData.chung_chi}
                onChange={handleInputChange}
                placeholder="VD: TOEIC 800, JLPT N3, IELTS 7.0"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Môn muốn dạy (phân cách bằng dấu phẩy) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="mon_muon_day"
                value={formData.mon_muon_day}
                onChange={handleInputChange}
                required
                placeholder="VD: DSA, Web Development, Python, Machine Learning"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Kinh nghiệm giảng dạy
              </label>
              <textarea
                name="kinh_nghiem"
                value={formData.kinh_nghiem}
                onChange={handleInputChange}
                rows={3}
                placeholder="Mô tả kinh nghiệm giảng dạy, hướng dẫn của bạn (nếu có)..."
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Lý do đăng ký
              </label>
              <textarea
                name="ly_do_dang_ky"
                value={formData.ly_do_dang_ky}
                onChange={handleInputChange}
                rows={3}
                placeholder="Lý do bạn muốn trở thành Tutor..."
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

            <div style={{ textAlign: "right" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: loading ? "#9ca3af" : "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Đang xử lý..." : existingRegistration ? "Cập nhật và nộp lại" : "Nộp hồ sơ"}
              </button>
            </div>
          </form>
        )}

        {/* Hiển thị thông báo nếu đã được phê duyệt hoặc từ chối */}
        {existingRegistration && existingRegistration.status === "Đã phê duyệt" && (
          <div style={{
            padding: 20,
            background: "#d1fae5",
            borderRadius: 8,
            border: "1px solid #10b981",
            textAlign: "center"
          }}>
            <FaCheckCircle style={{ fontSize: 48, color: "#10b981", marginBottom: 10 }} />
            <h3 style={{ color: "#065f46", marginBottom: 10 }}>Chúc mừng!</h3>
            <p style={{ color: "#047857" }}>
              Hồ sơ của bạn đã được phê duyệt. Bạn đã được cấp quyền Tutor.
              Từ lần đăng nhập tiếp theo, bạn có thể chọn vai trò Mentee hoặc Tutor.
            </p>
          </div>
        )}

        {existingRegistration && existingRegistration.status === "Từ chối" && (
          <div style={{
            padding: 20,
            background: "#fee2e2",
            borderRadius: 8,
            border: "1px solid #ef4444",
            textAlign: "center"
          }}>
            <FaTimesCircle style={{ fontSize: 48, color: "#ef4444", marginBottom: 10 }} />
            <h3 style={{ color: "#991b1b", marginBottom: 10 }}>Hồ sơ đã bị từ chối</h3>
            <p style={{ color: "#b91c1c" }}>
              Rất tiếc, hồ sơ của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default RegisterTutor;

