// import "../assets/css/style.css";

function MenteeProfileModal({ onClose }) {
  return (
    <div className="profile-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle"></div>
          <div className="profile-name">Mentee</div>
        </div>
        <div className="profile-info">
          <div className="profile-section">
            <h3>Thông tin cá nhân</h3>
            <div className="profile-grid">
              <div>
                <label>Họ và tên</label>
                <input value="Nguyen Van A" readOnly />
              </div>
              <div>
                <label>MSSV</label>
                <input value="2150000" readOnly />
              </div>
              <div>
                <label>Khoa</label>
                <input value="Khoa Khoa học và Kỹ thuật máy tính" readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value="nguyenvana@hcmut.edu.vn" readOnly />
              </div>
              <div>
                <label>Trình độ</label>
                <input value="Sinh viên" readOnly />
              </div>
              <div>
                <label>Ngành</label>
                <input value="Khoa học máy tính" readOnly />
              </div>
            </div>
          </div>
          {/* Nếu mentee không có chuyên môn thì có thể bỏ phần này */}
          <div className="profile-section">
            <h3>Giới thiệu bản thân</h3>
            <div>
              <label>Mô tả giới thiệu</label>
              <textarea value="Sinh viên năm 4, yêu thích học hỏi và phát triển bản thân." readOnly />
            </div>
          </div>
          <div className="profile-section">
            <h3>Lịch rảnh</h3>
            <ul className="profile-schedule">
              <li>T2, 19:00 - 22:00, 17/10/2025-22/12/2025</li>
              <li>T4, 9:00 - 11:00, 17/10/2025-22/12/2025</li>
              <li>T4, 14:00 - 16:00, 17/10/2025-31/10/2025</li>
              <li>T7, 13:00 - 15:00, 1/10/2025</li>
            </ul>
          </div>
          <button className="modal-submit" style={{marginTop: 24}}>Chỉnh sửa</button>
        </div>
      </div>
    </div>
  );
}
export default MenteeProfileModal;