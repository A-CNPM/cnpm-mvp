import { FaCalendarAlt, FaUser, FaClock, FaBook, FaGlobe, FaStar, FaGraduationCap, FaTags, FaInfoCircle, FaFilter } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import MenteeSidebar from "../../components/MenteeSidebar";
import SearchService from "../../api/search";

function FindTutor() {
  // --- STATE DỮ LIỆU ---
  const [tutors, setTutors] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- STATE MODAL XEM LỊCH DẠY ---
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tutorSessions, setTutorSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentTutorName, setCurrentTutorName] = useState("");
  
  // State Filter cho Modal Lịch Dạy (MỚI)
  const [scheduleMode, setScheduleMode] = useState("");   // "Online" / "Offline"
  const [scheduleStatus, setScheduleStatus] = useState(""); // "Sắp diễn ra", ...

  // --- STATE MODAL XEM PROFILE ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tutorProfile, setTutorProfile] = useState(null);

  // --- API: Lấy danh sách Tutor ---
  const fetchTutors = async () => {
    setLoading(true);
    const criteria = { keyword: keyword };
    const data = await SearchService.searchTutors(criteria);
    setTutors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // --- EFFECT: Tự động tải/lọc lịch dạy khi Modal mở hoặc Filter thay đổi (MỚI) ---
  useEffect(() => {
    const fetchTutorSchedule = async () => {
      if (!showScheduleModal || !currentTutorName) return;

      setLoadingSessions(true);
      try {
        // Gửi cả tên Tutor + Các bộ lọc
        const criteria = { 
            tutor_name: currentTutorName,
            mode: scheduleMode || null,
            status: scheduleStatus || null
        };
        const data = await SearchService.searchSessions(criteria);
        setTutorSessions(data);
      } catch (error) {
        console.error("Lỗi lấy lịch dạy:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchTutorSchedule();
  }, [showScheduleModal, currentTutorName, scheduleMode, scheduleStatus]);

  // --- HANDLER: Mở Modal Xem lịch dạy ---
  const handleViewSchedule = (tutor) => {
    setCurrentTutorName(tutor.full_name);
    // Reset bộ lọc về mặc định mỗi khi mở modal mới
    setScheduleMode("");
    setScheduleStatus("");
    setTutorSessions([]); // Xóa dữ liệu cũ
    setShowScheduleModal(true);
    // (useEffect phía trên sẽ tự chạy để load dữ liệu)
  };

  // --- HANDLER: Xem Profile ---
  const handleViewProfile = (tutor) => {
    setTutorProfile(tutor); 
    setShowProfileModal(true);
  };

  return (
    <>
      <div className="mentee-dashboard">
        <MenteeSidebar activeItem="find-tutor" />
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">mentee@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Tìm kiếm và lựa chọn Tutor</h2>
          
          <div className="search-bar-row">
            <input 
              className="search-bar" 
              placeholder="Tìm tutor theo tên..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTutors()}
              style={{ 
                backgroundColor: "#e5e7eb",
                color: "black" 
               }}
            />
            <button className="filter-btn" onClick={fetchTutors}>Tìm kiếm</button>
            <button className="ai-btn">AI Matching</button>
            <button className="connected-btn">Danh sách Tutor đã kết nối</button>
          </div>

          <div className="tutor-list">
            {loading ? <p style={{textAlign: "center"}}>Đang tải...</p> : tutors.map((tutor, idx) => (
              <div className="tutor-card" key={tutor.tutorID || idx}>
                <div className="tutor-avatar">
                  <span role="img" aria-label="avatar" style={{fontSize: 64, color: "#b3a4e6"}}>👤</span>
                </div>
                <div className="tutor-info">
                  <div className="tutor-name">{tutor.full_name}</div>
                  <div className="tutor-rating">
                    <span role="img" aria-label="star" style={{color: "#2563eb"}}>★</span> {tutor.rating}
                  </div>
                  <div className="tutor-major">
                    <span role="img" aria-label="globe" style={{color: "#2563eb"}}>🌐</span> {tutor.major}
                  </div>
                  <div className="tutor-tags">
                    {tutor.tags && tutor.tags.map(tag => (
                      <span className="tutor-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="tutor-actions">
                  <button 
                    className="tutor-btn" 
                    style={{backgroundColor: "#4f46e5", color: "white", marginRight: "10px"}}
                    onClick={() => handleViewSchedule(tutor)}
                  >
                    Xem lịch dạy
                  </button>
                  <button
                    className="tutor-btn"
                    style={{backgroundColor: "#fff", color: "#4f46e5", border: "1px solid #4f46e5"}}
                    onClick={() => handleViewProfile(tutor)}
                  >
                    Xem hồ sơ
                  </button>
                </div>
              </div>
            ))}
          </div>
           {/* Pagination... */}
        </main>
      </div>

      {/* --- MODAL 1: XEM PROFILE --- */}
      {showProfileModal && tutorProfile && (
        <div className="modal-overlay">
          <div 
            className="modal-detail-form"
            style={{maxWidth: "600px", width: "90%", padding: "25px", borderRadius: "12px", maxHeight: "90vh", overflowY: "auto"}}
          >
            <div style={{textAlign: "center", marginBottom: 20}}>
                <div style={{fontSize: "64px", marginBottom: "10px"}}>👤</div>
                <h2 style={{margin: "0 0 5px 0", color: "#1e293b"}}>{tutorProfile.full_name}</h2>
                <div style={{color: "#64748b"}}>{tutorProfile.email}</div>
            </div>
            {/* ... (Phần nội dung Profile giữ nguyên) ... */}
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px"}}>
                <div style={{background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
                    <div style={{color: "#64748b", fontSize: "12px", fontWeight: "bold", marginBottom: "5px"}}>CHUYÊN NGÀNH</div>
                    <div style={{fontWeight: "600", color: "#334155", display: "flex", alignItems: "center"}}>
                        <FaGraduationCap style={{marginRight: 8, color: "#4f46e5"}}/> {tutorProfile.major}
                    </div>
                </div>
                <div style={{background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
                    <div style={{color: "#64748b", fontSize: "12px", fontWeight: "bold", marginBottom: "5px"}}>ĐÁNH GIÁ</div>
                    <div style={{fontWeight: "600", color: "#334155", display: "flex", alignItems: "center"}}>
                        <FaStar style={{marginRight: 8, color: "#eab308"}}/> {tutorProfile.rating} / 5.0
                    </div>
                </div>
            </div>
            <div style={{marginBottom: "20px"}}>
                 <label style={{fontSize: "13px", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "8px"}}>
                    <FaInfoCircle style={{marginRight: 5}}/> GIỚI THIỆU
                 </label>
                 <div style={{padding: "15px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155"}}>
                     {tutorProfile.profile || "Chưa cập nhật."}
                 </div>
            </div>
            <div style={{marginBottom: "25px"}}>
                <label style={{fontSize: "13px", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "8px"}}>
                    <FaTags style={{marginRight: 5}}/> TAGS
                </label>
                <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
                    {tutorProfile.tags?.map(tag => (
                        <span key={tag} style={{background: "#e0e7ff", color: "#4338ca", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "500"}}>#{tag}</span>
                    ))}
                </div>
            </div>

            <div style={{textAlign: "right", borderTop: "1px solid #e2e8f0", paddingTop: "15px"}}>
                <button className="modal-submit" onClick={() => setShowProfileModal(false)} style={{padding: "8px 24px"}}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XEM LỊCH DẠY (ĐÃ CẬP NHẬT FILTER) --- */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div 
            className="modal-detail-form"
            style={{
                maxWidth: "700px", 
                width: "90%", 
                padding: "20px", 
                borderRadius: "10px",
                maxHeight: "85vh",
                overflowY: "auto"
            }}
          >
            {/* HEADER MODAL */}
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, borderBottom: "1px solid #eee", paddingBottom: 10}}>
                <h3 style={{margin: 0, color: "#1e293b"}}>
                   Lịch dạy: {currentTutorName}
                </h3>
                <button 
                    onClick={() => setShowScheduleModal(false)}
                    style={{background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666"}}
                >
                    &times;
                </button>
            </div>

            {/* --- KHU VỰC FILTER TRONG MODAL (MỚI) --- */}
            <div style={{
                display: "flex", 
                gap: "10px", 
                marginBottom: "20px", 
                background: "#f1f5f9", 
                padding: "10px", 
                borderRadius: "8px"
            }}>
                <div style={{flex: 1}}>
                    <select 
                        value={scheduleMode}
                        onChange={(e) => setScheduleMode(e.target.value)}
                        style={{width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1"}}
                    >
                        <option value="">-- Mọi hình thức --</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <select 
                        value={scheduleStatus}
                        onChange={(e) => setScheduleStatus(e.target.value)}
                        style={{width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1"}}
                    >
                        <option value="">-- Mọi trạng thái --</option>
                        <option value="Sắp diễn ra">Sắp diễn ra</option>
                        <option value="Đang mở đăng ký">Đang mở đăng ký</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
            </div>
            
            {/* DANH SÁCH SESSIONS */}
            {loadingSessions ? (
                <p style={{textAlign: "center"}}>Đang tải dữ liệu...</p>
            ) : tutorSessions.length === 0 ? (
                <div style={{textAlign: "center", color: "#64748b", padding: 20, background: "#f8fafc", borderRadius: 8}}>
                    <FaCalendarAlt style={{fontSize: 24, marginBottom: 5, color: "#94a3b8"}}/>
                    <p>Không tìm thấy buổi học nào phù hợp.</p>
                </div>
            ) : (
                <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    {tutorSessions.map((session, index) => (
                        <div key={index} style={{
                            border: "1px solid #e2e8f0", 
                            borderRadius: "8px", 
                            padding: "15px",
                            backgroundColor: "#fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}>
                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
                                <strong style={{color: "#4f46e5", fontSize: "16px"}}>
                                    <FaBook style={{marginRight: 6, fontSize: 14}}/>
                                    {session.topic}
                                </strong>
                                <span style={{
                                    fontSize: "12px", 
                                    padding: "4px 8px", 
                                    borderRadius: "4px", 
                                    background: session.status === "Sắp diễn ra" ? "#e6fcf7" : "#f1f5f9",
                                    color: session.status === "Sắp diễn ra" ? "#0d9488" : "#64748b",
                                    fontWeight: "bold"
                                }}>
                                    {session.status}
                                </span>
                            </div>

                            <div style={{display: "flex", gap: "20px", fontSize: "14px", color: "#475569", flexWrap: "wrap"}}>
                                <span><FaClock style={{marginRight: 5}}/> {session.time}</span>
                                <span><FaGlobe style={{marginRight: 5}}/> {session.mode}</span>
                            </div>
                            
                            <div style={{fontSize: "13px", color: "#64748b"}}>
                                {session.content ? session.content : "Chưa có nội dung chi tiết."}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{textAlign: "right", marginTop: 20}}>
                <button 
                    className="modal-submit" 
                    onClick={() => setShowScheduleModal(false)}
                    style={{padding: "8px 24px"}}
                >
                    Đóng
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default FindTutor;