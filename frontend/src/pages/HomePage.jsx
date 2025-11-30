import "../assets/css/style.css";
import { useNavigate } from "react-router-dom";
import BKLogo from "../assets/images/logobk.png";
import HomePageBg from "../assets/images/bg.png";
import ChibiCharacter from "../assets/images/nv.png";
import {
  FaArrowRight
} from "react-icons/fa";

function HomePage() {
  const navigate = useNavigate();

  const benefits = [
    "Hỗ trợ học tập hiệu quả",
    "Linh hoạt về thời gian",
    "Kết nối với cộng đồng",
    "Theo dõi tiến bộ"
  ];

  return (
    <div className="homepage-container">
      <div className="homepage-bg" style={{ backgroundImage: `url(${HomePageBg})` }}>
        <div className="homepage-content">
          {/* Logo ở góc trên trái */}
          <div className="homepage-logo">
            <img src={BKLogo} alt="BK Logo" />
          </div>

          {/* Nội dung chính bên trái */}
          <div className="homepage-left">
            <div className="homepage-welcome-container">
              <h1 className="homepage-welcome-line1">Welcome to</h1>
              <h1 className="homepage-welcome-line2">HCMUT_TSS</h1>
            </div>
            <p className="homepage-subtitle">
              Hệ thống thông minh kết nối sinh viên với các tutor chuyên nghiệp. 
              Nâng cao chất lượng học tập và phát triển kỹ năng cùng chúng tôi.
            </p>
            
            {/* Lợi ích nổi bật */}
            <div style={{
              marginTop: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20
            }}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 14,
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    fontWeight: 500
                  }}
                >
                  ✓ {benefit}
                </div>
              ))}
            </div>

            <button 
              className="homepage-login-btn"
              onClick={() => navigate("/role-selection")}
            >
              Đăng nhập với HCMUT_SSO
              <FaArrowRight style={{ marginLeft: 10, fontSize: 18 }} />
            </button>
          </div>

          {/* Nhân vật chibi bên phải */}
          <div className="homepage-chibi">
            <img src={ChibiCharacter} alt="Chibi Character" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
