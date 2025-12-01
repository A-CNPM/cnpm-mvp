import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";
import SearchService from "../../api/search";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaBook, 
  FaGlobe,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

function Calendar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viewMode, setViewMode] = useState("month"); // "month", "week", "day"

  useEffect(() => {
    loadCalendarData();
  }, [userId, selectedDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      // Lấy lịch rảnh đã đăng ký
      const registeredSlots = await AvailableSlotService.getUserRegisteredSlots(userId);
      
      // Lấy tất cả sessions
      const allSessions = await SearchService.searchSessions({});
      
      // Lọc sessions của user
      const userSessions = allSessions.filter(s => 
        s.participants && s.participants.includes(userId)
      );

      // Kết hợp và format dữ liệu
      const events = [];
      
      // Thêm lịch rảnh đã đăng ký
      registeredSlots.forEach(slot => {
        events.push({
          id: slot.slot_id,
          type: "slot",
          title: slot.topic || "Lịch rảnh",
          start: slot.start_time,
          end: slot.end_time,
          tutor: slot.tutor_name || slot.tutor_id,
          mode: slot.mode,
          location: slot.location,
          status: slot.status,
          participants: slot.registered_participants?.length || 0,
          maxParticipants: slot.max_participants
        });
      });

      // Thêm buổi tư vấn
      userSessions.forEach(session => {
        events.push({
          id: session.sessionID,
          type: "session",
          title: session.topic || "Buổi tư vấn",
          start: session.startTime,
          end: session.endTime,
          tutor: session.tutor,
          mode: session.mode,
          location: session.location,
          status: session.status,
          participants: session.participants?.length || 0,
          maxParticipants: session.maxParticipants
        });
      });

      setCalendarEvents(events);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseDateTime = (dateTimeStr) => {
    try {
      // Format: "01/11/2025 12:00"
      const [datePart, timePart] = dateTimeStr.split(" ");
      if (!datePart || !timePart) return null;
      
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = timePart.split(":");
      
      return new Date(year, month - 1, day, hour, minute);
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatTime = (dateTimeStr) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(" ");
      return timePart || "";
    } catch {
      return "";
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return calendarEvents.filter(event => {
      const eventDate = parseDateTime(event.start);
      if (!eventDate) return false;
      return formatDate(eventDate) === dateStr;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Thêm các ngày trống ở đầu tháng
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Thêm các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
      case "Đã kết thúc":
        return "#10b981";
      case "Sắp diễn ra":
        return "#3b82f6";
      case "Đang diễn ra":
        return "#8b5cf6";
      case "Mở đăng ký":
        return "#f59e0b";
      case "Đã hủy":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="mentee-dashboard">
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">mentee@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Lịch cá nhân</h2>

        {/* View Mode Selector */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
          <button
            onClick={() => setViewMode("month")}
            style={{
              padding: "8px 16px",
              background: viewMode === "month" ? "#4f46e5" : "#f1f5f9",
              color: viewMode === "month" ? "#fff" : "#64748b",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: viewMode === "month" ? 600 : 400
            }}
          >
            Tháng
          </button>
          <button
            onClick={() => setViewMode("week")}
            style={{
              padding: "8px 16px",
              background: viewMode === "week" ? "#4f46e5" : "#f1f5f9",
              color: viewMode === "week" ? "#fff" : "#64748b",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: viewMode === "week" ? 600 : 400
            }}
          >
            Tuần
          </button>
          <button
            onClick={() => setViewMode("day")}
            style={{
              padding: "8px 16px",
              background: viewMode === "day" ? "#4f46e5" : "#f1f5f9",
              color: viewMode === "day" ? "#fff" : "#64748b",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: viewMode === "day" ? 600 : 400
            }}
          >
            Ngày
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : viewMode === "month" ? (
          <div>
            {/* Month Navigation */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              padding: "15px 20px",
              background: "#f8fafc",
              borderRadius: 8
            }}>
              <button
                onClick={() => navigateMonth(-1)}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                ← Tháng trước
              </button>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Tháng sau →
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
              background: "#e2e8f0",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              overflow: "hidden"
            }}>
              {/* Week Days Header */}
              {weekDays.map(day => (
                <div
                  key={day}
                  style={{
                    padding: 12,
                    background: "#f8fafc",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#475569"
                  }}
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {getDaysInMonth(selectedDate).map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} style={{ padding: 8, background: "#fff", minHeight: 100 }} />;
                }

                const dayEvents = getEventsForDate(day);
                const isToday = formatDate(day) === formatDate(new Date());

                return (
                  <div
                    key={day.getTime()}
                    style={{
                      padding: 8,
                      background: "#fff",
                      minHeight: 100,
                      border: isToday ? "2px solid #4f46e5" : "none",
                      position: "relative"
                    }}
                  >
                    <div style={{
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? "#4f46e5" : "#1e293b",
                      marginBottom: 4,
                      fontSize: 14
                    }}>
                      {day.getDate()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          style={{
                            padding: "4px 6px",
                            background: getStatusColor(event.status),
                            color: "#fff",
                            borderRadius: 4,
                            fontSize: 11,
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                          title={`${event.title} - ${formatTime(event.start)}`}
                        >
                          {formatTime(event.start)} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: 11, color: "#64748b", padding: "2px 6px" }}>
                          +{dayEvents.length - 3} sự kiện khác
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, background: "#f8fafc", borderRadius: 8 }}>
            <p style={{ color: "#64748b" }}>Chế độ xem {viewMode === "week" ? "tuần" : "ngày"} đang được phát triển.</p>
          </div>
        )}

        {/* Events List */}
        <div style={{ marginTop: 30 }}>
          <h3 style={{ marginBottom: 15, fontSize: 18, color: "#1e293b" }}>Sự kiện sắp tới</h3>
          {calendarEvents.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: "center",
              background: "#f8fafc",
              borderRadius: 8,
              color: "#64748b"
            }}>
              <FaCalendarAlt style={{ fontSize: 32, marginBottom: 10, color: "#cbd5e1" }} />
              <p>Không có sự kiện nào</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {calendarEvents
                .sort((a, b) => {
                  const dateA = parseDateTime(a.start);
                  const dateB = parseDateTime(b.start);
                  if (!dateA || !dateB) return 0;
                  return dateA - dateB;
                })
                .slice(0, 10)
                .map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: 16,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      display: "flex",
                      gap: 15,
                      alignItems: "start"
                    }}
                  >
                    <div style={{
                      width: 4,
                      background: getStatusColor(event.status),
                      borderRadius: 2,
                      minHeight: 60
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <FaBook style={{ color: "#4f46e5" }} />
                        <h4 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>{event.title}</h4>
                        <span style={{
                          padding: "2px 8px",
                          background: getStatusColor(event.status),
                          color: "#fff",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {event.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 24, fontSize: 14, color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FaUser style={{ color: "#6366f1" }} />
                          <span>Tutor: <strong>{event.tutor}</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FaClock style={{ color: "#6366f1" }} />
                          <span>{event.start} - {event.end}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FaGlobe style={{ color: "#6366f1" }} />
                          <span>Hình thức: <strong>{event.mode}</strong></span>
                        </div>
                        {event.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaMapMarkerAlt style={{ color: "#6366f1" }} />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 13 }}>
                          Số lượng: {event.participants}/{event.maxParticipants}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Calendar;

