import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AdminService from "../../api/admin";
import { FaClipboardList, FaChartBar, FaUsers, FaBook, FaSpinner, FaDownload } from "react-icons/fa";

function Reports() {
  const adminId = localStorage.getItem("username") || "admin.khoa";
  const [loading, setLoading] = useState(false);
  const [activityReport, setActivityReport] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [activeTab, setActiveTab] = useState("activity"); // "activity" hoặc "quality"

  useEffect(() => {
    loadReports();
  }, [adminId]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [activity, quality] = await Promise.all([
        AdminService.getActivityReport(adminId),
        AdminService.getQualityReport(adminId)
      ]);
      setActivityReport(activity);
      setQualityReport(quality);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="admin-dashboard">
        <main className="main-content">
          <div className="admin-header">
            <h1 className="admin-title">Admin</h1>
            <div className="admin-email">{adminId}@hcmut.edu.vn</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="main-title">Báo cáo chi tiết</h2>
            <button
              onClick={loadReports}
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <FaDownload /> Làm mới
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            borderBottom: "2px solid #e2e8f0"
          }}>
            <button
              onClick={() => setActiveTab("activity")}
              style={{
                padding: "12px 24px",
                background: activeTab === "activity" ? "#6366f1" : "transparent",
                color: activeTab === "activity" ? "#fff" : "#64748b",
                border: "none",
                borderBottom: activeTab === "activity" ? "2px solid #6366f1" : "2px solid transparent",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: -2
              }}
            >
              <FaChartBar style={{ marginRight: 8 }} />
              Báo cáo hoạt động
            </button>
            <button
              onClick={() => setActiveTab("quality")}
              style={{
                padding: "12px 24px",
                background: activeTab === "quality" ? "#6366f1" : "transparent",
                color: activeTab === "quality" ? "#fff" : "#64748b",
                border: "none",
                borderBottom: activeTab === "quality" ? "2px solid #6366f1" : "2px solid transparent",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: -2
              }}
            >
              <FaBook style={{ marginRight: 8 }} />
              Báo cáo chất lượng
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
              <p>Đang tải...</p>
            </div>
          ) : activeTab === "activity" ? (
            activityReport ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Tổng quan hoạt động
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Tổng số buổi</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#6366f1" }}>
                        {activityReport.total_sessions || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Đã hoàn thành</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
                        {activityReport.completed_sessions || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Bị hủy</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>
                        {activityReport.cancelled_sessions || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Đổi lịch</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
                        {activityReport.rescheduled_sessions || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Tổng participants</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#8b5cf6" }}>
                        {activityReport.total_participants || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Tỷ lệ tham gia</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#06b6d4" }}>
                        {activityReport.participation_rate || 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {activityReport.sessions_by_month && activityReport.sessions_by_month.length > 0 && (
                  <div style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                      Số buổi theo tháng
                    </h3>
                    <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                      {activityReport.sessions_by_month.map((item, idx) => (
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

                {activityReport.sessions_by_tutor && activityReport.sessions_by_tutor.length > 0 && (
                  <div style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                      Phân bổ theo Tutor
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {activityReport.sessions_by_tutor.map((item, idx) => (
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
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <FaClipboardList style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
                <p style={{ color: "#64748b" }}>Không có dữ liệu báo cáo hoạt động</p>
              </div>
            )
          ) : (
            qualityReport ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Tổng quan chất lượng
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Tổng số đánh giá</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#6366f1" }}>
                        {qualityReport.total_reviews || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 5 }}>Điểm trung bình</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
                        {qualityReport.average_rating || 0}/5
                      </div>
                    </div>
                  </div>
                </div>

                {qualityReport.rating_distribution && Object.keys(qualityReport.rating_distribution).length > 0 && (
                  <div style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                      Phân bổ điểm đánh giá
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {Object.entries(qualityReport.rating_distribution)
                        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                        .map(([rating, count]) => (
                          <div key={rating} style={{ display: "flex", alignItems: "center", gap: 15 }}>
                            <div style={{ width: 60, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                              {rating} sao
                            </div>
                            <div style={{ flex: 1, height: 24, background: "#f1f5f9", borderRadius: 12, position: "relative" }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${(count / qualityReport.total_reviews) * 100}%`,
                                  background: "#6366f1",
                                  borderRadius: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  paddingRight: 8
                                }}
                              >
                                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>
                                  {count}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {qualityReport.reviews_by_tutor && qualityReport.reviews_by_tutor.length > 0 && (
                  <div style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                      Đánh giá theo Tutor
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {qualityReport.reviews_by_tutor.map((item, idx) => (
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
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                              {item.tutor_name || item.tutor_id}
                            </div>
                            <div style={{ fontSize: 13, color: "#64748b" }}>
                              {item.count} đánh giá
                            </div>
                          </div>
                          <div style={{
                            padding: "8px 16px",
                            background: "#d1fae5",
                            color: "#065f46",
                            borderRadius: 20,
                            fontSize: 14,
                            fontWeight: 600
                          }}>
                            {item.average_rating}/5
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {qualityReport.recent_reviews && qualityReport.recent_reviews.length > 0 && (
                  <div style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0"
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                      Đánh giá gần đây
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {qualityReport.recent_reviews.map((review, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 15,
                            background: "#f8fafc",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                                {review.tutor_name || "N/A"}
                              </div>
                              <div style={{ fontSize: 13, color: "#64748b" }}>
                                {review.session_topic || "N/A"}
                              </div>
                            </div>
                            <div style={{
                              padding: "4px 12px",
                              background: "#fef3c7",
                              color: "#f59e0b",
                              borderRadius: 20,
                              fontSize: 14,
                              fontWeight: 600
                            }}>
                              {review.rating}/5 ⭐
                            </div>
                          </div>
                          <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                            {review.comment || "Không có bình luận"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <FaBook style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
                <p style={{ color: "#64748b" }}>Không có dữ liệu báo cáo chất lượng</p>
              </div>
            )
          )}
        </main>
      </div>
    </>
  );
}

export default Reports;

