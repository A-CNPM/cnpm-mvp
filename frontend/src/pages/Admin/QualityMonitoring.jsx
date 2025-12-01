import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AdminService from "../../api/admin";
import { FaStar, FaChartBar, FaUsers, FaSpinner, FaComment } from "react-icons/fa";

function QualityMonitoring() {
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
      const data = await AdminService.getQualityReport(adminId);
      setReport(data);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo chất lượng:", error);
      showMessage("Không thể tải báo cáo chất lượng", "error");
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

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            style={{
              fontSize: 16,
              color: star <= rating ? "#fbbf24" : "#d1d5db"
            }}
          />
        ))}
      </div>
    );
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
            <h2 className="main-title">Giám sát chất lượng buổi tư vấn</h2>
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
                <div style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ fontSize: 14, color: "#64748b", marginBottom: 5 }}>
                    Tổng số đánh giá
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>
                    {report.total_reviews || 0}
                  </div>
                </div>
                <div style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ fontSize: 14, color: "#64748b", marginBottom: 5 }}>
                    Điểm trung bình
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>
                    {report.average_rating || 0}/5
                  </div>
                  {report.average_rating && (
                    <div style={{ marginTop: 8 }}>
                      {renderStars(Math.round(report.average_rating))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating distribution */}
              {report.rating_distribution && Object.keys(report.rating_distribution).length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  marginBottom: 20
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Phân bổ điểm đánh giá
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(report.rating_distribution)
                      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                      .map(([rating, count]) => (
                        <div key={rating} style={{ display: "flex", alignItems: "center", gap: 15 }}>
                          <div style={{ width: 80, fontSize: 14, fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                            {renderStars(parseInt(rating))}
                          </div>
                          <div style={{ flex: 1, height: 24, background: "#f1f5f9", borderRadius: 12, position: "relative" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${(count / report.total_reviews) * 100}%`,
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

              {/* Reviews by tutor */}
              {report.reviews_by_tutor && report.reviews_by_tutor.length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  marginBottom: 20
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Đánh giá theo Tutor
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {report.reviews_by_tutor.map((item, idx) => (
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
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
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
                          <div style={{ marginTop: 4 }}>
                            {renderStars(Math.round(item.average_rating))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent reviews */}
              {report.recent_reviews && report.recent_reviews.length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Phản hồi gần đây
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {report.recent_reviews.map((review, idx) => (
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
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                              {review.session_topic || "N/A"}
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                              {review.user_id || "N/A"}@hcmut.edu.vn
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                            <div style={{
                              padding: "4px 12px",
                              background: "#fef3c7",
                              color: "#f59e0b",
                              borderRadius: 20,
                              fontSize: 14,
                              fontWeight: 600
                            }}>
                              {review.rating}/5
                            </div>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        {review.comment && (
                          <div style={{
                            marginTop: 12,
                            padding: 12,
                            background: "#fff",
                            borderRadius: 8,
                            fontSize: 14,
                            color: "#374151",
                            lineHeight: 1.6,
                            display: "flex",
                            alignItems: "start",
                            gap: 8
                          }}>
                            <FaComment style={{ color: "#64748b", marginTop: 2, flexShrink: 0 }} />
                            <div>{review.comment}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common feedback */}
              {report.common_feedback && report.common_feedback.length > 0 && (
                <div style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b", fontSize: 18 }}>
                    Phản hồi phổ biến
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {report.common_feedback.map((feedback, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 12,
                          background: "#f8fafc",
                          borderRadius: 8,
                          fontSize: 14,
                          color: "#374151"
                        }}
                      >
                        {feedback}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <FaStar style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
              <p style={{ color: "#64748b" }}>Không có dữ liệu</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default QualityMonitoring;

