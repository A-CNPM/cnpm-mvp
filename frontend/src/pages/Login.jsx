import "../assets/css/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { use, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login as loginApi } from "../api/auth";

function Login() {
  const [fullName, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Mentee");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginApi(fullName, password, role);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      console.log(data);
      setMessage("Đăng nhập thành công!");
      if (data.role === "Mentee") {
        navigate("/mentee/meeting");
      } else if (data.role === "Tutor") {
        navigate("/tutor/meeting");
      }
    } catch (err) {
      setMessage("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Đăng nhập</h1>
        <label className="login-label" htmlFor="role">Vai trò</label>
        <select
          className="login-input"
          id="role"
          name="role"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="Mentee">Mentee</option>
          <option value="Tutor">Tutor</option>
        </select>
        <label className="login-label" htmlFor="full_name">Tên đăng nhập</label>
        <input
          className="login-input"
          type="text"
          id="full_name"
          name="full_name"
          value={fullName}
          onChange={e => setFullname(e.target.value)}
        />
        <label className="login-label" htmlFor="password">Mật khẩu</label>
        <input
            className="login-input"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        <button type="submit" className="login-btn">Đăng nhập</button>
        <a href="/register" className="login-link">Đăng kí tham gia chương trình</a>
        {message && <div className="login-message">{message}</div>}
      </form>
    </div>
  );
}
export default Login;