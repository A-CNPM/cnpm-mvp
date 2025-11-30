import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import AvailableSlotService from "../../api/availableSlot";
import SearchService from "../../api/search";
import ReviewService from "../../api/review";
import { 
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaBook,
  FaClock,
  FaTrophy
} from "react-icons/fa";

function Report() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    cancelledSessions: 0,
    totalSlots: 0,
    totalReviews: 0,
    averageRating: 0,
    uniqueTutors: 0,
    totalHours: 0
  });
  const [sessionsByMonth, setSessionsByMonth] = useState([]);
  const [topTutors, setTopTutors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [userId]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Lấy tất cả dữ liệu
      const [slots, allSessions, reviews] = await Promise.all([
        AvailableSlotService.getUserRegisteredSlots(userId),
        SearchService.searchSessions({}),
        ReviewService.getUserReviews(userId)
      ]);

      // Lọc sessions của user
      const userSessions = allSessions.filter(s => 
        s.participants && s.participants.includes(userId)
      );

      // Tính toán thống kê
      const completed = userSessions.filter(s => 
        s.status === "Hoàn thành" || s.status === "Đã kết thúc"
      );
      const upcoming = userSessions.filter(s => 
        s.status === "Sắp diễn ra" || s.status === "Đang diễn ra"
      );
      const cancelled = userSessions.filter(s => s.status === "Đã hủy");

      // Tính tổng số giờ
      let totalHours = 0;
      completed.forEach(session => {
        try {
          const [startDate, startTime] = session.startTime.split(" ");
          const [endDate, endTime] = session.endTime.split(" ");
          const [startHour, startMin] = startTime.split(":");
          const [endHour, endMin] = endTime.split(":");
          const start = new Date(startDate.split("/").reverse().join("-") + "T" + startTime);
          const end = new Date(endDate.split("/").reverse().join("-") + "T" + endTime);
          const diffMs = end - start;
          const diffHours = diffMs / (1000 * 60 * 60);
          totalHours += diffHours;
        } catch (e) {
          // Ignore parse errors
        }
      });

      // Tính điểm trung bình
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      // Đếm số tutor duy nhất
      const tutorSet = new Set();
      userSessions.forEach(s => {
        if (s.tutor) tutorSet.add(s.tutor);
      });

      // Thống kê theo tháng
      const monthlyStats = {};
      completed.forEach(session => {
        try {
          const [datePart] = session.startTime.split(" ");
          const [day, month, year] = datePart.split("/");
          const monthKey = `${month}/${year}`;
          monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
        } catch (e) {
          // Ignore
        }
      });
      const monthlyArray = Object.entries(monthlyStats)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split("/");
          const [bMonth, bYear] = b.month.split("/");
          if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
          return parseInt(aMonth) - parseInt(bMonth);
        })
        .slice(-6); // 6 tháng gần nhất

      // Top tutors (theo số buổi đã tham gia)
      const tutorCounts = {};
      completed.forEach(session => {
        if (session.tutor) {
          tutorCounts[session.tutor] = (tutorCounts[session.tutor] || 0) + 1;
        }
      });
      const topTutorsArray = Object.entries(tutorCounts)
        .map(([tutor, count]) => ({ tutor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity
      const activities = [];
      userSessions.forEach(session => {
        activities.push({
          type: "session",
          title: session.topic || "Buổi tư vấn",
          date: session.startTime,
          status: session.status,
          tutor: session.tutor
        });
      });
      slots.forEach(slot => {
        activities.push({
          type: "slot",
          title: slot.topic || "Lịch rảnh",
          date: slot.start_time,
          status: slot.status,
          tutor: slot.tutor_name || slot.tutor_id
        });
      });
      activities.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      });

      setStats({
        totalSessions: userSessions.length,
        completedSessions: completed.length,
        upcomingSessions: upcoming.length,
        cancelledSessions: cancelled.length,
        totalSlots: slots.length,
        totalReviews: reviews.length,
        averageRating: avgRating,
        uniqueTutors: tutorSet.size,
        totalHours: Math.round(totalHours * 10) / 10
      });
      setSessionsByMonth(monthlyArray);
      setTopTutors(topTutorsArray);
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    try {
      const [datePart, timePart] = dateStr.split(" ");
      if (!datePart) return null;
      const [day, month, year] = datePart.split("/");
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <div style={{
      padding: 20,
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      gap: 15
    }}>
      <div style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        fontSize: 24
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="mentee-dashboard">
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">mentee@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Báo cáo & Thống kê</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
              marginBottom: 30
            }}>
              <StatCard
                icon={<FaCalendarAlt />}
                title="Tổng buổi tư vấn"
                value={stats.totalSessions}
                color="#3b82f6"
                bgColor="#dbeafe"
              />
              <StatCard
                icon={<FaCheckCircle />}
                title="Buổi đã hoàn thành"
                value={stats.completedSessions}
                color="#10b981"
                bgColor="#d1fae5"
              />
              <StatCard
                icon={<FaClock />}
                title="Buổi sắp diễn ra"
                value={stats.upcomingSessions}
                color="#f59e0b"
                bgColor="#fef3c7"
              />
              <StatCard
                icon={<FaStar />}
                title="Điểm trung bình"
                value={stats.averageRating.toFixed(1)}
                color="#8b5cf6"
                bgColor="#ede9fe"
              />
              <StatCard
                icon={<FaUser />}
                title="Số tutor đã học"
                value={stats.uniqueTutors}
                color="#ec4899"
                bgColor="#fce7f3"
              />
              <StatCard
                icon={<FaBook />}
                title="Tổng giờ học"
                value={stats.totalHours}
                color="#06b6d4"
                bgColor="#cffafe"
              />
            </div>

            {/* Charts Section */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 20,
              marginBottom: 30
            }}>
              {/* Sessions by Month */}
              <div style={{
                padding: 20,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "#1e293b" }}>
                  <FaChartBar style={{ marginRight: 8, color: "#4f46e5" }} />
                  Buổi tư vấn theo tháng
                </h3>
                {sessionsByMonth.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                    Chưa có dữ liệu
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sessionsByMonth.map((item, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 80, fontSize: 13, color: "#64748b" }}>{item.month}</div>
                        <div style={{ flex: 1, height: 24, background: "#f1f5f9", borderRadius: 4, position: "relative" }}>
                          <div style={{
                            height: "100%",
                            width: `${(item.count / Math.max(...sessionsByMonth.map(s => s.count))) * 100}%`,
                            background: "#4f46e5",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            paddingRight: 8,
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Tutors */}
              <div style={{
                padding: 20,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "#1e293b" }}>
                  <FaTrophy style={{ marginRight: 8, color: "#f59e0b" }} />
                  Top Tutors đã học
                </h3>
                {topTutors.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                    Chưa có dữ liệu
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {topTutors.map((item, index) => (
                      <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 8
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#4f46e5",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.tutor}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{item.count} buổi</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              padding: 20,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "#1e293b" }}>
                <FaChartLine style={{ marginRight: 8, color: "#4f46e5" }} />
                Hoạt động gần đây
              </h3>
              {recentActivity.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
                  Chưa có hoạt động nào
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {recentActivity.map((activity, index) => (
                    <div key={index} style={{
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 12
                    }}>
                      {activity.type === "session" ? (
                        <FaBook style={{ color: "#4f46e5", fontSize: 18 }} />
                      ) : (
                        <FaCalendarAlt style={{ color: "#f59e0b", fontSize: 18 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                          {activity.title}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {activity.date} • Tutor: {activity.tutor} • {activity.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Report;

