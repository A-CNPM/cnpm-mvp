import "../assets/css/style.css";
import { useNavigate } from "react-router-dom";
import HCMUTLogo from "../assets/images/HCMUT_logo.png";
import HomePageBg from "../assets/images/HomePage.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="homepage-bg" style={{ backgroundImage: `url(${HomePageBg})` }}>
        <div className="homepage-content">
          {/* Logo ở góc trên trái */}


          {/* Nội dung chính bên trái */}
          <div className="homepage-left">
            <button 
              className="homepage-login-btn"
              onClick={() => navigate("/login")}
            >
              Login with HCMUT_SSO
            </button>
          </div>

          {/* Nhân vật hoạt hình bên phải (đã có trong background image) */}
        </div>
      </div>
    </div>
  );
}
export default HomePage;