import { FaCalendar, FaPaperclip, FaHome, FaCalendarAlt, FaChartBar, FaEdit, FaListUl, FaEllipsisV } from "react-icons/fa";
import { useState } from "react";
import "../../assets/css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TutorSidebar from "../../components/TutorSidebar";

const meetings = [
  {
    id: "#L000001",
    date: "1/1/2025",
    lecturer: "Lê Văn A",
    email: "tutor@hcmut.edu.vn",
    topic: "Tư vấn...",
    status: "Đã duyệt",
    statusColor: "#34d399",
    statusBg: "#e6fcf7",
    option: "Chọn",
    content: "Nội dung buổi tư vấn",
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
  },
  {
    id: "#L000001",
    date: "1/1/2025",
    lecturer: "Lê Văn A",
    email: "tutor@hcmut.edu.vn",
    topic: "Tư vấn...",
    status: "Đã hủy",
    statusColor: "#f87171",
    statusBg: "#fff1f2",
    option: "Chọn",
    content: "Nội dung buổi tư vấn",
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
  },
  {
    id: "#L000001",
    date: "1/1/2025",
    lecturer: "Lê Văn A",
    email: "tutor@hcmut.edu.vn",
    topic: "Tư vấn...",
    status: "Khởi tạo",
    statusColor: "#fbbf24",
    statusBg: "#fff7ed",
    option: "Chọn",
    content: "Nội dung buổi tư vấn",
    link: "www.meet.google.com/123-456-789",
    document: "https://....",
  },
];

