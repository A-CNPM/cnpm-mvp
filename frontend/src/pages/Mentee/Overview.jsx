import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";
import SearchService from "../../api/search";
import ReviewService from "../../api/review";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaStar, 
  FaClock, 
  FaUser, 
  FaBook,
  FaChartLine,
  FaArrowRight
} from "react-icons/fa";

function Overview() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "b.levan";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    registeredSlots: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalReviews: 0,
    totalSessions: 0,
    uniqueTutors: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    loadOverviewData();
  }, [userId]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Lấy các dữ liệu song song
      const [slots, allSessions, reviews] = await Promise.all([
        AvailableSlotService.getUserRegisteredSlots(userId),
        SearchService.searchSessions({ keyword: "", mode: null, status: null }),
        ReviewService.getUserReviews(userId)
      ]);

      // Lọc sessions
      const userSessions = allSessions.filter(s => 
        s.participants && s.participants.includes(userId)
      );
      
      const upcoming = userSessions.filter(s => 
        s.status === "Sắp diễn ra" || s.status === "Đang diễn ra"
      );
      
      const completed = userSessions.filter(s => 
        s.status === "Hoàn thành" || s.status === "Đã kết thúc"
      );

      // Đếm số tutor duy nhất
      const tutorSet = new Set();
      userSessions.forEach(s => {
        if (s.tutor) tutorSet.add(s.tutor);
      });

      // Lấy các session sắp diễn ra (tối đa 3)
      const sortedUpcoming = upcoming
        .sort((a, b) => {
          const dateA = new Date(a.startTime?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1") || 0);
          const dateB = new Date(b.startTime?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1") || 0);
          return dateA - dateB;
        })
        .slice(0, 3);

      // Lấy các đánh giá gần đây (tối đa 3)
      const sortedReviews = reviews
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setStats({
        registeredSlots: slots.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        totalReviews: reviews.length,
        totalSessions: userSessions.length,
        uniqueTutors: tutorSet.size
      });

      setUpcomingSessions(sortedUpcoming);
      setRecentReviews(sortedReviews);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", error);
    } finally {
      setLoading(false);
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
      <div className="mentee-dashboard">
        <main className="main-content">
          <div className="mentee-header">
            <h1 className="mentee-title">Mentee</h1>
            <div className="mentee-email">{userId}@hcmut.edu.vn</div>
          </div>
          <h2 className="main-title">Tổng quan</h2>
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mentee-dashboard">
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">{userId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Tổng quan</h2>

        {/* Thống kê tổng quan */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 30
        }}>
          <StatCard
            icon={<FaClock style={{ fontSize: 28, color: "#3b82f6" }} />}
            title="Lịch rảnh đã đăng ký"
            value={stats.registeredSlots}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
          <StatCard
            icon={<FaCalendarAlt style={{ fontSize: 28, color: "#10b981" }} />}
            title="Buổi tư vấn sắp diễn ra"
            value={stats.upcomingSessions}
            color="#10b981"
            bgColor="#d1fae5"
          />
          <StatCard
            icon={<FaCheckCircle style={{ fontSize: 28, color: "#2dd4bf" }} />}
            title="Buổi tư vấn đã hoàn thành"
            value={stats.completedSessions}
            color="#2dd4bf"
            bgColor="#e6fcf7"
          />
          <StatCard
            icon={<FaStar style={{ fontSize: 28, color: "#f59e0b" }} />}
            title="Đánh giá đã gửi"
            value={stats.totalReviews}
            color="#f59e0b"
            bgColor="#fef3c7"
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
            icon={<FaBook style={{ fontSize: 24, color: "#8b5cf6" }} />}
            title="Tổng số buổi đã tham gia"
            value={stats.totalSessions}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
          <StatCard
            icon={<FaUser style={{ fontSize: 24, color: "#ec4899" }} />}
            title="Số Tutor đã học với"
            value={stats.uniqueTutors}
            color="#ec4899"
            bgColor="#fce7f3"
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
                onClick={() => navigate("/mentee/meeting")}
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
              <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
                <p>Bạn chưa có buổi tư vấn nào sắp diễn ra.</p>
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
                      <div>Tutor: <strong>{session.tutor || "N/A"}</strong></div>
                      <div>Thời gian: {formatDate(session.startTime)} - {formatDate(session.endTime)}</div>
                      <div>Hình thức: <strong>{session.mode || "N/A"}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Đánh giá gần đây */}
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
                Đánh giá gần đây
              </h3>
              <div
                onClick={() => navigate("/mentee/review")}
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
              <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
                <p>Bạn chưa có đánh giá nào.</p>
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
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            style={{
                              fontSize: 14,
                              color: star <= review.rating ? "#fbbf24" : "#d1d5db"
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(review.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 5 }}>
                      {review.session_topic || "Buổi tư vấn"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>
                      Tutor: <strong>{review.tutor_name || review.tutor_id || "N/A"}</strong>
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
      </main>
    </div>
  );
}

export default Overview;

