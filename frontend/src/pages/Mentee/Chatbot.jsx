import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import MenteeSidebar from "../../components/MenteeSidebar";
import ChatbotService from "../../api/chatbot";
import AvailableSlotService from "../../api/availableSlot";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaClock, FaGlobe, FaBook, FaCheckCircle } from "react-icons/fa";

function Chatbot() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [matchedTutors, setMatchedTutors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // State cho modal lịch rảnh
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);
  const [tutorSlots, setTutorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduleMode, setScheduleMode] = useState("");
  const [slotMessage, setSlotMessage] = useState("");
  const [slotMessageType, setSlotMessageType] = useState("");

  useEffect(() => {
    // Tin nhắn chào mừng ban đầu
    const welcomeMessage = {
      role: "assistant",
      content: "Xin chào! 👋 Tôi là trợ lý AI của HCMUT_TSS. Tôi có thể giúp bạn tìm tutor phù hợp dựa trên nhu cầu học tập của bạn. Bạn muốn học về lĩnh vực nào?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setSuggestions([
      "Tôi muốn học về Web Development",
      "Tôi cần hỗ trợ về Machine Learning",
      "Tôi quan tâm đến Blockchain",
      "Tôi muốn học về Security"
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Thêm tin nhắn của user
    const userMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await ChatbotService.sendMessage(textToSend, userId, conversationId);
      
      // Cập nhật conversation ID
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Thêm phản hồi của bot
      const botMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);

      // Cập nhật matched tutors và suggestions
      if (response.matched_tutors && response.matched_tutors.length > 0) {
        setMatchedTutors(response.matched_tutors);
      }
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      const errorMessage = {
        role: "assistant",
        content: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleTutorClick = (e, tutor) => {
    e.preventDefault();
    e.stopPropagation();
    // Mở modal lịch rảnh
    setCurrentTutor(tutor);
    setScheduleMode("");
    setTutorSlots([]);
    setSlotMessage("");
    setShowScheduleModal(true);
  };

  // Load lịch rảnh khi modal mở
  useEffect(() => {
    const fetchTutorSlots = async () => {
      if (!showScheduleModal || !currentTutor) return;

      setLoadingSlots(true);
      try {
        const data = await AvailableSlotService.getTutorSlots(currentTutor.tutorID, "Mở đăng ký");
        let filtered = data;
        if (scheduleMode) {
          filtered = data.filter(slot => slot.mode === scheduleMode);
        }
        setTutorSlots(filtered);
      } catch (error) {
        console.error("Lỗi khi tải lịch rảnh:", error);
        setSlotMessage("Không thể tải lịch rảnh");
        setSlotMessageType("error");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTutorSlots();
  }, [showScheduleModal, currentTutor, scheduleMode]);

  // Handler đăng ký lịch rảnh
  const handleRegisterSlot = async (slotId) => {
    try {
      setSlotMessage("");
      const result = await AvailableSlotService.registerSlot(slotId, userId);
      if (result.success) {
        setSlotMessage("Đăng ký thành công!");
        setSlotMessageType("success");
        // Reload lịch rảnh
        const data = await AvailableSlotService.getTutorSlots(currentTutor.tutorID, "Mở đăng ký");
        let filtered = data;
        if (scheduleMode) {
          filtered = data.filter(slot => slot.mode === scheduleMode);
        }
        setTutorSlots(filtered);
        setTimeout(() => {
          setSlotMessage("");
        }, 3000);
      } else {
        setSlotMessage(result.message || "Đăng ký thất bại");
        setSlotMessageType("error");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      setSlotMessage("Đã xảy ra lỗi khi đăng ký");
      setSlotMessageType("error");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="mentee-dashboard">
      <MenteeSidebar activeItem="chatbot" />
      <main className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div className="mentee-header" style={{ marginBottom: 0 }}>
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">{userId}@hcmut.edu.vn</div>
        </div>
        
        <h2 className="main-title" style={{ marginBottom: 20 }}>AI Matching - Chatbot</h2>

        {/* Chat Container */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          marginBottom: 20
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            background: "#f8fafc"
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  maxWidth: "70%",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row"
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: msg.role === "user" ? "#6366f1" : "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {msg.role === "user" ? (
                      <FaUser style={{ color: "#fff", fontSize: 18 }} />
                    ) : (
                      <FaRobot style={{ color: "#fff", fontSize: 18 }} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    background: msg.role === "user" ? "#6366f1" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1e293b",
                    padding: "12px 16px",
                    borderRadius: 18,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap"
                  }}>
                    <div style={{ marginBottom: 4 }}>{msg.content}</div>
                    <div style={{
                      fontSize: 11,
                      opacity: 0.7,
                      marginTop: 4
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 16
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaRobot style={{ color: "#fff", fontSize: 18 }} />
                  </div>
                  <div style={{
                    background: "#fff",
                    padding: "12px 16px",
                    borderRadius: 18,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 16 }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid #e2e8f0",
              background: "#fff"
            }}>
              <div style={{
                fontSize: 12,
                color: "#64748b",
                marginBottom: 8
              }}>
                Gợi ý:
              </div>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8
              }}>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: "6px 12px",
                      background: "#e0e7ff",
                      color: "#6366f1",
                      border: "none",
                      borderRadius: 16,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#c7d2fe";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#e0e7ff";
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            background: "#fff",
            display: "flex",
            gap: 12
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: 24,
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: inputMessage.trim() && !loading ? "#6366f1" : "#cbd5e1",
                color: "#fff",
                border: "none",
                cursor: inputMessage.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim() && !loading) {
                  e.target.style.background = "#4f46e5";
                  e.target.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (inputMessage.trim() && !loading) {
                  e.target.style.background = "#6366f1";
                  e.target.style.transform = "scale(1)";
                }
              }}
            >
              {loading ? (
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </div>

        {/* Matched Tutors */}
        {matchedTutors.length > 0 && (
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: "#1e293b", fontSize: 18 }}>
              Tutor được đề xuất ({matchedTutors.length})
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16
            }}>
              {matchedTutors.map((tutor) => (
                <div
                  key={tutor.tutorID}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: 16,
                    background: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTutorClick(e, tutor);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTutorClick(e, tutor);
                    }
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 600,
                        color: "#1e293b",
                        marginBottom: 4
                      }}>
                        {tutor.full_name}
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: "#64748b"
                      }}>
                        {tutor.major}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#f59e0b"
                    }}>
                      <span style={{ fontSize: 14 }}>⭐</span>
                      <span style={{ fontWeight: 600 }}>{tutor.rating}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 8
                  }}>
                    {tutor.profile?.substring(0, 100)}...
                  </div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 8
                  }}>
                    {tutor.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: "4px 8px",
                          background: "#e0e7ff",
                          color: "#6366f1",
                          borderRadius: 12,
                          fontSize: 11
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#6366f1",
                    fontWeight: 500
                  }}>
                    Xem chi tiết <FaExternalLinkAlt />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Modal Lịch Rảnh */}
      {showScheduleModal && currentTutor && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              setShowScheduleModal(false);
              setCurrentTutor(null);
              setSlotMessage("");
            }
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
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
                  setSlotMessage("");
                }}
                style={{background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666"}}
              >
                &times;
              </button>
            </div>

            {/* Thông báo */}
            {slotMessage && (
              <div style={{
                marginBottom: 15,
                padding: 12,
                borderRadius: 8,
                background: slotMessageType === "success" ? "#d1fae5" : "#fee2e2",
                color: slotMessageType === "success" ? "#065f46" : "#991b1b",
                fontSize: 14
              }}>
                {slotMessage}
              </div>
            )}

            {/* Filter */}
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
                  setSlotMessage("");
                }}
                style={{padding: "8px 24px"}}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Chatbot;

