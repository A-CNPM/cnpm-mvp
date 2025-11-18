import "../assets/css/style.css";

function ProfileModal({ onClose }) {
  return (
    <div className="profile-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle"></div>
          <div className="profile-name">Mentor</div>
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
                <label>MSSV/MSCB</label>
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
          <div className="profile-section">
            <h3>Hồ sơ chuyên môn</h3>
            <div className="profile-grid">
              <div>
                <label>Chuyên môn chính</label>
                <input value="Công nghệ phần mềm" readOnly />
              </div>
              <div>
                <label>Trình độ chuyên môn</label>
                <input value="Đại học" readOnly />
              </div>
              <div>
                <label>Trình độ ngoại ngữ</label>
                <input value="TOEIC 800, JLPT N3" readOnly />
              </div>
            </div>
            <div>
              <label>Mô tả giới thiệu</label>
              <textarea value="Sinh viên năm 4 với 1 năm kinh nghiệm Lập trình Web Fullstack với các công nghệ NodeJS, ReactJS, JavaScript, MySQL." readOnly />
            </div>
            <div>
              <label>Tag:</label>
              <span className="profile-tag">DSA</span>
              <span className="profile-tag">Web</span>
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
export default ProfileModal;