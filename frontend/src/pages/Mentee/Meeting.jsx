import { FaUser, FaBook, FaGlobe, FaCalendar, FaPaperclip, FaHome, FaCalendarAlt, FaChartBar, FaEdit } from "react-icons/fa";
import React, { useState } from "react";
import "../../assets/css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MenteeSidebar from "../../components/MenteeSidebar";

const meetings = [
  {
    topic: "Tư vấn...",
    tutor: "Nguyễn Văn A",
    type: "Online",
    time: "2/11/2025 8:00-10:00",
    status: "Hoàn thành",
    statusColor: "#2dd4bf",
    statusBg: "#e6fcf7",
    students: 10,
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
    content: "Nội dung",
  },
  {
    topic: "Tư vấn...",
    tutor: "Nguyễn Văn A",
    type: "Online",
    time: "2/11/2025 8:00-10:00",
    status: "Sắp diễn ra",
    statusColor: "#a78bfa",
    statusBg: "#f3f0ff",
    students: 10,
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
    content: "Nội dung",
  },
  {
    topic: "Tư vấn...",
    tutor: "Nguyễn Văn A",
    type: "Online",
    time: "2/11/2025 8:00-10:00",
    status: "Đã hủy",
    statusColor: "#f87171",
    statusBg: "#fff1f2",
    students: 10,
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
    content: "Nội dung",
  },
];

function Meeting() {
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleShowDetail = (meeting) => {
    setDetailData(meeting);
    setShowDetail(true);
  };

  return (
    <>
      <div className="mentee-dashboard">
        <MenteeSidebar activeItem="meeting" />
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">mentee@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Buổi tư vấn</h2>
          <div className="search-bar-row">
            <input className="search-bar" placeholder="Tìm kiếm buổi tư vấn khả dụng" />
            <button className="filter-btn">Filters</button>
            <button className="new-meeting-btn">Đăng kí mới</button>
          </div>
          <div className="meeting-list">
            {meetings.map((meeting, idx) => (
              <div className="meeting-card" key={idx}>
                <div className="meeting-info">
                  <div className="meeting-topic">
                    <FaBook style={{color: "#6366f1", marginRight: 6}} /> Chủ đề: {meeting.topic}
                  </div>
                  <div className="meeting-tutor">
                    <FaUser style={{color: "#6366f1", marginRight: 6}} /> Tutor: {meeting.tutor}
                  </div>
                  <div className="meeting-type">
                    <FaGlobe style={{color: "#6366f1", marginRight: 6}} /> Hình thức: {meeting.type}
                  </div>
                  <div className="meeting-time">
                    <FaCalendar style={{color: "#6366f1", marginRight: 6}} /> Thời gian: {meeting.time}
                  </div>
                </div>
                <div className="meeting-status-row">
                  <span
                    className="meeting-status"
                    style={{
                      background: meeting.statusBg,
                      color: meeting.statusColor,
                      borderRadius: "6px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {meeting.status}
                  </span>
                  <button
                    className="meeting-detail-btn"
                    onClick={() => handleShowDetail(meeting)}
                  >
                    Chi tiết
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
       {showDetail && detailData && (
        <div className="modal-overlay">
          <div className="modal-detail-form">
            <div className="modal-detail-grid">
              <div>
                <label>Chủ đề</label>
                <input value={detailData.topic} readOnly />
              </div>
              <div>
                <label>Thời gian</label>
                <input value={detailData.time} readOnly />
              </div>
              <div>
                <label>Tutor</label>
                <input value={detailData.tutor} readOnly />
              </div>
              <div>
                <label>Hình thức</label>
                <input value={detailData.type} readOnly />
              </div>
              <div>
                <label>Số lượng sinh viên</label>
                <input value={detailData.students} readOnly />
              </div>
              <div>
                <label>Đường dẫn / Địa điểm</label>
                <input value={detailData.link} readOnly />
              </div>
              <div>
                <label>Trạng thái</label>
                <span
                  style={{
                    background: detailData.statusBg,
                    color: detailData.statusColor,
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    display: "inline-block",
                  }}
                >
                  {detailData.status}
                </span>
              </div>
              <div>
                <label>Tài liệu</label>
                <FaPaperclip style={{marginRight: 6, verticalAlign: "middle"}} />
                <a href={detailData.document} target="_blank" rel="noopener noreferrer">{detailData.document}</a>
              </div>
            </div>
            <div>
              <label>Nội dung</label>
              <textarea value={detailData.content} readOnly />
            </div>
            <button className="modal-submit" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
}
export default Meeting;