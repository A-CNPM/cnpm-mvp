import { FaHome, FaCheckCircle, FaUsers, FaChartLine, FaClipboardList, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";

function AdminSidebar({ activeItem, blur }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar${blur ? " blur-bg" : ""}`}>
      <div className="sidebar-menu">
        <div
          className={`sidebar-item${activeItem === "dashboard" ? " active" : ""}`}
          onClick={() => navigate("/admin/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaHome style={{color: "#6366f1", fontSize: 20}} /></span>
          Trang chủ
        </div>
        <div
          className={`sidebar-item${activeItem === "tutor-approval" ? " active" : ""}`}
          onClick={() => navigate("/admin/tutor-approval")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaCheckCircle style={{color: "#6366f1", fontSize: 20}} /></span>
          Xác thực Tutor
        </div>
        <div
          className={`sidebar-item${activeItem === "users" ? " active" : ""}`}
          onClick={() => navigate("/admin/users")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaUsers style={{color: "#6366f1", fontSize: 20}} /></span>
          Quản lý Users
        </div>
        <div
          className={`sidebar-item${activeItem === "activity" ? " active" : ""}`}
          onClick={() => navigate("/admin/activity")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaChartLine style={{color: "#6366f1", fontSize: 20}} /></span>
          Hoạt động
        </div>
        <div
          className={`sidebar-item${activeItem === "reports" ? " active" : ""}`}
          onClick={() => navigate("/admin/reports")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaClipboardList style={{color: "#6366f1", fontSize: 20}} /></span>
          Báo cáo
        </div>
        <div
          className={`sidebar-item${activeItem === "quality" ? " active" : ""}`}
          onClick={() => navigate("/admin/quality")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaStar style={{color: "#6366f1", fontSize: 20}} /></span>
          Chất lượng
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;

