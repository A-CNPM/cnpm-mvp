import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import MenteeSidebar from "../components/MenteeSidebar";
import SearchService from "../api/search";
import AvailableSlotService from "../api/availableSlot";
import { 
  FaBook, 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaSearch,
  FaFilter,
  FaStar,
  FaMapMarkerAlt,
  FaVideo,
  FaChalkboardTeacher
} from "react-icons/fa";

function Courses() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "b.levan";
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, online, offline
  const [filterStatus, setFilterStatus] = useState("all"); // all, available, upcoming, completed

  useEffect(() => {
    loadCourses();
  }, [userId]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, filterMode, filterStatus, courses]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // Lấy tất cả sessions
      const allSessions = await SearchService.searchSessions({});
      
      // Lấy tất cả tutors để lấy available slots
      const allTutors = await SearchService.searchTutors({});
      
      // Lấy available slots từ các tutors (giới hạn để tránh quá nhiều request)
      const tutorIds = allTutors.slice(0, 20).map(t => t.tutorID || t.userID || t.id).filter(Boolean);
      const slotsPromises = tutorIds.map(tutorId => 
        AvailableSlotService.getTutorSlots(tutorId, "Mở đăng ký").catch(() => [])
      );
      const slotsArrays = await Promise.all(slotsPromises);
      const allAvailableSlots = slotsArrays.flat();

      // Chuyển đổi sessions và slots thành courses
      const coursesList = [];

      // Thêm sessions như courses
      allSessions.forEach(session => {
        if (session.status !== "Đã hủy") {
          coursesList.push({
            id: session.sessionID,
            type: "session",
            title: session.topic || "Buổi tư vấn",
            tutor: session.tutor || "N/A",
            tutorName: session.tutor || "N/A",
            description: session.content || "Khóa học tư vấn học tập chất lượng cao",
            mode: session.mode || "Online",
            status: session.status || "Sắp diễn ra",
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location || "Online",
            currentParticipants: session.participants?.length || 0,
            maxParticipants: session.maxParticipants || 10,
            rating: null,
            isRegistered: session.participants?.includes(userId) || false
          });
        }
      });

      // Thêm available slots như courses
      allAvailableSlots.forEach(slot => {
        if (slot && slot.slot_id) {
          coursesList.push({
            id: slot.slot_id,
            type: "slot",
            title: slot.topic || "Lịch tư vấn",
            tutor: slot.tutor_id,
            tutorName: slot.tutor_id,
            description: slot.description || "Đăng ký lịch tư vấn với tutor",
            mode: slot.mode || "Online",
            status: "Mở đăng ký",
            startTime: slot.start_time,
            endTime: slot.end_time,
            location: slot.location || "Online",
            currentParticipants: slot.registered_students?.length || 0,
            maxParticipants: slot.max_students || 10,
            rating: null,
            isRegistered: slot.registered_students?.includes(userId) || false
          });
        }
      });

      setCourses(coursesList);
      setFilteredCourses(coursesList);
    } catch (error) {
      console.error("Lỗi khi tải khóa học:", error);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Lọc theo từ khóa
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo mode
    if (filterMode !== "all") {
      filtered = filtered.filter(course => course.mode === filterMode);
    }

    // Lọc theo status
    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        filtered = filtered.filter(course => 
          course.status === "Mở đăng ký" && 
          course.currentParticipants < course.maxParticipants
        );
      } else if (filterStatus === "upcoming") {
        filtered = filtered.filter(course => 
          course.status === "Sắp diễn ra" || course.status === "Đang diễn ra"
        );
      } else if (filterStatus === "completed") {
        filtered = filtered.filter(course => 
          course.status === "Hoàn thành" || course.status === "Đã kết thúc"
        );
      }
    }

    setFilteredCourses(filtered);
  };

  const handleRegister = async (course) => {
    try {
      if (course.type === "slot") {
        // Đăng ký slot
        const result = await AvailableSlotService.registerSlot(course.id, userId);
        if (result.success || result.message) {
          alert("Đăng ký thành công!");
          loadCourses();
        } else {
          alert("Đăng ký thất bại: " + (result.error || "Lỗi không xác định"));
        }
      } else {
        // Đăng ký session
        alert("Vui lòng đăng ký qua trang 'Buổi tư vấn'");
        navigate("/mentee/meeting");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Đã xảy ra lỗi khi đăng ký: " + (error.message || "Lỗi không xác định"));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Mở đăng ký":
        return "#10b981";
      case "Sắp diễn ra":
        return "#3b82f6";
      case "Đang diễn ra":
        return "#f59e0b";
      case "Hoàn thành":
      case "Đã kết thúc":
        return "#6b7280";
      default:
        return "#64748b";
    }
  };

  if (loading) {
    return (
      <div className="mentee-dashboard">
        <MenteeSidebar activeItem="courses" />
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">{userId}@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Khóa học</h2>
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mentee-dashboard">
      <MenteeSidebar activeItem="courses" />
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">{userId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Khóa học</h2>

        {/* Search và Filter */}
        <div style={{
          display: "flex",
          gap: 15,
          marginBottom: 30,
          flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: 300, position: "relative" }}>
            <FaSearch style={{
              position: "absolute",
              left: 15,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: 18
            }} />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px 12px 45px",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "#6366f1"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            style={{
              padding: "12px 15px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
              background: "#fff"
            }}
          >
            <option value="all">Tất cả hình thức</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "12px 15px",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
              background: "#fff"
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Có thể đăng ký</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>

        {/* Danh sách khóa học */}
        {filteredCourses.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0"
          }}>
            <FaBook style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 15 }} />
            <p style={{ color: "#64748b", fontSize: 16 }}>
              {searchTerm || filterMode !== "all" || filterStatus !== "all"
                ? "Không tìm thấy khóa học phù hợp"
                : "Chưa có khóa học nào"}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 20
          }}>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                {/* Header */}
                <div style={{
                  padding: 20,
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1e293b",
                      flex: 1
                    }}>
                      {course.title}
                    </h3>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: getStatusColor(course.status) + "20",
                      color: getStatusColor(course.status)
                    }}>
                      {course.status}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#64748b",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {course.description}
                  </p>
                </div>

                {/* Info */}
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 15
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaChalkboardTeacher style={{ color: "#6366f1", fontSize: 14 }} />
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        <strong>Tutor:</strong> {course.tutorName}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {course.mode === "Online" ? (
                        <FaVideo style={{ color: "#10b981", fontSize: 14 }} />
                      ) : (
                        <FaMapMarkerAlt style={{ color: "#f59e0b", fontSize: 14 }} />
                      )}
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        {course.mode} - {course.location}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaCalendarAlt style={{ color: "#3b82f6", fontSize: 14 }} />
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        {formatDate(course.startTime)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaClock style={{ color: "#8b5cf6", fontSize: 14 }} />
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        {formatDate(course.endTime)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FaUsers style={{ color: "#ec4899", fontSize: 14 }} />
                      <span style={{ fontSize: 14, color: "#374151" }}>
                        {course.currentParticipants}/{course.maxParticipants} học viên
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {course.status === "Mở đăng ký" && 
                   course.currentParticipants < course.maxParticipants &&
                   !course.isRegistered ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(course);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.02)";
                        e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Đăng ký ngay
                    </button>
                  ) : course.isRegistered ? (
                    <div style={{
                      width: "100%",
                      padding: "12px",
                      background: "#d1fae5",
                      color: "#065f46",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "center"
                    }}>
                      Đã đăng ký
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      padding: "12px",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "center"
                    }}>
                      {course.currentParticipants >= course.maxParticipants 
                        ? "Đã đầy" 
                        : "Không thể đăng ký"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Courses;

