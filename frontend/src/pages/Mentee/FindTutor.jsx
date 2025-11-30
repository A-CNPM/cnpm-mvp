import { FaCalendarAlt, FaUser, FaClock, FaBook, FaGlobe, FaStar, FaGraduationCap, FaTags, FaInfoCircle, FaFilter, FaCheckCircle, FaTimesCircle, FaEdit, FaRobot, FaPaperPlane, FaSpinner, FaTimes } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../assets/css/style.css";
import SearchService from "../../api/search";
import AvailableSlotService from "../../api/availableSlot";
import ChatbotService from "../../api/chatbot";

function FindTutor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lấy userId ngay từ đầu
  const userId = localStorage.getItem("username") || localStorage.getItem("user_id") || "b.levan";
  
  // --- STATE DỮ LIỆU ---
  const [tutors, setTutors] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- STATE BỘ LỌC ---
  const [showFilters, setShowFilters] = useState(false);
  const [filterKhoa, setFilterKhoa] = useState("");
  const [filterMonHoc, setFilterMonHoc] = useState("");
  const [filterChuyenMon, setFilterChuyenMon] = useState("");
  const [filterThoiGian, setFilterThoiGian] = useState("");
  const [filterMinRating, setFilterMinRating] = useState("");

  // --- STATE MODAL XEM LỊCH RẢNH ---
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tutorSlots, setTutorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  // State Filter cho Modal Lịch Rảnh
  const [scheduleMode, setScheduleMode] = useState("");   // "Online" / "Offline"

  // --- STATE MODAL XEM PROFILE ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tutorProfile, setTutorProfile] = useState(null);

  // --- STATE AI MATCHING CHATBOX ---
  const [showAIChatbox, setShowAIChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConversationId, setChatConversationId] = useState(null);
  const [chatMatchedTutors, setChatMatchedTutors] = useState([]);
  const [chatSuggestions, setChatSuggestions] = useState([]);
  const chatMessagesEndRef = useRef(null);

  // --- API: Lấy danh sách Tutor ---
  const fetchTutors = async () => {
    setLoading(true);
    // Chỉ gửi các field có giá trị (không gửi null hoặc empty string)
    const criteria = {};
    if (keyword && keyword.trim()) {
      criteria.keyword = keyword.trim();
    }
    if (filterKhoa && filterKhoa.trim()) {
      criteria.khoa = filterKhoa.trim();
    }
    if (filterMonHoc && filterMonHoc.trim()) {
      criteria.mon_hoc = filterMonHoc.trim();
    }
    if (filterChuyenMon && filterChuyenMon.trim()) {
      criteria.chuyen_mon = filterChuyenMon.trim();
    }
    if (filterThoiGian && filterThoiGian.trim()) {
      criteria.available_time = filterThoiGian.trim();
    }
    if (filterMinRating && filterMinRating.trim()) {
      criteria.min_rating = parseFloat(filterMinRating);
    }
    
    const data = await SearchService.searchTutors(criteria);
    setTutors(data);
    setLoading(false);
  };
  
  // --- API: AI Matching ---
  const handleAIMatching = () => {
    setShowAIChatbox(!showAIChatbox);
    if (!showAIChatbox && chatMessages.length === 0) {
      // Tin nhắn chào mừng ban đầu
      const welcomeMessage = {
        role: "assistant",
        content: "Xin chào! 👋 Tôi là trợ lý AI của HCMUT_TSS. Tôi có thể giúp bạn tìm tutor phù hợp dựa trên nhu cầu học tập của bạn. Bạn muốn học về lĩnh vực nào?",
        timestamp: new Date().toISOString()
      };
      setChatMessages([welcomeMessage]);
      setChatSuggestions([
        "Tôi muốn học về Web Development",
        "Tôi cần hỗ trợ về Machine Learning",
        "Tôi quan tâm đến Blockchain",
        "Tôi muốn học về Security"
      ]);
    }
  };

  // --- HANDLER: Gửi tin nhắn trong AI Chatbox ---
  const handleSendChatMessage = async (messageText = null) => {
    const textToSend = messageText || chatInput.trim();
    if (!textToSend) return;

    const userMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await ChatbotService.sendMessage(textToSend, userId, chatConversationId);
      
      if (response.conversation_id) {
        setChatConversationId(response.conversation_id);
      }

      const botMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, botMessage]);

      if (response.matched_tutors && response.matched_tutors.length > 0) {
        setChatMatchedTutors(response.matched_tutors);
      }
      if (response.suggestions) {
        setChatSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      const errorMessage = {
        role: "assistant",
        content: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (showAIChatbox) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showAIChatbox]);

  const formatChatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // --- EFFECT: Tự động mở modal lịch dạy khi có query params ---
  useEffect(() => {
    const tutorId = searchParams.get("tutor_id");
    const viewSchedule = searchParams.get("view_schedule");
    
    if (tutorId && viewSchedule === "true" && tutors.length > 0) {
      // Tìm tutor trong danh sách
      const tutor = tutors.find(t => t.tutorID === tutorId);
      if (tutor && !showScheduleModal) {
        setCurrentTutor(tutor);
        setScheduleMode("");
        setTutorSlots([]);
        setMessage("");
        setShowScheduleModal(true);
        // Xóa query params sau khi mở modal
        setSearchParams({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tutors]);

  // --- EFFECT: Tự động tải lịch rảnh khi Modal mở hoặc Filter thay đổi ---
  useEffect(() => {
    const fetchTutorSlots = async () => {
      if (!showScheduleModal || !currentTutor) return;

      setLoadingSlots(true);
      try {
        // Lấy lịch rảnh của tutor (chỉ lấy những cái đang mở đăng ký)
        const data = await AvailableSlotService.getTutorSlots(currentTutor.tutorID, "Mở đăng ký");
        // Lọc theo mode nếu có
        let filtered = data;
        if (scheduleMode) {
          filtered = data.filter(slot => slot.mode === scheduleMode);
        }
        setTutorSlots(filtered);
      } catch (error) {
        console.error("Lỗi lấy lịch rảnh:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTutorSlots();
  }, [showScheduleModal, currentTutor, scheduleMode]);

  // --- HANDLER: Mở Modal Xem lịch rảnh ---
  const handleViewSchedule = (tutor) => {
    setCurrentTutor(tutor);
    setScheduleMode("");
    setTutorSlots([]);
    setMessage("");
    setShowScheduleModal(true);
  };

  // --- HANDLER: Đăng ký lịch rảnh ---
  const handleRegisterSlot = async (slotId) => {
    try {
      setMessage("");
      const result = await AvailableSlotService.registerSlot(slotId, userId);
      if (result.success) {
        setMessage("Đăng ký thành công!");
        setMessageType("success");
        // Reload lịch rảnh
        const data = await AvailableSlotService.getTutorSlots(currentTutor.tutorID, "Mở đăng ký");
        let filtered = data;
        if (scheduleMode) {
          filtered = data.filter(slot => slot.mode === scheduleMode);
        }
        setTutorSlots(filtered);
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      setMessage(error.message || "Đăng ký thất bại");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  // --- HANDLER: Xem Profile ---
  const handleViewProfile = (tutor) => {
    setTutorProfile(tutor); 
    setShowProfileModal(true);
  };

  return (
    <>
      <div className="mentee-dashboard">
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">mentee@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Tìm kiếm và lựa chọn Tutor</h2>
          
          <div className="search-bar-row">
            <div style={{ display: "flex", flex: 1, gap: 10 }}>
              <input 
                className="search-bar" 
                placeholder="Tìm tutor theo tên, chuyên môn..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchTutors();
                  }
                }}
                style={{ 
                  backgroundColor: "#e5e7eb",
                  color: "black",
                  flex: 1
                }}
              />
              <button 
                className="filter-btn" 
                onClick={fetchTutors}
                style={{ 
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap"
                }}
              >
                Tìm kiếm
              </button>
            </div>
            <button 
              className="filter-btn" 
              onClick={() => setShowFilters(!showFilters)}
              style={{ backgroundColor: showFilters ? "#e0e7ff" : "" }}
            >
              <FaFilter style={{marginRight: 5}}/> Bộ lọc
            </button>
            <button 
              className="ai-btn" 
              onClick={handleAIMatching}
              style={{ backgroundColor: showAIChatbox ? "#4f46e5" : "" }}
            >
              AI Matching {showAIChatbox && "✓"}
            </button>
          </div>
          
          {/* BỘ LỌC */}
          {showFilters && (
            <div style={{
              marginBottom: 20,
              marginTop: 10,
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 15
            }}>
              <div>
                <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block"}}>KHOA/BỘ MÔN</label>
                <input
                  type="text"
                  placeholder="VD: Khoa học máy tính"
                  value={filterKhoa}
                  onChange={(e) => setFilterKhoa(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchTutors();
                    }
                  }}
                  style={{width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1"}}
                />
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block"}}>MÔN HỌC</label>
                <input
                  type="text"
                  placeholder="VD: DSA, Web, Python"
                  value={filterMonHoc}
                  onChange={(e) => setFilterMonHoc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchTutors();
                    }
                  }}
                  style={{width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1"}}
                />
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block"}}>CHUYÊN MÔN</label>
                <input
                  type="text"
                  placeholder="VD: Công nghệ phần mềm"
                  value={filterChuyenMon}
                  onChange={(e) => setFilterChuyenMon(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchTutors();
                    }
                  }}
                  style={{width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1"}}
                />
              </div>
              <div>
                <label style={{fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block"}}>ĐÁNH GIÁ TỐI THIỂU</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="VD: 4.0"
                  value={filterMinRating}
                  onChange={(e) => setFilterMinRating(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      fetchTutors();
                    }
                  }}
                  style={{width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #cbd5e1"}}
                />
              </div>
              <div style={{display: "flex", alignItems: "flex-end", gap: 10}}>
                <button
                  onClick={fetchTutors}
                  style={{
                    padding: "8px 20px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}
                >
                  Lọc
                </button>
                <button
                  onClick={() => {
                    setFilterKhoa("");
                    setFilterMonHoc("");
                    setFilterChuyenMon("");
                    setFilterMinRating("");
                    fetchTutors();
                  }}
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

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Danh sách Tutor - Chiếm phần lớn không gian */}
            <div style={{ flex: showAIChatbox ? "1 1 60%" : "1 1 100%" }}>
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
            </div>

            {/* AI Chatbox - Hiển thị một phần bên phải */}
            {showAIChatbox && (
              <div style={{
                flex: "0 0 400px",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                height: "600px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                {/* Header */}
                <div style={{
                  padding: "15px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#4f46e5",
                  color: "#fff",
                  borderRadius: "12px 12px 0 0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FaRobot style={{ fontSize: 20 }} />
                    <span style={{ fontWeight: 600 }}>AI Matching</span>
                  </div>
                  <button
                    onClick={() => setShowAIChatbox(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 20,
                      padding: 0,
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Messages Area */}
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "15px",
                  background: "#f8fafc"
                }}>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: 12
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        maxWidth: "85%",
                        flexDirection: msg.role === "user" ? "row-reverse" : "row"
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: msg.role === "user" ? "#6366f1" : "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {msg.role === "user" ? (
                            <FaUser style={{ color: "#fff", fontSize: 14 }} />
                          ) : (
                            <FaRobot style={{ color: "#fff", fontSize: 14 }} />
                          )}
                        </div>
                        <div style={{
                          background: msg.role === "user" ? "#6366f1" : "#fff",
                          color: msg.role === "user" ? "#fff" : "#1e293b",
                          padding: "10px 14px",
                          borderRadius: 16,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          fontSize: 13,
                          lineHeight: 1.5,
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap"
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginBottom: 12
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <FaRobot style={{ color: "#fff", fontSize: 14 }} />
                        </div>
                        <div style={{
                          background: "#fff",
                          padding: "10px 14px",
                          borderRadius: 16,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 14 }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Matched Tutors */}
                  {chatMatchedTutors.length > 0 && (
                    <div style={{ marginTop: 15 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
                        Tutors phù hợp:
                      </div>
                      {chatMatchedTutors.map((tutor, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewSchedule(tutor);
                          }}
                          style={{
                            padding: 10,
                            background: "#fff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            marginBottom: 8,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                            e.currentTarget.style.borderColor = "#4f46e5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 4 }}>
                            {tutor.full_name}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {tutor.major} • ⭐ {tutor.rating}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {chatSuggestions.length > 0 && (
                    <div style={{ marginTop: 15 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
                        Gợi ý:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {chatSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendChatMessage(suggestion)}
                            style={{
                              padding: "8px 12px",
                              background: "#e0e7ff",
                              color: "#4f46e5",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 12,
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#c7d2fe";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#e0e7ff";
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                  padding: "15px",
                  borderTop: "1px solid #e2e8f0",
                  background: "#fff",
                  borderRadius: "0 0 12px 12px"
                }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      placeholder="Nhập tin nhắn..."
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 20,
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      disabled={chatLoading || !chatInput.trim()}
                      style={{
                        padding: "10px 16px",
                        background: chatLoading || !chatInput.trim() ? "#cbd5e1" : "#4f46e5",
                        color: "#fff",
                        border: "none",
                        borderRadius: 20,
                        cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FaPaperPlane style={{ fontSize: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            )}
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

      {/* --- MODAL 2: XEM LỊCH RẢNH --- */}
      {showScheduleModal && currentTutor && (
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
                   Lịch rảnh: {currentTutor.full_name}
                </h3>
                <button 
                    onClick={() => {
                      setShowScheduleModal(false);
                      setCurrentTutor(null);
                      setMessage("");
                    }}
                    style={{background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666"}}
                >
                    &times;
                </button>
            </div>

            {/* Thông báo */}
            {message && (
              <div style={{
                marginBottom: 15,
                padding: 12,
                borderRadius: 8,
                background: messageType === "success" ? "#d1fae5" : "#fee2e2",
                color: messageType === "success" ? "#065f46" : "#991b1b",
                fontSize: 14
              }}>
                {message}
              </div>
            )}

            {/* --- KHU VỰC FILTER TRONG MODAL --- */}
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
            </div>
            
            {/* DANH SÁCH LỊCH RẢNH */}
            {loadingSlots ? (
                <p style={{textAlign: "center"}}>Đang tải dữ liệu...</p>
            ) : tutorSlots.length === 0 ? (
                <div style={{textAlign: "center", color: "#64748b", padding: 20, background: "#f8fafc", borderRadius: 8}}>
                    <FaCalendarAlt style={{fontSize: 24, marginBottom: 5, color: "#94a3b8"}}/>
                    <p>Không có lịch rảnh nào đang mở đăng ký.</p>
                </div>
            ) : (
                <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    {tutorSlots.map((slot) => {
                      const isRegistered = slot.registered_participants?.includes(userId);
                      const currentCount = slot.registered_participants?.length || 0;
                      const isFull = currentCount >= slot.max_participants;
                      
                      return (
                        <div key={slot.slot_id} style={{
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
                                    {slot.topic || "Buổi tư vấn"}
                                </strong>
                                <span style={{
                                    fontSize: "12px", 
                                    padding: "4px 8px", 
                                    borderRadius: "4px", 
                                    background: "#e6fcf7",
                                    color: "#0d9488",
                                    fontWeight: "bold"
                                }}>
                                    {slot.status}
                                </span>
                            </div>

                            <div style={{display: "flex", gap: "20px", fontSize: "14px", color: "#475569", flexWrap: "wrap"}}>
                                <span><FaClock style={{marginRight: 5}}/> {slot.start_time} - {slot.end_time}</span>
                                <span><FaGlobe style={{marginRight: 5}}/> {slot.mode}</span>
                                <span style={{color: isFull ? "#ef4444" : "#10b981"}}>
                                  Đã đăng ký: {currentCount}/{slot.max_participants}
                                </span>
                            </div>
                            
                            {slot.location && (
                              <div style={{fontSize: "13px", color: "#64748b"}}>
                                <FaGlobe style={{marginRight: 5}}/> {slot.location}
                              </div>
                            )}

                            {isRegistered && (
                              <div style={{padding: 8, background: "#d1fae5", borderRadius: 6, fontSize: 13, color: "#065f46"}}>
                                <FaCheckCircle style={{marginRight: 5}}/> Bạn đã đăng ký lịch này
                              </div>
                            )}

                            <div style={{display: "flex", gap: 10, marginTop: 5}}>
                              {!isRegistered && !isFull && (
                                <button
                                  onClick={() => handleRegisterSlot(slot.slot_id)}
                                  style={{
                                    padding: "8px 16px",
                                    background: "#4f46e5",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  Đăng ký
                                </button>
                              )}
                            </div>
                        </div>
                      );
                    })}
                </div>
            )}
            
            <div style={{textAlign: "right", marginTop: 20}}>
                <button 
                    className="modal-submit" 
                    onClick={() => {
                      setShowScheduleModal(false);
                      setCurrentTutor(null);
                      setMessage("");
                    }}
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