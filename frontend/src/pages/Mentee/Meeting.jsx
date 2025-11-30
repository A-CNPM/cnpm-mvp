import { FaUser, FaBook, FaGlobe, FaCalendar, FaPaperclip, FaFilter, FaCheckCircle, FaTimesCircle, FaEdit, FaChartLine, FaArrowUp, FaArrowDown, FaExclamationTriangle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import SearchService from "../../api/search";
import SessionService from "../../api/session";
import AvailableSlotService from "../../api/availableSlot";
import ProgressTrackingService from "../../api/progressTracking"; 

function Meeting() {
  const navigate = useNavigate();
  // --- STATE QUẢN LÝ UI ---
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionResources, setSessionResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [sessionProgressTrackings, setSessionProgressTrackings] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loadingPendingChanges, setLoadingPendingChanges] = useState(false);
  
  // --- STATE DỮ LIỆU ---
  const [meetings, setMeetings] = useState([]);
  const [registeredSlots, setRegisteredSlots] = useState([]); // Danh sách lịch rảnh đã đăng ký
  const [myRegisteredSessions, setMyRegisteredSessions] = useState([]); // Danh sách session đã đăng ký
  const [activeTab, setActiveTab] = useState("slots"); // "slots" hoặc "sessions"
  const menteeId = localStorage.getItem("username") || "a.nguyen";
  const [showChangeSlotModal, setShowChangeSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlotsForChange, setAvailableSlotsForChange] = useState([]);

  // --- STATE TÌM KIẾM & BỘ LỌC ---
  const [keyword, setKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Ẩn/hiện menu lọc
  const [filterMode, setFilterMode] = useState("");      // Giá trị: "", "Online", "Offline"
  const [filterStatus, setFilterStatus] = useState("");  // Giá trị: "", "Sắp diễn ra", ...

  // --- HÀM HELPER: MÀU SẮC TRẠNG THÁI ---
  const getStatusStyles = (status) => {
    switch (status) {
      case "Hoàn thành":
      case "Đã kết thúc":
        return { color: "#2dd4bf", bg: "#e6fcf7" }; // Xanh ngọc
      case "Đã hủy":
        return { color: "#f87171", bg: "#fff1f2" }; // Đỏ
      case "Sắp diễn ra":
      case "Đang mở đăng ký":
      default:
        return { color: "#a78bfa", bg: "#f3f0ff" }; // Tím
    }
  };

  // --- HÀM GỌI API ---
  const fetchSessions = async () => {
    setLoading(true);
    try {
      // 1. Tạo tiêu chí tìm kiếm từ State
      const criteria = {
        keyword: keyword,
        mode: filterMode || null,     // Nếu rỗng thì gửi null
        status: filterStatus || null  // Nếu rỗng thì gửi null
      };

      console.log("Calling API with:", criteria);

      // 2. Gọi Service
      const data = await SearchService.searchSessions(criteria);

      // 3. Map dữ liệu từ Backend -> Frontend và lọc bỏ các session đã hoàn thành
      const formattedData = data
        .filter((item) => {
          // Lọc bỏ các session đã hoàn thành (chỉ hiển thị ở trang đánh giá)
          return item.status !== "Hoàn thành" && item.status !== "Đã kết thúc";
        })
        .map((item) => {
          const styles = getStatusStyles(item.status);
          return {
              ...item, // Giữ lại các trường gốc
              
              // Map các trường hiển thị UI
              topic: item.topic,
              tutor: item.tutor, // Backend trả về ID
              type: item.mode,     // UI dùng 'type', BE trả 'mode'
              time: (item.startTime || "") + " - " + (item.endTime || ""),
              startTime: item.startTime, // Lưu lại để kiểm tra hủy
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

  // --- EFFECT: Lấy danh sách lịch rảnh và session đã đăng ký ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slots, sessions] = await Promise.all([
          AvailableSlotService.getUserRegisteredSlots(menteeId),
          SessionService.getUserSessions(menteeId)
        ]);
        setRegisteredSlots(slots);
        setMyRegisteredSessions(sessions.map(s => s.sessionID));
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
    
    // Tự động refresh mỗi 10 giây để kiểm tra slot đã chuyển thành session chưa
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Refresh mỗi 10 giây
    
    return () => clearInterval(interval);
  }, [menteeId]);

  // --- EFFECT: Chạy khi vào trang hoặc khi thay đổi bộ lọc ---
  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, filterStatus]); // Tự động load lại khi chọn Filter

  // --- HANDLERS ---
  const handleShowDetail = async (meeting) => {
    setDetailData(meeting);
    setShowDetail(true);
    // Lấy danh sách tài liệu của session
    if (meeting.sessionID) {
      setLoadingResources(true);
      try {
        const resources = await SessionService.getSessionResources(meeting.sessionID);
        setSessionResources(resources || []);
      } catch (error) {
        console.error("Lỗi khi lấy tài liệu:", error);
        setSessionResources([]);
      } finally {
        setLoadingResources(false);
      }
      
      // Lấy ghi nhận tiến bộ của session
      setLoadingProgress(true);
      try {
        const progressTrackings = await ProgressTrackingService.getSessionProgressTrackings(meeting.sessionID);
        // Lọc chỉ lấy progress tracking của mentee hiện tại
        const menteeProgressTrackings = progressTrackings.filter(
          tracking => tracking.mentee_id === menteeId
        );
        setSessionProgressTrackings(menteeProgressTrackings || []);
      } catch (error) {
        console.error("Lỗi khi lấy ghi nhận tiến bộ:", error);
        setSessionProgressTrackings([]);
      } finally {
        setLoadingProgress(false);
      }
      
      // Lấy pending changes của session
      setLoadingPendingChanges(true);
      try {
        const sessionDetails = await SessionService.getSessionDetail(meeting.sessionID);
        console.log("Session details:", sessionDetails);
        if (sessionDetails && sessionDetails.session) {
          console.log("Session pending_changes:", sessionDetails.session.pending_changes);
          if (sessionDetails.session.pending_changes) {
            // Lọc chỉ lấy pending changes mà mentee chưa phản hồi
            const pending = Object.values(sessionDetails.session.pending_changes).filter(change => {
              return change.status === "pending" && 
                     (!change.responses || !change.responses[menteeId]);
            });
            console.log("Filtered pending changes:", pending);
            setPendingChanges(pending);
          } else {
            setPendingChanges([]);
          }
        } else {
          setPendingChanges([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy pending changes:", error);
        setPendingChanges([]);
      } finally {
        setLoadingPendingChanges(false);
      }
    } else {
      setSessionResources([]);
      setSessionProgressTrackings([]);
      setPendingChanges([]);
    }
  };
  
  // Handler phản hồi thay đổi session
  const handleRespondToChange = async (changeRequestId, response) => {
    try {
      setMessage("");
      const result = await SessionService.respondToSessionChange(changeRequestId, menteeId, response);
      if (result.success) {
        setMessage(response === "accept" ? "Đã đồng ý thay đổi" : "Đã từ chối thay đổi");
        // Reload pending changes và session details
        if (detailData && detailData.sessionID) {
          setLoadingPendingChanges(true);
          try {
            const sessionDetails = await SessionService.getSessionDetail(detailData.sessionID);
            console.log("Reloaded session details:", sessionDetails);
            if (sessionDetails && sessionDetails.session) {
              // Cập nhật detailData với thông tin mới (nếu có thay đổi)
              if (result.session) {
                setDetailData({
                  ...detailData,
                  ...result.session,
                  time: result.session.startTime + " - " + result.session.endTime,
                  link: result.session.location
                });
              }
              // Reload pending changes
              if (sessionDetails.session.pending_changes) {
                const pending = Object.values(sessionDetails.session.pending_changes).filter(change => {
                  return change.status === "pending" && 
                         (!change.responses || !change.responses[menteeId]);
                });
                console.log("Reloaded pending changes:", pending);
                setPendingChanges(pending);
              } else {
                setPendingChanges([]);
              }
            }
          } catch (error) {
            console.error("Lỗi khi reload pending changes:", error);
          } finally {
            setLoadingPendingChanges(false);
          }
        }
        // Đóng thông báo sau 2s
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi khi phản hồi thay đổi:", error);
      setMessage(error.message || "Phản hồi thất bại");
    }
  };

  const handleSearch = () => {
    fetchSessions();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchSessions();
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // --- HANDLER: Đăng ký session ---
  const handleRegister = async (sessionId) => {
    try {
      setMessage("");
      const result = await SessionService.registerSession(sessionId, menteeId);
      if (result.success) {
        setMessage("Đăng ký thành công!");
        // Cập nhật danh sách đã đăng ký
        setMyRegisteredSessions([...myRegisteredSessions, sessionId]);
        // Reload danh sách
        fetchSessions();
        // Đóng modal sau 1.5s
        setTimeout(() => {
          setShowDetail(false);
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage(error.message || "Đăng ký thất bại");
    }
  };
  
  // --- HANDLER: Hủy đăng ký session ---
  const handleCancel = async (sessionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký buổi tư vấn này?")) {
      return;
    }
    
    try {
      setMessage("");
      const result = await SessionService.cancelSession(sessionId, menteeId);
      if (result.success) {
        setMessage("Hủy đăng ký thành công!");
        // Cập nhật danh sách đã đăng ký
        setMyRegisteredSessions(myRegisteredSessions.filter(id => id !== sessionId));
        // Reload danh sách
        fetchSessions();
        // Đóng modal sau 1.5s
        setTimeout(() => {
          setShowDetail(false);
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage(error.message || "Hủy đăng ký thất bại");
    }
  };
  
  // --- HANDLER: Hủy đăng ký lịch rảnh ---
  const handleCancelSlot = async (slotId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký lịch rảnh này?")) {
      return;
    }
    
    try {
      setMessage("");
      const result = await AvailableSlotService.cancelSlotRegistration(slotId, menteeId);
      if (result.success) {
        setMessage("Hủy đăng ký thành công!");
        // Reload danh sách lịch rảnh
        const slots = await AvailableSlotService.getUserRegisteredSlots(menteeId);
        setRegisteredSlots(slots);
        // Đóng thông báo sau 1.5s
        setTimeout(() => {
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage(error.message || "Hủy đăng ký thất bại");
    }
  };

  // --- HANDLER: Mở modal đổi lịch rảnh ---
  const handleOpenChangeSlotModal = async (slot) => {
    // Chuyển hướng đến trang FindTutor với tutor_id để hiển thị lịch dạy
    navigate(`/mentee/find-tutor?tutor_id=${slot.tutor_id}&view_schedule=true`);
  };

  // --- HANDLER: Đổi lịch rảnh ---
  const handleChangeSlot = async (newSlotId) => {
    if (!selectedSlot) return;
    
    try {
      setMessage("");
      const result = await AvailableSlotService.changeSlot(selectedSlot.slot_id, newSlotId, menteeId);
      if (result.success) {
        setMessage("Đổi lịch thành công!");
        // Reload danh sách lịch rảnh
        const slots = await AvailableSlotService.getUserRegisteredSlots(menteeId);
        setRegisteredSlots(slots);
        // Đóng modal sau 1.5s
        setTimeout(() => {
          setShowChangeSlotModal(false);
          setSelectedSlot(null);
          setAvailableSlotsForChange([]);
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage(error.message || "Đổi lịch thất bại");
    }
  };

  // --- HELPER: Kiểm tra đã đăng ký chưa ---
  const isRegistered = (sessionId) => {
    return myRegisteredSessions.includes(sessionId);
  };

  // --- HELPER: Kiểm tra có thể hủy/đổi lịch rảnh không (trong vòng 30 giây sau khi đăng ký) ---
  const canCancelOrChangeSlot = (slot) => {
    // Nếu đã chuyển thành session thì không thể hủy/đổi
    if (slot.status === "Đã chuyển thành session") {
      return false;
    }
    
    // Nếu không có thời gian đăng ký thì cho phép (trường hợp cũ)
    if (!slot.registered_at) {
      return true;
    }
    
    try {
      const registeredAt = new Date(slot.registered_at);
      const now = new Date();
      const diffSeconds = (now - registeredAt) / 1000;
      // Trong vòng 30 giây sau khi đăng ký vẫn có thể hủy/đổi
      return diffSeconds <= 30;
    } catch {
      return true;
    }
  };

  // --- HELPER: Kiểm tra có thể hủy không (12h trước) ---
  const canCancel = (startTime) => {
    if (!startTime) return true; // Nếu không có thời gian thì cho phép hủy
    
    // Parse thời gian từ format "01/11/2025 12:00"
    try {
      const [datePart, timePart] = startTime.split(" ");
      if (!datePart || !timePart) return true;
      
      const [day, month, year] = datePart.split("/");
      if (!day || !month || !year) return true;
      
      const sessionDate = new Date(`${year}-${month}-${day}T${timePart}:00`);
      const now = new Date();
      const diffHours = (sessionDate - now) / (1000 * 60 * 60);
      return diffHours > 12;
    } catch {
      return true; // Nếu không parse được thì cho phép hủy
    }
  };

  // --- HANDLER: Download tài liệu ---
  const handleDownloadResource = async (sessionId, resourceId) => {
    try {
      await SessionService.downloadResource(sessionId, resourceId);
    } catch (error) {
      setMessage("Không thể tải xuống tài liệu");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- HELPER: Lấy icon theo loại tài liệu ---
  const getResourceIcon = (type) => {
    switch (type) {
      case "Document":
        return <FaPaperclip style={{ color: "#ef4444" }} />;
      case "Video":
        return <FaBook style={{ color: "#3b82f6" }} />;
      case "Link":
        return <FaGlobe style={{ color: "#10b981" }} />;
      default:
        return <FaPaperclip style={{ color: "#64748b" }} />;
    }
  };

  return (
    <>
      <div className="mentee-dashboard">
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">mentee@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Buổi tư vấn</h2>

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            borderBottom: "2px solid #e2e8f0"
          }}>
            <button
              onClick={() => setActiveTab("slots")}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === "slots" ? "2px solid #4f46e5" : "2px solid transparent",
                color: activeTab === "slots" ? "#4f46e5" : "#64748b",
                fontWeight: activeTab === "slots" ? 600 : 400,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Lịch rảnh đã đăng ký ({registeredSlots.length})
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === "sessions" ? "2px solid #4f46e5" : "2px solid transparent",
                color: activeTab === "sessions" ? "#4f46e5" : "#64748b",
                fontWeight: activeTab === "sessions" ? 600 : 400,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Buổi tư vấn ({meetings.length})
            </button>
          </div>

          {/* Thông báo */}
          {message && (
            <div style={{
              marginBottom: 20,
              padding: 12,
              borderRadius: 8,
              background: message.includes("thành công") ? "#d1fae5" : "#fee2e2",
              color: message.includes("thành công") ? "#065f46" : "#991b1b",
              fontSize: 14
            }}>
              {message}
            </div>
          )}
          
          {/* Tab: Lịch rảnh đã đăng ký */}
          {activeTab === "slots" && (
            <div>
              {registeredSlots.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: 40,
                  background: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0"
                }}>
                  <p style={{ color: "#64748b", fontSize: 16 }}>
                    Bạn chưa đăng ký lịch rảnh nào.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {registeredSlots.map((slot) => {
                    const canCancel = canCancelOrChangeSlot(slot.start_time);
                    const currentCount = slot.registered_participants?.length || 0;
                    
                    return (
                      <div
                        key={slot.slot_id}
                        style={{
                          background: "#fff",
                          padding: 20,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                              <FaBook style={{ color: "#4f46e5" }} />
                              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
                                {slot.topic || "Buổi tư vấn"}
                              </h3>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 28 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                                <FaUser style={{ color: "#6366f1" }} />
                                <span>Tutor: <strong>{slot.tutor_name}</strong></span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                                <FaCalendar style={{ color: "#6366f1" }} />
                                <span>{slot.start_time} - {slot.end_time}</span>
                              </div>
                              <div style={{ fontSize: 14, color: "#64748b" }}>
                                Hình thức: <strong>{slot.mode}</strong>
                              </div>
                              <div style={{ fontSize: 14, color: "#64748b" }}>
                                Đã đăng ký: <strong>{currentCount}/{slot.max_participants}</strong>
                              </div>
                              {/* Không hiển thị slot đã chuyển thành session (đã được lọc bỏ ở backend) */}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            {/* Chỉ hiển thị nút hủy/đổi khi status là "Mở đăng ký" (chưa chuyển thành session) */}
                            {slot.status === "Mở đăng ký" && canCancelOrChangeSlot(slot) && (
                              <>
                                <button
                                  onClick={() => handleOpenChangeSlotModal(slot)}
                                  style={{
                                    padding: "8px 16px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  <FaEdit style={{ marginRight: 5 }} /> Đổi lịch
                                </button>
                                <button
                                  onClick={() => handleCancelSlot(slot.slot_id)}
                                  style={{
                                    padding: "8px 16px",
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  <FaTimesCircle style={{ marginRight: 5 }} /> Hủy
                                </button>
                              </>
                            )}
                            {/* Khi đã quá 30 giây sau khi đăng ký nhưng vẫn là "Mở đăng ký" */}
                            {slot.status === "Mở đăng ký" && !canCancelOrChangeSlot(slot) && (
                              <div style={{
                                padding: "8px 12px",
                                background: "#fef3c7",
                                color: "#92400e",
                                borderRadius: 6,
                                fontSize: 12
                              }}>
                                Không thể hủy/đổi (đã quá 30 giây sau khi đăng ký)
                              </div>
                            )}
                            {/* Khi đã chuyển thành session - không có quyền hủy/đổi */}
                            {slot.status === "Đã chuyển thành session" && (
                              <div style={{
                                padding: "8px 12px",
                                background: "#dbeafe",
                                color: "#1e40af",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600
                              }}>
                                Đã chuyển thành buổi tư vấn - Không thể hủy/đổi
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Buổi tư vấn (Session) */}
          {activeTab === "sessions" && (
            <>
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
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                    <p style={{fontSize: 10, color: "#94a3b8", marginTop: 4, marginBottom: 0}}>
                      * Buổi đã hoàn thành xem ở trang Đánh giá
                    </p>
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

            {!loading && meetings.map((meeting, idx) => {
              const registered = isRegistered(meeting.sessionID);
              return (
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
                    {registered && (
                      <div style={{color: "#10b981", fontSize: "14px", marginTop: 4, display: "flex", alignItems: "center", gap: 5}}>
                        <FaCheckCircle /> Đã đăng ký
                      </div>
                    )}
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
              );
            })}
          </div>

          <div className="pagination-row">
            <span>Hiển thị {meetings.length} kết quả</span>
            <div className="pagination">
              <span>Trang 1</span> 
              <button disabled>{"<"}</button>
              <button disabled>{">"}</button>
            </div>
          </div>
            </>
          )}
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
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: 8, display: "block"}}>Tài liệu đính kèm</label>
                {loadingResources ? (
                  <div style={{padding: 12, textAlign: "center", color: "#64748b", fontSize: 13}}>
                    Đang tải danh sách tài liệu...
                  </div>
                ) : sessionResources.length === 0 ? (
                  <div style={{padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", textAlign: "center"}}>
                    <span style={{color: "#94a3b8", fontSize: 13}}>Chưa có tài liệu nào được đính kèm</span>
                  </div>
                ) : (
                  <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                    {sessionResources.map((resource) => (
                      <div
                        key={resource.resourceID}
                        style={{
                          padding: 12,
                          background: "#f8fafc",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12
                        }}
                      >
                        <div style={{display: "flex", alignItems: "center", gap: 10, flex: 1}}>
                          <div style={{fontSize: 18}}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div style={{flex: 1}}>
                            <div style={{fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2}}>
                              {resource.title}
                            </div>
                            {resource.description && (
                              <div style={{fontSize: 12, color: "#64748b"}}>
                                {resource.description}
                              </div>
                            )}
                            <div style={{fontSize: 11, color: "#94a3b8", marginTop: 4}}>
                              Loại: {resource.type} • {resource.uploadDate}
                            </div>
                          </div>
                        </div>
                        <div style={{display: "flex", gap: 8}}>
                          {resource.url && (
                            <button
                              onClick={() => window.open(resource.url, '_blank')}
                              style={{
                                padding: "6px 12px",
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                fontSize: 12,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <FaGlobe style={{fontSize: 10}} /> Truy cập
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadResource(detailData.sessionID, resource.resourceID)}
                            style={{
                              padding: "6px 12px",
                              background: "#10b981",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            <FaPaperclip style={{fontSize: 10}} /> Tải xuống
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pending Changes - Yêu cầu thay đổi từ Tutor */}
              {detailData.sessionID && (
                <div style={{ gridColumn: "1 / -1", marginTop: 15 }}>
                  <label style={{fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: 8, display: "block"}}>
                    Yêu cầu thay đổi từ Tutor
                  </label>
                  {loadingPendingChanges ? (
                    <div style={{padding: 12, textAlign: "center", color: "#64748b", fontSize: 13}}>
                      Đang tải yêu cầu thay đổi...
                    </div>
                  ) : pendingChanges.length === 0 ? (
                    <div style={{padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", textAlign: "center"}}>
                      <span style={{color: "#94a3b8", fontSize: 13}}>Không có yêu cầu thay đổi nào</span>
                    </div>
                  ) : (
                    <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                      {pendingChanges.map((change) => (
                        <div
                          key={change.change_request_id}
                          style={{
                            padding: 16,
                            background: "#fef3c7",
                            borderRadius: 8,
                            border: "1px solid #fbbf24"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <FaExclamationTriangle style={{ color: "#f59e0b" }} />
                            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                              {change.type === "cancel" ? "Yêu cầu hủy buổi tư vấn" : "Yêu cầu đổi lịch buổi tư vấn"}
                            </span>
                          </div>
                          
                          {change.type === "reschedule" && change.old_data && change.new_data && (
                            <div style={{ marginBottom: 12, fontSize: 13, color: "#374151" }}>
                              <div style={{ marginBottom: 6 }}>
                                <strong>Thời gian cũ:</strong> {change.old_data.startTime} - {change.old_data.endTime}
                              </div>
                              <div style={{ marginBottom: 6 }}>
                                <strong>Thời gian mới:</strong> {change.new_data.startTime} - {change.new_data.endTime}
                              </div>
                              {change.old_data.location !== change.new_data.location && (
                                <div style={{ marginBottom: 6 }}>
                                  <strong>Địa điểm mới:</strong> {change.new_data.location || change.old_data.location}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {change.reason && (
                            <div style={{ marginBottom: 12, fontSize: 13, color: "#374151", fontStyle: "italic" }}>
                              <strong>Lý do:</strong> {change.reason}
                            </div>
                          )}
                          
                          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
                            Thời gian: {new Date(change.created_at).toLocaleString("vi-VN")}
                          </div>
                          
                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleRespondToChange(change.change_request_id, "reject")}
                              style={{
                                padding: "8px 16px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: "pointer",
                                fontWeight: 500
                              }}
                            >
                              <FaTimesCircle style={{ marginRight: 6 }} />
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleRespondToChange(change.change_request_id, "accept")}
                              style={{
                                padding: "8px 16px",
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: "pointer",
                                fontWeight: 500
                              }}
                            >
                              <FaCheckCircle style={{ marginRight: 6 }} />
                              Đồng ý
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Ghi nhận tiến bộ từ Tutor */}
              {detailData.sessionID && (
                <div style={{ gridColumn: "1 / -1", marginTop: 15 }}>
                  <label style={{fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: 8, display: "block"}}>
                    Ghi nhận tiến bộ từ Tutor
                  </label>
                  {loadingProgress ? (
                    <div style={{padding: 12, textAlign: "center", color: "#64748b", fontSize: 13}}>
                      Đang tải ghi nhận tiến bộ...
                    </div>
                  ) : sessionProgressTrackings.length === 0 ? (
                    <div style={{padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", textAlign: "center"}}>
                      <span style={{color: "#94a3b8", fontSize: 13}}>Chưa có ghi nhận tiến bộ nào từ Tutor cho buổi tư vấn này</span>
                    </div>
                  ) : (
                    <div style={{display: "flex", flexDirection: "column", gap: 10}}>
                      {sessionProgressTrackings.map((tracking, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 12,
                            background: tracking.progress_type === "progress" ? "#d1fae5" : "#fee2e2",
                            borderRadius: 8,
                            border: `1px solid ${tracking.progress_type === "progress" ? "#10b981" : "#ef4444"}`
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            {tracking.progress_type === "progress" ? (
                              <FaArrowUp style={{ color: "#10b981" }} />
                            ) : (
                              <FaArrowDown style={{ color: "#ef4444" }} />
                            )}
                            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                              {tracking.progress_type === "progress" ? "Tiến bộ" : "Hạn chế"}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "#374151", marginBottom: 8, lineHeight: 1.5 }}>
                            {tracking.content}
                          </div>
                          {tracking.tutor_name && (
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              <strong>Tutor:</strong> {tracking.tutor_name}
                            </div>
                          )}
                          {tracking.created_at && (
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                              {new Date(tracking.created_at).toLocaleString("vi-VN")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

            {message && (
              <div style={{
                marginTop: 15,
                padding: 12,
                borderRadius: 8,
                background: message.includes("thành công") ? "#d1fae5" : "#fee2e2",
                color: message.includes("thành công") ? "#065f46" : "#991b1b",
                fontSize: 14,
                textAlign: "center"
              }}>
                {message}
              </div>
            )}
            
            <div style={{textAlign: "right", marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end"}}>
                  {detailData && isRegistered(detailData.sessionID) ? (
                <>
                  {/* Session đã chuyển từ slot (sau 30 giây), không cho phép hủy/thay đổi */}
                  <div style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    color: "#64748b",
                    background: "#f1f5f9",
                    borderRadius: 6
                  }}>
                    Buổi tư vấn đã được xác nhận, không thể hủy hoặc thay đổi
                  </div>
                </>
              ) : (
                detailData && detailData.status !== "Đã hủy" && detailData.status !== "Hoàn thành" && (
                  <button 
                    className="modal-submit" 
                    onClick={() => handleRegister(detailData.sessionID)}
                    style={{
                      padding: "8px 20px", 
                      fontSize: "14px",
                      background: "#10b981",
                      color: "#fff"
                    }} 
                  >
                    <FaCheckCircle style={{marginRight: 5}}/> Đăng ký tham gia
                  </button>
                )
              )}
              <button 
                className="modal-submit" 
                onClick={() => {
                  setShowDetail(false);
                  setMessage("");
                  setSessionResources([]);
                  setSessionProgressTrackings([]);
                }}
                style={{padding: "8px 20px", fontSize: "14px"}} 
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đổi lịch rảnh */}
      {showChangeSlotModal && selectedSlot && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: 25,
            borderRadius: 12,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b" }}>
              Đổi lịch rảnh
            </h3>
            
            <div style={{ marginBottom: 20, padding: 15, background: "#f8fafc", borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Lịch hiện tại:</strong> {selectedSlot.topic || "Buổi tư vấn"}
              </div>
              <div>
                <strong>Thời gian:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Chọn lịch mới:
              </label>
              {availableSlotsForChange.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 14 }}>Không có lịch rảnh nào khả dụng để đổi.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {availableSlotsForChange.map((slot) => (
                    <div
                      key={slot.slot_id}
                      onClick={() => handleChangeSlot(slot.slot_id)}
                      style={{
                        padding: 15,
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "#fff",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
                      onMouseLeave={(e) => e.target.style.background = "#fff"}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 5 }}>
                        {slot.topic || "Buổi tư vấn"}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {slot.start_time} - {slot.end_time} | {slot.mode} | Đã đăng ký: {slot.registered_participants?.length || 0}/{slot.max_participants}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowChangeSlotModal(false);
                  setSelectedSlot(null);
                  setAvailableSlotsForChange([]);
                }}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Meeting;