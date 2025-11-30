import "../assets/css/style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BKLogo from "../assets/images/logobk.png";
import LoginBg from "../assets/images/bg.png";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";

function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Chỉ chọn role, không tự động điều hướng
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${LoginBg})` }}>
      {/* Logo ở góc trên trái */}
      <div className="login-logo">
        <img src={BKLogo} alt="BK Logo" />
      </div>

      {/* Form chọn vai trò ở giữa */}
      <div className="login-form" style={{ maxWidth: "600px" }}>
        <h1 className="login-title">Chọn vai trò đăng nhập</h1>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "30px", fontSize: "14px" }}>
          Vui lòng chọn vai trò bạn muốn đăng nhập vào hệ thống
        </p>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "20px",
          marginBottom: "20px"
        }}>
          {/* Card Mentee */}
          <div
            onClick={() => handleRoleSelect("Mentee")}
            style={{
              padding: "30px",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s",
              background: selectedRole === "Mentee" ? "#e0e7ff" : "#fff",
              borderColor: selectedRole === "Mentee" ? "#4f46e5" : "#e2e8f0",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== "Mentee") {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.background = "#f8fafc";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== "Mentee") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            <FaUserGraduate 
              style={{ 
                fontSize: "48px", 
                color: "#4f46e5", 
                marginBottom: "15px" 
              }} 
            />
            <h3 style={{ margin: "10px 0", color: "#1e293b" }}>Mentee</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Sinh viên tìm kiếm hỗ trợ học tập
            </p>
          </div>

          {/* Card Tutor */}
          <div
            onClick={() => handleRoleSelect("Tutor")}
            style={{
              padding: "30px",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s",
              background: selectedRole === "Tutor" ? "#e0e7ff" : "#fff",
              borderColor: selectedRole === "Tutor" ? "#4f46e5" : "#e2e8f0",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== "Tutor") {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.background = "#f8fafc";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== "Tutor") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            <FaChalkboardTeacher 
              style={{ 
                fontSize: "48px", 
                color: "#4f46e5", 
                marginBottom: "15px" 
              }} 
            />
            <h3 style={{ margin: "10px 0", color: "#1e293b" }}>Tutor</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Giảng viên, Nghiên cứu sinh hoặc Sinh viên năm trên
            </p>
          </div>

          {/* Card Admin */}
          <div
            onClick={() => handleRoleSelect("Admin")}
            style={{
              padding: "30px",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s",
              background: selectedRole === "Admin" ? "#e0e7ff" : "#fff",
              borderColor: selectedRole === "Admin" ? "#4f46e5" : "#e2e8f0",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== "Admin") {
                e.currentTarget.style.borderColor = "#4f46e5";
                e.currentTarget.style.background = "#f8fafc";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== "Admin") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            <FaUserShield 
              style={{ 
                fontSize: "48px", 
                color: "#4f46e5", 
                marginBottom: "15px" 
              }} 
            />
            <h3 style={{ margin: "10px 0", color: "#1e293b" }}>Admin</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Ban quản trị khoa/bộ môn
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="login-btn" 
          onClick={() => {
            if (selectedRole) {
              navigate(`/login?role=${selectedRole}`);
            } else {
              alert("Vui lòng chọn vai trò trước khi tiếp tục");
            }
          }}
          style={{
            opacity: selectedRole ? 1 : 0.5,
            cursor: selectedRole ? "pointer" : "not-allowed"
          }}
        >
          Tiếp tục
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#94a3b8" }}>
          Bạn có thể có nhiều vai trò trong hệ thống. Vui lòng chọn vai trò bạn muốn sử dụng.
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;

