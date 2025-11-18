import "../assets/css/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Login() {
  return (
    <div className="login-bg">
      <form className="login-form">
        <h1 className="login-title">Đăng nhập</h1>
        <label className="login-label" htmlFor="role">Vai trò</label>
        <select className="login-input" id="role" name="role" defaultValue="Mentee">
          <option value="Mentee">Mentee</option>
          <option value="Tutor">Tutor</option>
        </select>
        <label className="login-label" htmlFor="username">Tên đăng nhập</label>
        <input className="login-input" type="text" id="username" name="username" />
        <label className="login-label" htmlFor="password">Mật khẩu</label>
        <input className="login-input" type="password" id="password" name="password" />
        <button type="submit" className="login-btn">Đăng nhập</button>
        <a href="/register" className="login-link">Đăng kí tham gia chương trình</a>
      </form>
    </div>
  );
}
export default Login;