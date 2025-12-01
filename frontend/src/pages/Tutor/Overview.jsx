import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";
import SessionService from "../../api/session";
import ReviewService from "../../api/review";
import ProgressTrackingService from "../../api/progressTracking";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaStar, 
  FaClock, 
  FaUser, 
  FaBook,
  FaChartLine,
  FaArrowRight,
  FaUsers,
  FaSpinner,
  FaChalkboardTeacher
} from "react-icons/fa";

function Overview() {
  const navigate = useNavigate();
  const tutorId = localStorage.getItem("username") || localStorage.getItem("user_id") || "b.tutor";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    activeSlots: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalStudents: 0,
    averageRating: 0,
    totalProgressRecords: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  // Debug: Log tutorId khi component mount
  useEffect(() => {
    console.log("📋 Tutor Overview - tutorId:", tutorId);
    console.log("📋 localStorage username:", localStorage.getItem("username"));
    console.log("📋 localStorage user_id:", localStorage.getItem("user_id"));
  }, []);

  useEffect(() => {
    loadOverviewData();
  }, [tutorId]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Bắt đầu load dữ liệu cho tutor:", tutorId);
      
      // Lấy các dữ liệu song song với error handling riêng cho từng API
      const [slots, sessions, reviews, progressTrackings] = await Promise.allSettled([
        AvailableSlotService.getTutorSlots(tutorId).catch(err => {
          console.error("❌ Lỗi khi lấy slots:", err);
          return [];
        }),
        SessionService.getUserSessions(tutorId).catch(err => {
          console.error("❌ Lỗi khi lấy sessions:", err);
          return [];
        }),
        ReviewService.getTutorReviews(tutorId).catch(err => {
          console.error("❌ Lỗi khi lấy reviews:", err);
          return [];
        }),
        ProgressTrackingService.getTutorProgressTrackings(tutorId).catch(err => {
          console.error("❌ Lỗi khi lấy progress trackings:", err);
          return [];
        })
      ]);

      // Xử lý kết quả từ Promise.allSettled
      const slotsData = slots.status === "fulfilled" ? slots.value : [];
      const sessionsData = sessions.status === "fulfilled" ? sessions.value : [];
      const reviewsData = reviews.status === "fulfilled" ? reviews.value : [];
      const progressTrackingsData = progressTrackings.status === "fulfilled" ? progressTrackings.value : [];

      console.log("✅ Dữ liệu đã load:", {
        slots: slotsData.length,
        sessions: sessionsData.length,
        reviews: reviewsData.length,
        progressTrackings: progressTrackingsData.length
      });

      // Đảm bảo dữ liệu là mảng
      const slotsArray = Array.isArray(slotsData) ? slotsData : [];
      const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];
      const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
      const progressTrackingsArray = Array.isArray(progressTrackingsData) ? progressTrackingsData : [];

      // Lọc sessions
      const upcoming = sessionsArray.filter(s => 
        s.status === "Sắp diễn ra" || s.status === "Đang diễn ra" || s.status === "Đã xác nhận"
      );
      
      const completed = sessionsArray.filter(s => 
        s.status === "Hoàn thành" || s.status === "Đã kết thúc"
      );

      // Đếm số sinh viên duy nhất
      const studentSet = new Set();
      sessionsArray.forEach(s => {
        if (s.participants && Array.isArray(s.participants)) {
          s.participants.forEach(participantId => {
            studentSet.add(participantId);
          });
        }
      });

      // Tính điểm đánh giá trung bình
      let avgRating = 0;
      if (reviewsArray.length > 0) {
        const totalRating = reviewsArray.reduce((sum, r) => sum + (r.rating || 0), 0);
        avgRating = Math.round((totalRating / reviewsArray.length) * 10) / 10;
      }

      // Lọc slots đang mở đăng ký
      const activeSlots = slotsArray.filter(s => 
        s.status === "Mở đăng ký" || s.status === "Chờ xác nhận"
      );

      // Lấy các session sắp diễn ra (tối đa 5)
      const sortedUpcoming = upcoming
        .sort((a, b) => {
          try {
            const dateA = new Date(a.startTime?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1") || 0);
            const dateB = new Date(b.startTime?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1") || 0);
            return dateA - dateB;
          } catch {
            return 0;
          }
        })
        .slice(0, 5);

      // Lấy các đánh giá gần đây (tối đa 5)
      const sortedReviews = reviewsArray
        .sort((a, b) => {
          try {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
          } catch {
            return 0;
          }
        })
        .slice(0, 5);

      setStats({
        totalSlots: slotsArray.length,
        activeSlots: activeSlots.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        totalStudents: studentSet.size,
        averageRating: avgRating,
        totalProgressRecords: progressTrackingsArray.length
      });

      setUpcomingSessions(sortedUpcoming);
      setRecentReviews(sortedReviews);
      
      console.log("✅ Đã cập nhật stats:", {
        totalSlots: slotsArray.length,
        activeSlots: activeSlots.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu tổng quan:", error);
      console.error("Chi tiết lỗi:", error.message, error.stack);
      // Đặt giá trị mặc định nếu có lỗi
      setStats({
        totalSlots: 0,
        activeSlots: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        totalStudents: 0,
        averageRating: 0,
        totalProgressRecords: 0
      });
      setUpcomingSessions([]);
      setRecentReviews([]);
    } finally {
      setLoading(false);
      console.log("✅ Hoàn thành load dữ liệu");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const [datePart, timePart] = dateStr.split(" ");
      if (!datePart || !timePart) return dateStr;
      return `${datePart} ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            style={{
              fontSize: 14,
              color: star <= rating ? "#fbbf24" : "#d1d5db"
            }}
          />
        ))}
      </div>
    );
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      gap: 15
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: 12,
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 5 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: color }}>
          {value}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="tutor-dashboard">
        <main className="main-content">
          <div className="tutor-header">
            <h1 className="tutor-title">Tutor</h1>
            <div className="tutor-email">{tutorId}@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Tổng quan</h2>
          <div style={{ textAlign: "center", padding: 40 }}>
            <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tutor-dashboard">
      <main className="main-content">
        <div className="tutor-header">
          <h1 className="tutor-title">Tutor</h1>
          <div className="tutor-email">{tutorId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Tổng quan</h2>

        {/* Thông báo chào mừng cho tutor mới */}
        {stats.totalSlots === 0 && stats.upcomingSessions === 0 && stats.completedSessions === 0 && (
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            padding: 20,
            borderRadius: 12,
            marginBottom: 30,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <FaChalkboardTeacher /> Chào mừng đến với hệ thống Tutor!
            </h3>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.95 }}>
              Bạn đã được phê duyệt làm Tutor. Hãy bắt đầu bằng cách tạo lịch rảnh để sinh viên có thể đăng ký buổi tư vấn với bạn.
            </p>
            <button
              onClick={() => navigate("/tutor/schedule")}
              style={{
                marginTop: 15,
                padding: "10px 20px",
                background: "#fff",
                color: "#667eea",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Tạo lịch rảnh đầu tiên
            </button>
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 30
        }}>
          <StatCard
            icon={<FaCalendarAlt style={{ fontSize: 28, color: "#3b82f6" }} />}
            title="Tổng số lịch rảnh"
            value={stats.totalSlots}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
          <StatCard
            icon={<FaClock style={{ fontSize: 28, color: "#10b981" }} />}
            title="Lịch rảnh đang mở"
            value={stats.activeSlots}
            color="#10b981"
            bgColor="#d1fae5"
          />
          <StatCard
            icon={<FaBook style={{ fontSize: 28, color: "#f59e0b" }} />}
            title="Buổi tư vấn sắp diễn ra"
            value={stats.upcomingSessions}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
          <StatCard
            icon={<FaCheckCircle style={{ fontSize: 28, color: "#2dd4bf" }} />}
            title="Buổi tư vấn đã hoàn thành"
            value={stats.completedSessions}
            color="#2dd4bf"
            bgColor="#e6fcf7"
          />
        </div>

        {/* Thống kê bổ sung */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 30
        }}>
          <StatCard
            icon={<FaUsers style={{ fontSize: 24, color: "#8b5cf6" }} />}
            title="Số sinh viên đã hỗ trợ"
            value={stats.totalStudents}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
          <StatCard
            icon={<FaStar style={{ fontSize: 24, color: "#ec4899" }} />}
            title="Đánh giá trung bình"
            value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "N/A"}
            color="#ec4899"
            bgColor="#fce7f3"
          />
          <StatCard
            icon={<FaChartLine style={{ fontSize: 24, color: "#14b8a6" }} />}
            title="Ghi nhận tiến bộ"
            value={stats.totalProgressRecords}
            color="#14b8a6"
            bgColor="#ccfbf1"
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20
        }}>
          {/* Buổi tư vấn sắp diễn ra */}
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20
            }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                <FaCalendarAlt style={{ color: "#10b981" }} />
                Buổi tư vấn sắp diễn ra
              </h3>
              <div
                onClick={() => navigate("/tutor/meeting")}
                style={{
                  fontSize: 14,
                  color: "#6366f1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}
              >
                Xem tất cả <FaArrowRight />
              </div>
            </div>
            {upcomingSessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                <FaCalendarAlt style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Bạn chưa có buổi tư vấn nào sắp diễn ra.</p>
                <p style={{ margin: "5px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                  Tạo lịch rảnh để bắt đầu nhận đăng ký từ sinh viên.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {upcomingSessions.map((session) => (
                  <div
                    key={session.sessionID}
                    style={{
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 5 }}>
                      {session.topic || "Buổi tư vấn"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      <div>Thời gian: {formatDate(session.startTime)} - {formatDate(session.endTime)}</div>
                      <div>Hình thức: <strong>{session.mode || "N/A"}</strong></div>
                      <div>Số lượng: <strong>{session.participants?.length || 0}/{session.maxParticipants || 0}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phản hồi gần đây từ mentee */}
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20
            }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
                <FaStar style={{ color: "#f59e0b" }} />
                Phản hồi gần đây
              </h3>
              <div
                onClick={() => navigate("/tutor/feedback")}
                style={{
                  fontSize: 14,
                  color: "#6366f1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}
              >
                Xem tất cả <FaArrowRight />
              </div>
            </div>
            {recentReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                <FaStar style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Bạn chưa nhận được phản hồi nào từ sinh viên.</p>
                <p style={{ margin: "5px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                  Phản hồi sẽ xuất hiện sau khi sinh viên đánh giá các buổi tư vấn đã hoàn thành.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentReviews.map((review) => (
                  <div
                    key={review.review_id}
                    style={{
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      {renderStars(review.rating)}
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(review.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 5 }}>
                      {review.session_topic || "Buổi tư vấn"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>
                      Từ: <strong>{review.user_name || review.user_id || "N/A"}</strong>
                    </div>
                    {review.comment && (
                      <div style={{
                        fontSize: 13,
                        color: "#374151",
                        marginTop: 8,
                        padding: 8,
                        background: "#fff",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0"
                      }}>
                        "{review.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: 30,
          padding: 20,
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#1e293b" }}>
            Thao tác nhanh
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 15
          }}>
            <button
              onClick={() => navigate("/tutor/meeting")}
              style={{
                padding: "15px 20px",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <FaCalendarAlt /> Quản lý buổi tư vấn
            </button>
            <button
              onClick={() => navigate("/tutor/feedback")}
              style={{
                padding: "15px 20px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <FaChartLine /> Theo dõi & Phản hồi
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Overview;

