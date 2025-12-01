import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AdminService from "../../api/admin";
import { FaChartLine, FaCheckCircle, FaTimesCircle, FaExchangeAlt, FaUsers, FaCalendarAlt, FaSpinner, FaChartBar } from "react-icons/fa";

function ActivityMonitoring() {
  const adminId = localStorage.getItem("username") || "admin.khoa";
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadReport();
  }, [adminId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getActivityReport(adminId);
      setReport(data);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo hoạt động:", error);
      showMessage("Không thể tải báo cáo hoạt động", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
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

  return (
    <>
      <div className="admin-dashboard">
        <main className="main-content">
          <div className="admin-header">
            <h1 className="admin-title">Admin</h1>
            <div className="admin-email">{adminId}@hcmut.edu.vn</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="main-title">Theo dõi hoạt động chương trình</h2>
            <button
              onClick={loadReport}
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Làm mới
            </button>
          </div>
          
          {/* Message */}
          {message && (
            <div style={{
              padding: "12px 16px",
              background: messageType === "success" ? "#d1fae5" : "#fee2e2",
              color: messageType === "success" ? "#065f46" : "#991b1b",
              borderRadius: 8,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              {message}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
              <p>Đang tải...</p>
            </div>
          ) : report ? (
            <>
              {/* Thống kê tổng quan */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 20,
                marginBottom: 30
              }}>
                <StatCard
                  icon={<FaCalendarAlt style={{ fontSize: 24, color: "#6366f1" }} />}
                  title="Tổng số buổi"
                  value={report.total_sessions || 0}
                  color="#6366f1"
                  bgColor="#e0e7ff"
                />
                <StatCard
                  icon={<FaCheckCircle style={{ fontSize: 24, color: "#10b981" }} />}
                  title="Đã hoàn thành"
                  value={report.completed_sessions || 0}
                  color="#10b981"
                  bgColor="#d1fae5"
                />
                <StatCard
                  icon={<FaTimesCircle style={{ fontSize: 24, color: "#ef4444" }} />}
                  title="Bị hủy/đổi"
                  value={(report.cancelled_sessions || 0) + (report.rescheduled_sessions || 0)}
                  color="#ef4444"
                  bgColor="#fee2e2"
                />
                <StatCard
                  icon={<FaUsers style={{ fontSize: 24, color: "#f59e0b" }} />}
                  title="Tổng participants"
                  value={report.total_participants || 0}
                  color="#f59e0b"
                  bgColor="#fef3c7"
                />
                <StatCard
                  icon={<FaChartLine style={{ fontSize: 24, color: "#8b5cf6" }} />}
                  title="Tỷ lệ tham gia"
                  value={`${report.participation_rate || 0}%`}
                  color="#8b5cf6"
                  bgColor="#ede9fe"
                />
              </div>

              {/* Sessions by month */}
              {report.sessions_by_month && report.sessions_by_month.length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  marginBottom: 20
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Số buổi theo tháng
                  </h3>
                  <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                    {report.sessions_by_month.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          minWidth: 150,
                          padding: 15,
                          background: "#f8fafc",
                          borderRadius: 8,
                          textAlign: "center"
                        }}
                      >
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                          {item.month}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: "#6366f1" }}>
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sessions by tutor */}
              {report.sessions_by_tutor && report.sessions_by_tutor.length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Top Tutors theo số buổi
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {report.sessions_by_tutor.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 15,
                          padding: 15,
                          background: "#f8fafc",
                          borderRadius: 8
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#6366f1",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                            {item.tutor_name || item.tutor_id}
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            {item.tutor_id}
                          </div>
                        </div>
                        <div style={{
                          padding: "8px 16px",
                          background: "#e0e7ff",
                          color: "#6366f1",
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          {item.count} buổi
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <FaChartLine style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
              <p style={{ color: "#64748b" }}>Không có dữ liệu</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default ActivityMonitoring;

