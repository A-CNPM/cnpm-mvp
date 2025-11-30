import textlogo from "../assets/images/text-logo.png";
import "../assets/css/style.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <img src={textlogo} alt="BK Text Logo" className="footer-logo" />
      </div>
      <div className="footer-right">
        <span>&gt; Thông tin liên hệ và hỗ trợ</span>
        <span>Email: cnpm.bk25@gmail.com</span>
        <span>&gt; Biểu mẫu hỗ trợ</span>
      </div>
    </footer>
  );
}
export default Footer;