import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import ReviewService from "../../api/review";
import ProgressTrackingService from "../../api/progressTracking";
import { FaStar, FaCalendarAlt, FaUser, FaBook, FaCheckCircle, FaChartLine, FaArrowUp, FaArrowDown, FaSpinner } from "react-icons/fa";

function Review() {
  const userId = localStorage.getItem("username") || "b.levan";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [completedSessions, setCompletedSessions] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "history", hoặc "progress"
  const [progressTrackings, setProgressTrackings] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  
  // Form state cho đánh giá
  const [reviewForm, setReviewForm] = useState({
    session_id: "",
    rating: 5,
    comment: ""
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessions, reviews] = await Promise.all([
        ReviewService.getUserCompletedSessions(userId),
        ReviewService.getUserReviews(userId)
      ]);
      setCompletedSessions(sessions);
      setMyReviews(reviews);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressTrackings = async () => {
    setLoadingProgress(true);
    try {
      const data = await ProgressTrackingService.getMenteeProgressTrackings(userId);
      setProgressTrackings(data || []);
    } catch (error) {
      console.error("Lỗi khi tải ghi nhận tiến bộ:", error);
      setProgressTrackings([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    if (activeTab === "progress") {
      loadProgressTrackings();
    }
  }, [activeTab, userId]);

  const handleOpenReviewModal = (session) => {
    setSelectedSession(session);
    setReviewForm({
      session_id: session.sessionID,
      rating: 5,
      comment: ""
    });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedSession(null);
    setReviewForm({
      session_id: "",
      rating: 5,
      comment: ""
    });
    setMessage("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await ReviewService.submitReview({
        session_id: reviewForm.session_id,
        user_id: userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment || null
      });

      if (result.success) {
        setMessage("Đánh giá đã được gửi thành công!");
        setMessageType("success");
        // Reload data
        await loadData();
        // Đóng modal sau 1.5s
        setTimeout(() => {
          handleCloseReviewModal();
        }, 1500);
      }
    } catch (error) {
      setMessage(error.message || "Có lỗi xảy ra khi gửi đánh giá");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            style={{
              fontSize: 20,
              color: star <= rating ? "#fbbf24" : "#d1d5db",
              cursor: interactive ? "pointer" : "default"
            }}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mentee-dashboard">
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">{userId}@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Đánh giá & Theo dõi tiến bộ</h2>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          borderBottom: "2px solid #e2e8f0"
        }}>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "pending" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "pending" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "pending" ? 600 : 400,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Chờ đánh giá ({completedSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "history" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "history" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "history" ? 600 : 400,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Lịch sử đánh giá ({myReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "progress" ? "2px solid #4f46e5" : "2px solid transparent",
              color: activeTab === "progress" ? "#4f46e5" : "#64748b",
              fontWeight: activeTab === "progress" ? 600 : 400,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Theo dõi tiến bộ ({progressTrackings.length})
          </button>
        </div>

        {/* Thông báo */}
        {message && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            background: messageType === "success" ? "#d1fae5" : "#fee2e2",
            color: messageType === "success" ? "#065f46" : "#991b1b",
            fontSize: 14
          }}>
            {message}
          </div>
        )}

        {/* Tab: Chờ đánh giá */}
        {activeTab === "pending" && (
          <div>
            {loading ? (
              <p style={{ textAlign: "center", padding: 20 }}>Đang tải...</p>
            ) : completedSessions.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 40,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}>
                <FaCheckCircle style={{ fontSize: 48, color: "#10b981", marginBottom: 10 }} />
                <p style={{ color: "#64748b", fontSize: 16 }}>
                  Bạn đã đánh giá tất cả các buổi tư vấn đã hoàn thành.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {completedSessions.map((session) => (
                  <div
                    key={session.sessionID}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <FaBook style={{ color: "#4f46e5" }} />
                          <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>{session.topic}</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 28 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                            <FaUser style={{ color: "#6366f1" }} />
                            <span>Tutor: <strong>{session.tutor_name}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                            <FaCalendarAlt style={{ color: "#6366f1" }} />
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#64748b" }}>
                            Hình thức: <strong>{session.mode}</strong>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenReviewModal(session)}
                        style={{
                          padding: "10px 20px",
                          background: "#4f46e5",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Đánh giá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Lịch sử đánh giá */}
        {activeTab === "history" && (
          <div>
            {loading ? (
              <p style={{ textAlign: "center", padding: 20 }}>Đang tải...</p>
            ) : myReviews.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 40,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ color: "#64748b", fontSize: 16 }}>
                  Bạn chưa có đánh giá nào.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {myReviews.map((review) => (
                  <div
                    key={review.review_id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 15 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <FaBook style={{ color: "#4f46e5" }} />
                          <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>{review.session_topic}</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 28 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                            <FaUser style={{ color: "#6366f1" }} />
                            <span>Tutor: <strong>{review.tutor_name}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
                            <FaCalendarAlt style={{ color: "#6366f1" }} />
                            <span>{review.session_time}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {renderStars(review.rating)}
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>
                          {new Date(review.created_at).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <div style={{
                        marginTop: 15,
                        padding: 12,
                        background: "#f8fafc",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        fontSize: 14,
                        color: "#374151"
                      }}>
                        <strong>Nhận xét:</strong> {review.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Theo dõi tiến bộ */}
        {activeTab === "progress" && (
          <div>
            {loadingProgress ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <FaSpinner className="spin" style={{ fontSize: 30, color: "#4f46e5", marginBottom: 10 }} />
                <p style={{ color: "#64748b" }}>Đang tải ghi nhận tiến bộ...</p>
              </div>
            ) : progressTrackings.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 40,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}>
                <FaChartLine style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
                <p style={{ color: "#64748b", fontSize: 16 }}>
                  Chưa có ghi nhận tiến bộ nào từ Tutor.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {progressTrackings.map((tracking, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: 15 }}>
                      {/* Icon và loại */}
                      <div style={{
                        padding: 12,
                        borderRadius: 8,
                        background: tracking.progress_type === "progress" ? "#d1fae5" : "#fee2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 50,
                        height: 50
                      }}>
                        {tracking.progress_type === "progress" ? (
                          <FaArrowUp style={{ fontSize: 24, color: "#10b981" }} />
                        ) : (
                          <FaArrowDown style={{ fontSize: 24, color: "#ef4444" }} />
                        )}
                      </div>

                      {/* Nội dung */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: 16, 
                            color: "#1e293b",
                            fontWeight: 600
                          }}>
                            {tracking.progress_type === "progress" ? "Tiến bộ" : "Hạn chế"}
                          </h3>
                          {tracking.session_topic && (
                            <span style={{
                              padding: "4px 8px",
                              background: "#e0e7ff",
                              color: "#4f46e5",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500
                            }}>
                              {tracking.session_topic}
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          marginBottom: 12,
                          padding: 12,
                          background: "#f8fafc",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          fontSize: 14,
                          color: "#374151",
                          lineHeight: 1.6
                        }}>
                          {tracking.content}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 15, fontSize: 13, color: "#64748b" }}>
                          {tracking.tutor_name && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaUser style={{ color: "#6366f1" }} />
                              <span><strong>Tutor:</strong> {tracking.tutor_name}</span>
                            </div>
                          )}
                          {tracking.session_time && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaCalendarAlt style={{ color: "#6366f1" }} />
                              <span>{tracking.session_time}</span>
                            </div>
                          )}
                          {tracking.created_at && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaCheckCircle style={{ color: "#6366f1" }} />
                              <span>{new Date(tracking.created_at).toLocaleString("vi-VN")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal đánh giá */}
        {showReviewModal && selectedSession && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              padding: 25,
              borderRadius: 12,
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1e293b" }}>
                Đánh giá buổi tư vấn
              </h3>
              
              <div style={{ marginBottom: 20, padding: 15, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Chủ đề:</strong> {selectedSession.topic}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Tutor:</strong> {selectedSession.tutor_name}
                </div>
                <div>
                  <strong>Thời gian:</strong> {selectedSession.startTime} - {selectedSession.endTime}
                </div>
              </div>

              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    Đánh giá <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {renderStars(reviewForm.rating, true, (rating) => {
                    setReviewForm(prev => ({ ...prev, rating }));
                  })}
                  <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
                    {reviewForm.rating === 1 && "Rất không hài lòng"}
                    {reviewForm.rating === 2 && "Không hài lòng"}
                    {reviewForm.rating === 3 && "Bình thường"}
                    {reviewForm.rating === 4 && "Hài lòng"}
                    {reviewForm.rating === 5 && "Rất hài lòng"}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 10, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    Nhận xét
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    placeholder="Chia sẻ nhận xét của bạn về buổi tư vấn..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    style={{
                      padding: "10px 20px",
                      background: "transparent",
                      color: "#64748b",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      background: loading ? "#9ca3af" : "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Review;