function Meeting() {
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleShowDetail = (meeting) => {
    setDetailData(meeting);
    setShowDetail(true);
  };

  const handleShowEdit = (meeting) => {
    setEditData(meeting);
    setShowEditModal(true);
  };

  return (
    <>
      <div className="tutor-dashboard">
        <TutorSidebar activeItem="meeting" blur={showCreateModal || showEditModal} />
        <main className={`main-content${showCreateModal || showEditModal ? " blur-bg" : ""}`}>
          <div className="tutor-header">
            <h1 className="tutor-title">Tutor.</h1>
            <div className="tutor-email">tutor@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Danh sách buổi tư vấn</h2>
          <div className="search-bar-row">
            <input className="search-bar" placeholder="Tìm lớp học" />
            <button className="filter-btn">Filters</button>
            <button className="new-meeting-btn" onClick={() => setShowCreateModal(true)}>Thêm buổi</button>
          </div>
          <div className="meeting-table">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>ID</th>
                  <th>Ngày</th>
                  <th>Giảng viên</th>
                  <th>Email</th>
                  <th>Chủ đề</th>
                  <th>Trạng thái</th>
                  <th>Xem</th>
                  <th>Option</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting, idx) => (
                  <tr key={idx}>
                    <td><input type="checkbox" /></td>
                    <td>{meeting.id}</td>
                    <td>{meeting.date}</td>
                    <td>{meeting.lecturer}</td>
                    <td>
                      <a href={`mailto:${meeting.email}`} style={{color: "#2563eb", textDecoration: "none"}}>{meeting.email}</a>
                    </td>
                    <td>{meeting.topic}</td>
                    <td>
                      <span
                        style={{
                          background: meeting.statusBg,
                          color: meeting.statusColor,
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          display: "inline-block",
                        }}
                      >
                        {meeting.status}
                      </span>
                    </td>
                    <td>
                      <button className="meeting-detail-btn" onClick={() => handleShowDetail(meeting)}>Chọn</button>
                    </td>
                    <td>
                      <span className="meeting-option-icon" onClick={() => handleShowEdit(meeting)}>
                        <FaEllipsisV />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      {/* Modal chi tiết buổi tư vấn */}
      {showDetail && detailData && (
        <div className="modal-overlay">
          <div className="modal-detail-form">
            <div className="modal-detail-grid">
              <div>
                <label>ID</label>
                <input value={detailData.id} readOnly />
              </div>
              <div>
                <label>Ngày</label>
                <input value={detailData.date} readOnly />
              </div>
              <div>
                <label>Giảng viên</label>
                <input value={detailData.lecturer} readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value={detailData.email} readOnly />
              </div>
              <div>
                <label>Chủ đề</label>
                <input value={detailData.topic} readOnly />
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
                <label>Đường dẫn / Địa điểm</label>
                <input value={detailData.link} readOnly />
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
      {/* Modal tạo buổi tư vấn */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-create-form">
            <form>
              <div className="modal-create-grid">
                <div>
                  <label>Chủ đề</label>
                  <input placeholder="Chủ đề" />
                </div>
                <div>
                  <label>Thời gian</label>
                  <input placeholder="1/11/2025 12:00 - 14:00" />
                </div>
                <div>
                  <label>Ngày tạo</label>
                  <input placeholder="1/1/2025" />
                </div>
                <div>
                  <label>Hình thức</label>
                  <select>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
                <div>
                  <label>Số sinh viên</label>
                  <input placeholder="10" />
                </div>
                <div>
                  <label>Đường dẫn / Địa điểm</label>
                  <input placeholder="www.meet.google.com/123-456-789" />
                </div>
                <div>
                  <label>Trạng thái</label>
                  <select>
                    <option>Khởi tạo</option>
                    <option>Đã duyệt</option>
                    <option>Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label>Tài liệu</label>
                  <div style={{display: "flex", alignItems: "center"}}>
                    <FaPaperclip style={{marginRight: 6, verticalAlign: "middle"}} />
                    <input placeholder="https://...." style={{flex: 1}} />
                    <button type="button" className="upload-btn">Tải lên</button>
                  </div>
                </div>
              </div>
              <div>
                <label>Nội dung</label>
                <textarea placeholder="Nội dung" />
              </div>
              <button type="submit" className="modal-submit">Tạo</button>
              <div style={{textAlign: "center", marginTop: 12}}>
                <button type="button" className="back-link" onClick={() => setShowCreateModal(false)}>
                  Quay lại danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal cập nhật buổi tư vấn */}
      {showEditModal && editData && (
        <div className="modal-overlay">
          <div className="modal-edit-form">
            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            <form>
              <div className="modal-create-grid">
                <div>
                  <label>Chủ đề</label>
                  <input defaultValue={editData.topic} />
                </div>
                <div>
                  <label>Thời gian</label>
                  <input defaultValue={editData.date + " 12:00 - 14:00"} />
                </div>
                <div>
                  <label>Ngày tạo</label>
                  <input defaultValue={editData.date} />
                </div>
                <div>
                  <label>Hình thức</label>
                  <select defaultValue="Online">
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
                <div>
                  <label>Số sinh viên</label>
                  <input defaultValue="10" />
                </div>
                <div>
                  <label>Đường dẫn / Địa điểm</label>
                  <input defaultValue={editData.link} />
                </div>
                <div>
                  <label>Trạng thái</label>
                  <select defaultValue={editData.status}>
                    <option>Khởi tạo</option>
                    <option>Đã duyệt</option>
                    <option>Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label>Tài liệu</label>
                  <div style={{display: "flex", alignItems: "center"}}>
                    <FaPaperclip style={{marginRight: 6, verticalAlign: "middle"}} />
                    <input defaultValue={editData.document} style={{flex: 1}} />
                    <button type="button" className="upload-btn">Tải lên</button>
                  </div>
                </div>
              </div>
              <div>
                <label>Nội dung</label>
                <textarea defaultValue={editData.content} />
              </div>
              <button type="submit" className="modal-submit">Cập nhật</button>
              <div style={{textAlign: "center", marginTop: 12, display: "flex", justifyContent: "center", gap: "32px"}}>
                <button type="button" className="back-link" onClick={() => setShowEditModal(false)}>
                  Quay lại danh sách
                </button>
                <button type="button" className="back-link" onClick={() => setShowEditModal(false)}>
                  Hủy lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
export default Meeting;