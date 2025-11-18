import "../assets/css/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="homepage-bg">
      <div className="intro">
        <h1 className="title">HCMUT Tutor Support System</h1>
        <p className="describe">
          Hệ thống thông minh được thiết kế và vận hành chương trình Tutor - Mentor dành cho 
          sinh viên Trường Đại học Bách Khoa. Hệ thống tạo môi trường kết nối và tối ưu hóa hoạt 
          động hỗ trợ học tập giữa sinh viên và nhà trường.
        </p>
        <a href="/login" className="login-button">Đăng nhập</a>
      </div>
    </div>
  );
}
export default HomePage;