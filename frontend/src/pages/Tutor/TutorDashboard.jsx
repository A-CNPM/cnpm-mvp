import "../../assets/css/style.css";
import { useNavigate } from "react-router-dom";
import DashboardBg from "../../assets/images/bg.png";
import ChibiCharacter from "../../assets/images/nv.png";
import { FaChalkboardTeacher, FaCalendarAlt, FaUsers, FaChartLine } from "react-icons/fa";

function TutorDashboard() {
  const navigate = useNavigate();
  const tutorType = localStorage.getItem("tutor_type") || "Tutor";
  const fullName = localStorage.getItem("full_name") || "";

  return (
    <div className="dashboard-container">
      <div className="dashboard-bg" style={{ backgroundImage: `url(${DashboardBg})` }}>
        <div className="dashboard-content">
          {/* Nội dung chính bên trái */}
          <div className="dashboard-left">
            <h1 className="dashboard-title">HCMUT Tutor Support System</h1>
            <div className="dashboard-description-box">
              <p className="dashboard-description">
                Chào mừng <strong>{fullName}</strong> ({tutorType}) đến với hệ thống Tutor Support System.
                Hệ thống giúp bạn quản lý các buổi tư vấn, lịch dạy và hỗ trợ sinh viên một cách hiệu quả.
              </p>
              
              {/* Quick actions */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "15px",
                marginTop: "20px"
              }}>
                <button 
                  className="dashboard-view-more-btn"
                  onClick={() => navigate("/tutor/meeting")}
                  style={{
                    padding: "15px",
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <FaCalendarAlt /> Buổi tư vấn
                </button>
                <button 
                  className="dashboard-view-more-btn"
                  onClick={() => navigate("/tutor/schedule")}
                  style={{
                    padding: "15px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <FaUsers /> Quản lý lịch
                </button>
              </div>
            </div>
          </div>

          {/* Nhân vật chibi bên phải */}
          <div className="dashboard-chibi">
            <img src={ChibiCharacter} alt="Chibi Character" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;

