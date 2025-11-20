import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaGlobe, FaBell, FaUser, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/HCMUT_logo.png";
import "../assets/css/style.css";

import { logout as logoutApi } from "../api/auth";

function Header({ role }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const userId = "12345"; // Lấy từ context/store thực tế

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
    if (role === "tutor") {
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
      navigate("/login");
    } catch (err) {
      alert("Logout thất bại");
    }
    setShowMenu(false);
  };

  return (
    <header className="header">
      <div className="left">
        <img src={logo} alt="HCMUT Logo" className="logo" />
      </div>
      <div className="right">
        <span className="lang">
          <FaGlobe style={{fontSize: "20px", color: "#fff", marginRight: "6px"}} />
          <span>en</span>
        </span>
        <span className="icon-bell">
          <FaBell style={{fontSize: "22px", color: "#fff"}} />
        </span>
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
              <div className="dropdown-item active" onClick={handleProfileClick}>Hồ sơ cá nhân</div>
              <div className="dropdown-item">Lịch</div>
              <div className="dropdown-item">Báo cáo</div>
              <div className="dropdown-item">Tùy chọn</div>
              <div className="dropdown-item logout" onClick={handleLogout}>Đăng xuất</div>
            </div>
          )}
        </span>
      </div>
    </header>
  );
}
export default Header;