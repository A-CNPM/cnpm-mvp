import { FaUser, FaHome, FaCalendarAlt, FaChartBar, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";

function MenteeSidebar({ activeItem }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <div
          className={`sidebar-item${activeItem === "overview" ? " active" : ""}`}
          onClick={() => navigate("/mentee/overview")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaHome style={{color: "#6366f1", fontSize: 20}} /></span>
          Tổng quan
        </div>
        <div
          className={`sidebar-item${activeItem === "meeting" ? " active" : ""}`}
          onClick={() => navigate("/mentee/meeting")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaCalendarAlt style={{color: "#6366f1", fontSize: 20}} /></span>
          Buổi tư vấn
        </div>
        <div
          className={`sidebar-item${activeItem === "find-tutor" ? " active" : ""}`}
          onClick={() => navigate("/mentee/find-tutor")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaUser style={{color: "#6366f1", fontSize: 20}} /></span>
          <span className="sidebar-text">Tìm kiếm Tutor</span>
        </div>
        <div
          className={`sidebar-item${activeItem === "review" ? " active" : ""}`}
          onClick={() => navigate("/mentee/review")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaChartBar style={{color: "#6366f1", fontSize: 20}} /></span>
          Đánh giá
        </div>
        <div
          className={`sidebar-item${activeItem === "register-tutor" ? " active" : ""}`}
          onClick={() => navigate("/mentee/register-tutor")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaEdit style={{color: "#6366f1", fontSize: 20}} /></span>
          Đăng kí làm Tutor
        </div>
      </div>
    </aside>
  );
}
export default MenteeSidebar;