import "../assets/css/style.css";
import { useNavigate } from "react-router-dom";
import DashboardBg from "../assets/images/bg.png";
import ChibiCharacter from "../assets/images/nv.png";

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Mentee";

  return (
    <div className="dashboard-container">
      <div className="dashboard-bg" style={{ backgroundImage: `url(${DashboardBg})` }}>
        <div className="dashboard-content">
          {/* Nội dung chính bên trái */}
          <div className="dashboard-left">
            <h1 className="dashboard-title">HCMUT Tutor Support System</h1>
            <div className="dashboard-description-box">
              <p className="dashboard-description">
                Hệ thống thông minh được thiết kế và vận hành chương trình Tutor - Mentor dành cho 
                sinh viên Trường Đại học Bách Khoa. Hệ thống tạo môi trường kết nối và tối ưu hóa hoạt 
                động hỗ trợ học tập giữa sinh viên và nhà trường.
              </p>
              <button 
                className="dashboard-view-more-btn"
                onClick={() => {
                  if (role === "Mentee") {
                    navigate("/mentee/meeting");
                  } else {
                    navigate("/tutor/meeting");
                  }
                }}
              >
                View more
              </button>
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

export default Dashboard;
