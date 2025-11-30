import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/style.css";
import ForumService from "../api/forum";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaHeart, 
  FaComment, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane,
  FaTimes,
  FaPaperclip,
  FaThumbtack,
  FaLock,
  FaUser,
  FaClock,
  FaTag
} from "react-icons/fa";

function Forum() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Create post form
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    category: "",
    attachments: []
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [keyword, selectedCategory, sortBy]);

  const loadData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        ForumService.getPosts({ sort_by: sortBy }),
        ForumService.getCategories()
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const criteria = {
        keyword: keyword || null,
        category: selectedCategory || null,
        sort_by: sortBy
      };
      const data = await ForumService.getPosts(criteria);
      setPosts(data);
    } catch (error) {
      console.error("Lỗi khi tải bài đăng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!createForm.title.trim() || !createForm.content.trim() || !createForm.category) {
      setMessage("Vui lòng điền đầy đủ thông tin");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const result = await ForumService.createPost({
        author_id: userId,
        title: createForm.title,
        content: createForm.content,
        category: createForm.category,
        attachments: createForm.attachments
      });

      if (result.success) {
        setMessage("Tạo bài đăng thành công!");
        setMessageType("success");
        setShowCreateModal(false);
        setCreateForm({ title: "", content: "", category: "", attachments: [] });
        loadPosts();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(error.message || "Tạo bài đăng thất bại");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleViewPost = async (post) => {
    setSelectedPost(post);
    setShowPostDetailModal(true);
    setLoadingComments(true);
    try {
      const commentsData = await ForumService.getComments(post.post_id);
      setComments(commentsData);
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await ForumService.likePost(postId, userId);
      loadPosts();
      if (selectedPost && selectedPost.post_id === postId) {
        const updatedPost = await ForumService.getPostDetail(postId);
        if (updatedPost) setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error("Lỗi khi like:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || !selectedPost) return;

    try {
      const result = await ForumService.createComment({
        post_id: selectedPost.post_id,
        author_id: userId,
        content: commentInput
      });

      if (result.success) {
        setCommentInput("");
        const commentsData = await ForumService.getComments(selectedPost.post_id);
        setComments(commentsData);
        loadPosts();
        const updatedPost = await ForumService.getPostDetail(selectedPost.post_id);
        if (updatedPost) setSelectedPost(updatedPost);
      }
    } catch (error) {
      setMessage(error.message || "Gửi bình luận thất bại");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;

    try {
      const result = await ForumService.deletePost(postId, userId);
      if (result.success) {
        setMessage("Xóa bài đăng thành công!");
        setMessageType("success");
        loadPosts();
        if (selectedPost && selectedPost.post_id === postId) {
          setShowPostDetailModal(false);
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(error.message || "Xóa bài đăng thất bại");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      const result = await ForumService.deleteComment(commentId, userId);
      if (result.success) {
        const commentsData = await ForumService.getComments(selectedPost.post_id);
        setComments(commentsData);
        loadPosts();
        const updatedPost = await ForumService.getPostDetail(selectedPost.post_id);
        if (updatedPost) setSelectedPost(updatedPost);
      }
    } catch (error) {
      setMessage(error.message || "Xóa bình luận thất bại");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Học thuật":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "Kỹ năng mềm":
        return { bg: "#d1fae5", color: "#065f46" };
      case "Định hướng nghề nghiệp":
        return { bg: "#fef3c7", color: "#92400e" };
      default:
        return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const role = localStorage.getItem("role") || "Mentee";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <Header role={role.toLowerCase()} />
      
      <div style={{ flex: 1 }}>
        {/* Forum Header */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "20px 0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ margin: 0, fontSize: 28, color: "#1e293b" }}>Diễn đàn</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: "12px 24px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <FaPlus /> Đăng bài
              </button>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {/* Message */}
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

        {/* Search and Filter */}
        <div style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          marginBottom: 20
        }}>
          <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 300, position: "relative" }}>
              <FaSearch style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b"
              }} />
              <input
                type="text"
                placeholder="Tìm kiếm bài đăng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px 12px 45px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "12px 15px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                minWidth: 200
              }}
            >
              <option value="">Tất cả chủ đề</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "12px 15px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                minWidth: 150
              }}
            >
              <option value="latest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
              <option value="most_commented">Nhiều bình luận</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0"
          }}>
            <p style={{ color: "#64748b", fontSize: 16 }}>
              {keyword || selectedCategory
                ? "Không tìm thấy bài đăng nào phù hợp"
                : "Chưa có bài đăng nào. Hãy là người đầu tiên đăng bài!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {posts.map((post) => {
              const categoryStyle = getCategoryColor(post.category);
              return (
                <div
                  key={post.post_id}
                  onClick={() => handleViewPost(post)}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    padding: 20,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderLeft: post.is_pinned ? "4px solid #f59e0b" : "4px solid transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        {post.is_pinned && <FaThumbtack style={{ color: "#f59e0b" }} />}
                        {post.is_locked && <FaLock style={{ color: "#ef4444" }} />}
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                          {post.title}
                        </h3>
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
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: categoryStyle.bg,
                      color: categoryStyle.color
                    }}>
                      <FaTag style={{ marginRight: 4 }} /> {post.category}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                      <FaUser style={{ fontSize: 12 }} /> {post.author_name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                      <FaClock style={{ fontSize: 12 }} /> {formatDate(post.created_at)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                        <FaHeart style={{ color: "#ef4444" }} /> {post.likes}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                        <FaComment /> {post.comments_count}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                        <FaEye /> {post.views}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
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
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 25,
            maxWidth: 700,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Đăng bài mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#64748b"
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Tiêu đề <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài đăng..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Chủ đề <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14
                  }}
                >
                  <option value="">Chọn chủ đề</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Nội dung <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  placeholder="Nhập nội dung bài đăng..."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePost}
                  style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Đăng bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {showPostDetailModal && selectedPost && (
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
        }} onClick={() => setShowPostDetailModal(false)}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 25,
            maxWidth: 800,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {selectedPost.is_pinned && <FaThumbtack style={{ color: "#f59e0b" }} />}
                  {selectedPost.is_locked && <FaLock style={{ color: "#ef4444" }} />}
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                    {selectedPost.title}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 15 }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    ...getCategoryColor(selectedPost.category)
                  }}>
                    <FaTag style={{ marginRight: 4 }} /> {selectedPost.category}
                  </span>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    <FaUser style={{ marginRight: 4 }} /> {selectedPost.author_name}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    <FaClock style={{ marginRight: 4 }} /> {formatDate(selectedPost.created_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPostDetailModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#64748b"
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
              marginBottom: 20,
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              fontSize: 14,
              color: "#374151"
            }}>
              {selectedPost.content}
            </div>

            {selectedPost.attachments && selectedPost.attachments.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#374151" }}>
                  Tài liệu đính kèm:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedPost.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: 12,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textDecoration: "none",
                        color: "#4f46e5"
                      }}
                    >
                      <FaPaperclip /> {file.file_name} ({file.file_size})
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 15, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e2e8f0" }}>
              <button
                onClick={() => handleLikePost(selectedPost.post_id)}
                style={{
                  padding: "8px 16px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <FaHeart /> {selectedPost.likes}
              </button>
              <div style={{ padding: "8px 16px", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <FaComment /> {selectedPost.comments_count} bình luận
              </div>
              <div style={{ padding: "8px 16px", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <FaEye /> {selectedPost.views} lượt xem
              </div>
              {selectedPost.author_id === userId && (
                <button
                  onClick={() => handleDeletePost(selectedPost.post_id)}
                  style={{
                    padding: "8px 16px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginLeft: "auto"
                  }}
                >
                  <FaTrash /> Xóa
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, color: "#1e293b" }}>
                Bình luận ({comments.length})
              </h3>

              {loadingComments ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <p>Đang tải bình luận...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 15, marginBottom: 20 }}>
                  {comments.map((comment) => (
                    <div
                      key={comment.comment_id}
                      style={{
                        padding: 15,
                        background: "#f8fafc",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                            {comment.author_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        {comment.author_id === userId && (
                          <button
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: 12
                            }}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!selectedPost.is_locked && (
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Viết bình luận..."
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentInput.trim()}
                    style={{
                      padding: "12px 20px",
                      background: commentInput.trim() ? "#4f46e5" : "#cbd5e1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: commentInput.trim() ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaPaperPlane /> Gửi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default Forum;

