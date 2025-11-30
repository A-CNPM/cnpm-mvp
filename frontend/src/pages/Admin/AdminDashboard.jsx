import "../../assets/css/style.css";
import { useNavigate } from "react-router-dom";
import DashboardBg from "../../assets/images/bg.png";
import ChibiCharacter from "../../assets/images/nv.png";
import { FaUserShield, FaCheckCircle, FaUsers, FaChartLine, FaClipboardList, FaStar } from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const adminType = localStorage.getItem("admin_type") || "Admin";
  const fullName = localStorage.getItem("full_name") || "";
  const khoa = localStorage.getItem("khoa") || "";
  const boMon = localStorage.getItem("bo_mon") || "";

  return (
    <div className="dashboard-container">
      <div className="dashboard-bg" style={{ backgroundImage: `url(${DashboardBg})` }}>
        <div className="dashboard-content">
          {/* Nội dung chính bên trái */}
          <div className="dashboard-left">
            <h1 className="dashboard-title">HCMUT Tutor Support System</h1>
            <div className="dashboard-description-box">
              <p className="dashboard-description">
                Chào mừng <strong>{fullName}</strong> ({adminType}) đến với hệ thống Tutor Support System.
                {khoa && <><br />Khoa: <strong>{khoa}</strong></>}
                {boMon && <><br />Bộ môn: <strong>{boMon}</strong></>}
                <br /><br />
                Hệ thống giúp bạn quản lý và giám sát chương trình hỗ trợ học tập một cách hiệu quả.
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
                  onClick={() => navigate("/admin/tutor-approval")}
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
                  <FaCheckCircle /> Xác thực Tutor
                </button>
                <button 
                  className="dashboard-view-more-btn"
                  onClick={() => navigate("/admin/users")}
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
                  <FaUsers /> Quản lý Users
                </button>
                <button 
                  className="dashboard-view-more-btn"
                  onClick={() => navigate("/admin/activity")}
                  style={{
                    padding: "15px",
                    background: "#f59e0b",
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
                  <FaChartLine /> Hoạt động
                </button>
                <button 
                  className="dashboard-view-more-btn"
                  onClick={() => navigate("/admin/quality")}
                  style={{
                    padding: "15px",
                    background: "#ef4444",
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
                  <FaStar /> Chất lượng
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

export default AdminDashboard;

