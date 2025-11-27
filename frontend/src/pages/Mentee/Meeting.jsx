import { FaUser, FaBook, FaGlobe, FaCalendar, FaPaperclip, FaFilter } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import MenteeSidebar from "../../components/MenteeSidebar";
import SessionService from "../../api/session"; 

function Meeting() {
  // --- STATE QUẢN LÝ UI ---
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- STATE DỮ LIỆU ---
  const [meetings, setMeetings] = useState([]);
  const [cancelingSession, setCancelingSession] = useState(null); // ID session đang hủy

  // --- STATE TÌM KIẾM & BỘ LỌC ---
  const [keyword, setKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Ẩn/hiện menu lọc
  const [filterMode, setFilterMode] = useState("");      // Giá trị: "", "Online", "Offline"
  const [filterStatus, setFilterStatus] = useState("");  // Giá trị: "", "Sắp diễn ra", ...

  // Mentee ID hiện tại
  const currentMenteeId = "c.tran";

  // Hàm format thời gian session giống như trong FindTutor
  const formatSessionTime = (session) => {
    if (session.startTime && session.endTime) {
      return `${session.startTime} - ${session.endTime.split(' ')[1]}`;
    }
    return session.time || "Chưa xác định";
  };

  // --- HÀM HELPER: MÀU SẮC TRẠNG THÁI ---
  const getStatusStyles = (status) => {
    switch (status) {
      case "Hoàn thành":
        return { color: "#2dd4bf", bg: "#e6fcf7" }; // Xanh ngọc
      case "Đã hủy":
        return { color: "#f87171", bg: "#fff1f2" }; // Đỏ
      case "Sắp diễn ra":
        return { color: "#f59e0b", bg: "#fef3c7" }; // Màu cam vàng
      case "Đang mở đăng ký":
        return { color: "#a78bfa", bg: "#f3f0ff" }; // Tím
      default:
        return { color: "#64748b", bg: "#f1f5f9" }; // Xám
    }
  };

  // --- HÀM GỌI API ---
  const fetchSessions = async () => {
    setLoading(true);
    try {
      // 1. Tạo tiêu chí tìm kiếm từ State (lấy tất cả sessions)
      const criteria = {
        keyword: keyword,
        mode: filterMode || null,     // Nếu rỗng thì gửi null
        status: filterStatus || null, // Nếu rỗng thì gửi null
      };

      console.log("Calling API with:", criteria);

      // 2. Gọi Service lấy tất cả sessions
      const data = await SessionService.searchSessions(criteria);

      // 3. Lọc chỉ các sessions mà mentee đã đăng ký
      const registeredSessions = data.filter(session => 
        session.participants && session.participants.includes(currentMenteeId)
      );

      // 3. Map dữ liệu từ Backend -> Frontend
      const formattedData = registeredSessions.map((item) => {
        const styles = getStatusStyles(item.status);
        return {
            ...item, // Giữ lại các trường gốc
            
            // Map các trường hiển thị UI
            topic: item.topic,
            tutor: item.tutor, // Backend trả về ID
            type: item.mode,     // UI dùng 'type', BE trả 'mode'
            time: formatSessionTime(item), // Sử dụng hàm format thời gian
            status: item.status,
            statusColor: styles.color,
            statusBg: styles.bg,
            students: item.maxParticipants,
            link: item.location, 
            
            // Xử lý tài liệu (Lấy cái đầu tiên nếu có)
            document: item.resources && item.resources.length > 0 ? item.resources[0].url : "",
            content: item.content
        };
      });

      setMeetings(formattedData);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT: Chạy khi vào trang hoặc khi thay đổi bộ lọc ---
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, filterStatus]); // Tự động load lại khi chọn Filter

  // --- HANDLERS ---
  const handleShowDetail = (meeting) => {
    setDetailData(meeting);
    setShowDetail(true);
  };

  const handleSearch = () => {
    fetchSessions();
  };

  // --- HANDLER: Hủy đăng ký session ---
  const handleCancelSession = async (sessionId, sessionTopic) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đăng ký buổi tư vấn "${sessionTopic}"?`)) {
      return;
    }

    setCancelingSession(sessionId);
    try {
      const result = await SessionService.cancelSession(sessionId, currentMenteeId);
      
      if (result.success) {
        alert(`Hủy đăng ký thành công buổi tư vấn "${sessionTopic}"!`);
        // Refresh danh sách để cập nhật
        fetchSessions();
      } else {
        alert(result.message || "Hủy đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi hủy đăng ký:", error);
      
      let errorMessage = "Hủy đăng ký thất bại. Vui lòng thử lại!";
      
      if (error.message.includes("not registered")) {
        errorMessage = "Bạn chưa đăng ký buổi tư vấn này!";
      } else if (error.message.includes("not found")) {
        errorMessage = "Không tìm thấy buổi tư vấn này!";
      }
      
      alert(errorMessage);
    } finally {
      setCancelingSession(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchSessions();
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      <div className="mentee-dashboard">
        <MenteeSidebar activeItem="meeting" />
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">c.tran@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Buổi tư vấn</h2>
          
          {/* --- THANH TÌM KIẾM --- */}
          <div className="search-bar-row">
            <input 
              className="search-bar" 
              placeholder="Tìm kiếm theo chủ đề, nội dung..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            {/* Nút bật tắt Filter */}
            <button 
                className="filter-btn" 
                onClick={toggleFilters}
                style={{ backgroundColor: showFilters ? "#e0e7ff" : "" }}
            >
               <FaFilter style={{marginRight: 5}}/> Filters
            </button>
            
            <button className="new-meeting-btn">Đăng kí mới</button>
          </div>

          {showFilters && (
            <div style={{
                marginBottom: 20, 
                marginTop: -10,
                padding: 15, 
                background: "#f8fafc", 
                borderRadius: 8, 
                border: "1px solid #e2e8f0",
                display: "flex",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b"}}>HÌNH THỨC</label>
                    <select 
                        value={filterMode} 
                        onChange={(e) => setFilterMode(e.target.value)}
                        style={{padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1", minWidth: 150}}
                    >
                        <option value="">-- Tất cả --</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>

                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b"}}>TRẠNG THÁI</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1", minWidth: 150}}
                    >
                        <option value="">-- Tất cả --</option>
                        <option value="Sắp diễn ra">Sắp diễn ra</option>
                        <option value="Đang mở đăng ký">Đang mở đăng ký</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
                
                <div style={{marginLeft: "auto", alignSelf: "flex-end"}}>
                    <button 
                        onClick={() => { setFilterMode(""); setFilterStatus(""); setKeyword(""); }}
                        style={{
                            padding: "8px 16px",
                            background: "transparent",
                            color: "#64748b",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13
                        }}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>
          )}

          {/* --- DANH SÁCH MEETING --- */}
          <div className="meeting-list">
            {loading && <p style={{textAlign: "center", padding: 20}}>Đang tải dữ liệu...</p>}
            
            {!loading && meetings.length === 0 && (
                <div style={{textAlign: "center", padding: 40, color: "#64748b", background: "#f1f5f9", borderRadius: 8}}>
                    <p style={{marginBottom: 10, fontSize: 18}}>🔍</p>
                    <p>Không tìm thấy buổi tư vấn nào phù hợp.</p>
                </div>
            )}

            {!loading && meetings.map((meeting, idx) => (
              <div className="meeting-card" key={meeting.sessionID || idx}>
                <div className="meeting-info">
                  <div className="meeting-topic">
                    <FaBook style={{color: "#6366f1", marginRight: 6}} /> Chủ đề: <strong>{meeting.topic}</strong>
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
                  <div style={{display: "flex", gap: "8px"}}>
                    <button
                      className="meeting-detail-btn"
                      onClick={() => handleShowDetail(meeting)}
                    >
                      Chi tiết
                    </button>
                    {meeting.status === "Đang mở đăng ký" && (
                      <button
                        onClick={() => handleCancelSession(meeting.sessionID, meeting.topic)}
                        disabled={cancelingSession === meeting.sessionID}
                        style={{
                          padding: "6px 12px",
                          background: cancelingSession === meeting.sessionID ? "#94a3b8" : "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          cursor: cancelingSession === meeting.sessionID ? "not-allowed" : "pointer",
                        }}
                      >
                        {cancelingSession === meeting.sessionID ? "Đang hủy..." : "Hủy"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-row">
            <span>Hiển thị {meetings.length} kết quả</span>
            <div className="pagination">
              <span>Trang 1</span> 
              <button disabled>{"<"}</button>
              <button disabled>{">"}</button>
            </div>
          </div>
        </main>
      </div>

       {showDetail && detailData && (
        <div className="modal-overlay">
          <div 
            className="modal-detail-form" 
            style={{
                maxWidth: "650px",      
                width: "90%",        
                maxHeight: "90vh",      
                overflowY: "auto",     
                padding: "20px 25px",   
                borderRadius: "10px"    
            }}
          >
            <h3 style={{
                marginBottom: 15, 
                marginTop: 0,
                color: "#1e293b", 
                borderBottom: "1px solid #e2e8f0", 
                paddingBottom: 10,
                fontSize: "18px"        
            }}>
                Chi tiết buổi tư vấn
            </h3>

            <div className="modal-detail-grid" style={{ gap: "15px" }}> {/* Giảm khoảng cách giữa các ô */}
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Chủ đề</label>
                <input value={detailData.topic || ""} readOnly style={{fontSize: "14px", padding: "8px"}} />
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Thời gian</label>
                <input value={detailData.time || ""} readOnly style={{fontSize: "14px", padding: "8px"}}/>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Tutor</label>
                <input value={detailData.tutor || ""} readOnly style={{fontSize: "14px", padding: "8px"}}/>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Hình thức</label>
                <input value={detailData.type || ""} readOnly style={{fontSize: "14px", padding: "8px"}}/>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Số lượng SV</label>
                <input value={detailData.students || 0} readOnly style={{fontSize: "14px", padding: "8px"}}/>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Địa điểm/Link</label>
                <input value={detailData.link || "Chưa cập nhật"} readOnly style={{fontSize: "14px", padding: "8px"}}/>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Trạng thái</label>
                <br/>
                <span
                  style={{
                    background: detailData.statusBg,
                    color: detailData.statusColor,
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    display: "inline-block",
                    marginTop: 5
                  }}
                >
                  {detailData.status}
                </span>
              </div>
              <div>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Tài liệu</label>
                <div style={{marginTop: 5, padding: "8px", background: "#f8fafc", borderRadius: 4, border: "1px dashed #cbd5e1"}}>
                    <FaPaperclip style={{marginRight: 6, verticalAlign: "middle", color: "#64748b"}} />
                    {detailData.document ? (
                        <a href={detailData.document} target="_blank" rel="noopener noreferrer" style={{color: "#2563eb", fontSize: "13px", textDecoration: "underline"}}>
                            Xem tài liệu
                        </a>
                    ) : (
                        <span style={{color: "#999", fontSize: 13}}>Không có tài liệu</span>
                    )}
                </div>
              </div>
            </div>

            <div style={{marginTop: 15}}>
              <label style={{fontSize: "13px", fontWeight: 600, color: "#475569"}}>Nội dung chi tiết</label>
              <textarea 
                value={detailData.content || "Không có nội dung mô tả."} 
                readOnly 
                rows={3} 
                style={{resize: "none", fontSize: "14px", padding: "8px", marginTop: "5px"}} 
              />
            </div>

            <div style={{textAlign: "right", marginTop: 20}}>
                <button 
                    className="modal-submit" 
                    onClick={() => setShowDetail(false)}
                    style={{padding: "8px 20px", fontSize: "14px"}} 
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
export default Meeting;