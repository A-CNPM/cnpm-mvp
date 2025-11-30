import "../assets/css/style.css";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BKLogo from "../assets/images/logobk.png";
import LoginBg from "../assets/images/bg.png";
import { login as loginApi } from "../api/auth";
import AdminService from "../api/admin";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role") || "Mentee";
  const [role, setRole] = useState(roleFromUrl);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Cập nhật role từ URL
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    
    // Validate email format cho Tutor và Admin
    if (role === "Tutor" || role === "Admin") {
      if (!username.includes("@hcmut.edu.vn") && !username.includes("@hcmut.vn")) {
        setMessage(`${role} phải đăng nhập bằng email trường (@hcmut.edu.vn hoặc @hcmut.vn)`);
        setMessageType("error");
        return;
      }
    }

    try {
      let data;
      if (role === "Admin") {
        // Đăng nhập Admin
        data = await AdminService.login(username, password);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("full_name", data.full_name || "");
        localStorage.setItem("admin_type", data.admin_type || "");
        localStorage.setItem("khoa", data.khoa || "");
        localStorage.setItem("bo_mon", data.bo_mon || "");
      } else {
        // Đăng nhập Mentee hoặc Tutor
        data = await loginApi(username, password, role);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("full_name", data.full_name || "");
        
        // Lưu tutor_type nếu có
        if (data.tutor_type) {
          localStorage.setItem("tutor_type", data.tutor_type);
        }
      }
      
      setMessage("Đăng nhập thành công!");
      setMessageType("success");
      
      // Chuyển hướng dựa trên role
      setTimeout(() => {
        if (data.role === "Tutor") {
          navigate("/tutor/dashboard");
        } else if (data.role === "Admin") {
          navigate("/admin/dashboard");
        } else {
          // Mentee redirect đến trang Overview
          navigate("/mentee/overview");
        }
      }, 500);
    } catch (err) {
      const errorMessage = err.message || "Đăng nhập thất bại";
      if (errorMessage.includes("Tutor") || errorMessage.includes("từ chối")) {
        setMessage("Bạn chưa được xác thực là Tutor. Vui lòng liên hệ quản trị viên để được cấp quyền.");
      } else if (errorMessage.includes("SSO") || errorMessage.includes("xác thực")) {
        setMessage("Xác thực HCMUT_SSO thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
      } else {
        setMessage("Sai tài khoản hoặc mật khẩu");
      }
      setMessageType("error");
    }
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${LoginBg})` }}>
      {/* Logo ở góc trên trái */}
      <div className="login-logo">
        <img src={BKLogo} alt="BK Logo" />
      </div>

      {/* Form đăng nhập ở giữa */}
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Đăng nhập {role}</h1>
        
        {/* Hiển thị role hiện tại */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          background: role === "Tutor" ? "#e0e7ff" : role === "Admin" ? "#fef3c7" : "#f1f5f9",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "13px",
          color: "#475569"
        }}>
          <strong>Vai trò:</strong> {
            role === "Tutor" ? "Tutor (Giảng viên/Nghiên cứu sinh/Sinh viên năm trên)" :
            role === "Admin" ? "Admin (Ban quản trị khoa/bộ môn)" :
            "Mentee (Sinh viên)"
          }
        </div>

        <div className="login-field-group">
          <label className="login-label" htmlFor="username">
            {role === "Tutor" || role === "Admin" ? "Email trường (HCMUT_SSO)" : "Tên đăng nhập"}
          </label>
          <div style={{ position: "relative" }}>
            {role === "Admin" ? (
              <FaUserShield style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#94a3b8",
                fontSize: "14px",
                zIndex: 1
              }} />
            ) : (
              <FaEnvelope style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#94a3b8",
                fontSize: "14px",
                zIndex: 1
              }} />
            )}
            <input
              className="login-input"
              type={role === "Tutor" || role === "Admin" ? "email" : "text"}
              id="username"
              name="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={role === "Tutor" || role === "Admin" ? "username@hcmut.edu.vn" : "Nhập tên đăng nhập"}
              style={{ paddingLeft: "40px" }}
              required
            />
          </div>
          {(role === "Tutor" || role === "Admin") && (
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "5px", marginBottom: 0 }}>
              Sử dụng tài khoản email trường để đăng nhập với vai trò {role}.
            </p>
          )}
        </div>

        <div className="login-field-group">
          <label className="login-label" htmlFor="password">Mật khẩu</label>
          <div style={{ position: "relative" }}>
            <FaLock style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#94a3b8",
              fontSize: "14px"
            }} />
            <input
              className="login-input"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              style={{ paddingLeft: "40px" }}
              required
            />
          </div>
        </div>

        <button type="submit" className="login-btn">
          Đăng nhập {role === "Tutor" ? "với HCMUT_SSO" : ""}
        </button>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
          <a 
            href="#" 
            className="login-forgot-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              alert("Tính năng quên mật khẩu đang được phát triển"); 
            }}
          >
            Quên mật khẩu
          </a>
          <a 
            href="#" 
            className="login-forgot-link" 
            onClick={(e) => { 
              e.preventDefault(); 
              navigate("/role-selection"); 
            }}
            style={{ fontSize: "12px" }}
          >
            Chọn lại vai trò
          </a>
        </div>
        
        {message && (
          <div className={`login-message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
export default Login;