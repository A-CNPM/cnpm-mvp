import { FaHome, FaCalendarAlt, FaEdit, FaCalendar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";

function TutorSidebar({ activeItem, blur }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar${blur ? " blur-bg" : ""}`}>
      <div className="sidebar-menu">
        <div
          className={`sidebar-item${activeItem === "overview" ? " active" : ""}`}
          onClick={() => navigate("/tutor/overview")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaHome style={{color: "#6366f1", fontSize: 20}} /></span>
          Tổng quan
        </div>
        <div
          className={`sidebar-item${activeItem === "meeting" ? " active" : ""}`}
          onClick={() => navigate("/tutor/meeting")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaCalendarAlt style={{color: "#6366f1", fontSize: 20}} /></span>
          Buổi tư vấn
        </div>
        <div
          className={`sidebar-item${activeItem === "feedback" ? " active" : ""}`}
          onClick={() => navigate("/tutor/feedback")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaEdit style={{color: "#6366f1", fontSize: 20}} /></span>
          Phản hồi
        </div>
        <div
          className={`sidebar-item${activeItem === "schedule" ? " active" : ""}`}
          onClick={() => navigate("/tutor/schedule")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon"><FaCalendar style={{color: "#6366f1", fontSize: 20}} /></span>
          Quản lý lịch
        </div>
      </div>
    </aside>
  );
}
export default TutorSidebar;