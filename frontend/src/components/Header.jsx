import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaGlobe, FaBell, FaUser, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/HCMUT_logo.png";
import "../assets/css/style.css";

import { logout as logoutApi } from "../api/auth";
import NotificationDropdown from "./NotificationDropdown";

function Header({ role }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = "12345"; // Lấy từ context/store thực tế

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/mentee" || path === "/tutor") {
      return location.pathname.startsWith("/mentee") || location.pathname.startsWith("/tutor");
    }
    return location.pathname.startsWith(path);
  };

  const isDashboardActive = () => {
    const path = location.pathname;
    // Không active nếu đang ở trang chủ (dashboard)
    if (path === "/dashboard" || path === "/tutor/dashboard" || path === "/admin/dashboard") {
      return false;
    }
    // Active nếu đang ở các trang bảng điều khiển khác
    return path.startsWith("/mentee/") || path.startsWith("/tutor/") || path.startsWith("/admin/");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    const currentRole = localStorage.getItem("role");
    if (currentRole === "Admin") {
      // Admin không có profile page riêng, có thể navigate đến dashboard
      navigate("/admin/dashboard");
    } else if (role === "tutor" || currentRole === "Tutor") {
      navigate(`/tutor/id=${userId}`);
    } else {
      navigate(`/mentee/id=${userId}`);
    }
    setShowMenu(false);
  };

  const handleLogout = async () => {
    try {
      const username = localStorage.getItem("username"); // hoặc lấy từ context/store
      await logoutApi(username);
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("full_name");
      localStorage.removeItem("tutor_type");
      localStorage.removeItem("admin_type");
      localStorage.removeItem("khoa");
      localStorage.removeItem("bo_mon");
      navigate("/role-selection");
    } catch (err) {
      alert("Logout thất bại");
    }
    setShowMenu(false);
  };

  return (
    <header className="header">
      <div className="left">
        <img 
          src={logo} 
          alt="HCMUT Logo" 
          className="logo" 
          onClick={() => {
            const currentRole = localStorage.getItem("role");
            if (currentRole === "Admin") {
              navigate("/admin/dashboard");
            } else if (currentRole === "Tutor") {
              navigate("/tutor/dashboard");
            } else {
              navigate("/dashboard");
            }
          }}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className="header-center">
        <span 
          className={`header-nav-link ${isActive("/dashboard") || isActive("/tutor/dashboard") || isActive("/admin/dashboard") ? "active" : ""}`}
          onClick={() => {
            const currentRole = localStorage.getItem("role");
            if (currentRole === "Admin") {
              navigate("/admin/dashboard");
            } else if (currentRole === "Tutor") {
              navigate("/tutor/dashboard");
            } else {
              navigate("/dashboard");
            }
          }}
        >
          Trang chủ
        </span>
        <span 
          className={`header-nav-link ${isActive("/forum") ? "active" : ""}`}
          onClick={() => navigate("/forum")}
        >
          Diễn đàn
        </span>
        <span 
          className={`header-nav-link ${isDashboardActive() ? "active" : ""}`}
          onClick={() => {
            const currentRole = localStorage.getItem("role");
            if (currentRole === "Admin") {
              navigate("/admin/tutor-approval");
            } else if (currentRole === "Tutor") {
              navigate("/tutor/meeting");
            } else {
              navigate("/mentee/meeting");
            }
          }}
        >
          Bảng điều khiển
        </span>
      </div>
      <div className="right">
        <span className="lang">
          <FaGlobe style={{fontSize: "20px", color: "#fff", marginRight: "6px"}} />
          <span>vi</span>
        </span>
        <NotificationDropdown userId={userId} />
        <span className="avatar-group" ref={menuRef} style={{position: "relative"}}>
          <span
            className="avatar"
            onClick={() => setShowMenu((v) => !v)}
            style={{ cursor: "pointer" }}
          >
            <FaUser style={{fontSize: "28px", color: "#273988"}} />
          </span>
          <span className="avatar-arrow" style={{cursor: "pointer"}} onClick={() => setShowMenu((v) => !v)}>
            <FaChevronDown style={{fontSize: "18px", color: "#273988"}} />
          </span>
          {showMenu && (
            <div className="dropdown-menu">
              {(() => {
                const currentRole = localStorage.getItem("role");
                if (currentRole !== "Admin") {
                  return (
                    <div className="dropdown-item active" onClick={handleProfileClick}>Hồ sơ cá nhân</div>
                  );
                }
                return null;
              })()}
              {(() => {
                const currentRole = localStorage.getItem("role");
                if (currentRole === "Admin") {
                  return (
                    <>
                      <div className="dropdown-item" onClick={() => {
                        navigate("/admin/tutor-approval");
                        setShowMenu(false);
                      }}>Xác thực Tutor</div>
                      <div className="dropdown-item" onClick={() => {
                        navigate("/admin/users");
                        setShowMenu(false);
                      }}>Quản lý Users</div>
                    </>
                  );
                } else if (role === "tutor" || currentRole === "Tutor") {
                  return (
                    <>
                      <div className="dropdown-item" onClick={() => {
                        navigate("/tutor/meeting");
                        setShowMenu(false);
                      }}>Buổi tư vấn</div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="dropdown-item" onClick={() => {
                        navigate("/mentee/calendar");
                        setShowMenu(false);
                      }}>Lịch</div>
                      <div className="dropdown-item" onClick={() => {
                        navigate("/mentee/report");
                        setShowMenu(false);
                      }}>Báo cáo</div>
                    </>
                  );
                }
              })()}
              <div className="dropdown-item logout" onClick={handleLogout}>Đăng xuất</div>
            </div>
          )}
        </span>
      </div>
    </header>
  );
}
export default Header;