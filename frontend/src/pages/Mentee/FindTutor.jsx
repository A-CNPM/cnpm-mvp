import { FaHome, FaCalendarAlt, FaUser, FaChartBar, FaEdit } from "react-icons/fa";
import React, { useState } from "react";
import "../../assets/css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const tutors = [
  { name: "Nguyễn Văn A", rating: 4.7, major: "KH&KTM", tags: ["DSA", "Web"] },
  { name: "Nguyễn Văn A", rating: 4.7, major: "KH&KTM", tags: ["DSA", "Web"] },
  { name: "Nguyễn Văn A", rating: 4.7, major: "KH&KTM", tags: ["DSA", "Web"] },
  { name: "Nguyễn Văn A", rating: 4.7, major: "KH&KTM", tags: ["DSA", "Web"] },
  { name: "Nguyễn Văn A", rating: 4.7, major: "KH&KTM", tags: ["DSA", "Web"] },
];

function FindTutor() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="mentee-dashboard">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <div className="sidebar-item">
              <span className="sidebar-icon"><FaHome style={{color: "#6366f1", fontSize: 20}} /></span>
              Tổng quan
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon"><FaCalendarAlt style={{color: "#6366f1", fontSize: 20}} /></span>
              Buổi tư vấn
            </div>
            <div className="sidebar-item active">
              <span className="sidebar-icon"><FaUser style={{color: "#6366f1", fontSize: 20}} /></span>
              <span className="sidebar-text">Tìm kiếm Tutor</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon"><FaChartBar style={{color: "#6366f1", fontSize: 20}} /></span>
              Đánh giá
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon"><FaEdit style={{color: "#6366f1", fontSize: 20}} /></span>
              Đăng kí làm Tutor
            </div>
          </div>
        </aside>
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">mentee@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Tìm kiếm và lựa chọn Tutor</h2>
          <div className="search-bar-row">
            <input className="search-bar" placeholder="Tìm tutor" />
            <button className="filter-btn">Filters</button>
            <button className="ai-btn">AI Matching</button>
            <button className="connected-btn">Danh sách Tutor đã kết nối</button>
          </div>
          <div className="tutor-list">
            {tutors.map((tutor, idx) => (
              <div className="tutor-card" key={idx}>
                <div className="tutor-avatar">
                  <span role="img" aria-label="avatar" style={{fontSize: 64, color: "#b3a4e6"}}>👤</span>
                </div>
                <div className="tutor-info">
                  <div className="tutor-name">{tutor.name}</div>
                  <div className="tutor-rating">
                    <span role="img" aria-label="star" style={{color: "#2563eb"}}>★</span> {tutor.rating}
                  </div>
                  <div className="tutor-major">
                    <span role="img" aria-label="globe" style={{color: "#2563eb"}}>🌐</span> {tutor.major}
                  </div>
                  <div className="tutor-tags">
                    {tutor.tags.map(tag => (
                      <span className="tutor-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="tutor-actions">
                  <button className="tutor-btn profile">Xem hồ sơ</button>
                  <button
                    className="tutor-btn choose"
                    onClick={() => setShowModal(true)}
                  >
                    Chọn
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-row">
            <span>1 - 5 of 56</span>
            <div className="pagination">
              <span>The page you're on</span>
              <select>
                <option>1</option>
              </select>
              <button>{"<"}</button>
              <button>{">"}</button>
            </div>
          </div>
        </main>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-form">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">Đăng kí buổi tư vấn</h2>
            <form>
              <label>Tutor</label>
              <select>
                <option>Nguyễn Văn A</option>
              </select>
              <label>Chọn ca</label>
              <select>
                <option>T2, 15:00-17:00, 1/11/2025</option>
              </select>
              <label>Chọn hình thức</label>
              <select>
                <option>Online</option>
                <option>Offline</option>
              </select>
              <label>Yêu cầu nội dung</label>
              <textarea placeholder="Nội dung"></textarea>
              <button type="submit" className="modal-submit">Đăng kí</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
export default FindTutor;