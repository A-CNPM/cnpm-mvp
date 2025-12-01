import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/style.css";
import MenteeSidebar from "../../components/MenteeSidebar";
import MaterialService from "../../api/material";
import { 
  FaBook,
  FaFilePdf,
  FaFileVideo,
  FaFileCode,
  FaFileArchive,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaInfoCircle
} from "react-icons/fa";

function Materials() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("username") || "a.nguyen";
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [materials, keyword, filterCategory, filterSubject, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [materialsData, categoriesData, subjectsData] = await Promise.all([
        MaterialService.getUserMaterials(userId),
        MaterialService.getCategories(userId),
        MaterialService.getSubjects(userId)
      ]);
      setMaterials(materialsData);
      setCategories(categoriesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];

    // Filter by keyword
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(keywordLower) ||
        (m.description && m.description.toLowerCase().includes(keywordLower)) ||
        (m.tags && m.tags.some(tag => tag.toLowerCase().includes(keywordLower)))
      );
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(m => m.category === filterCategory);
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(m => m.subject === filterSubject);
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter(m => m.type === filterType);
    }

    setFilteredMaterials(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleViewDetail = async (material) => {
    try {
      const detail = await MaterialService.getMaterialDetail(userId, material.material_id);
      if (detail) {
        setSelectedMaterial(detail);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết:", error);
    }
  };

  const handleDownload = async (material) => {
    try {
      // Ghi nhận lượt tải
      await MaterialService.recordDownload(userId, material.material_id);
      
      // Mở link tải xuống (trong thực tế sẽ là link từ HCMUT_LIBRARY)
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error("Lỗi khi tải xuống:", error);
      alert("Không thể tải xuống học liệu");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Document":
        return <FaFilePdf style={{ color: "#ef4444" }} />;
      case "Video":
        return <FaFileVideo style={{ color: "#3b82f6" }} />;
      case "Code":
        return <FaFileCode style={{ color: "#10b981" }} />;
      case "Archive":
        return <FaFileArchive style={{ color: "#f59e0b" }} />;
      default:
        return <FaBook style={{ color: "#64748b" }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Document":
        return "#fee2e2";
      case "Video":
        return "#dbeafe";
      case "Code":
        return "#d1fae5";
      case "Archive":
        return "#fef3c7";
      default:
        return "#f1f5f9";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mentee-dashboard">
      <MenteeSidebar activeItem="materials" />
      <main className="main-content">
        <div className="mentee-header">
          <h1 className="mentee-title">Mentee</h1>
          <div className="mentee-email">mentee@hcmut.edu.vn</div>
        </div>
        <h2 className="main-title">Học liệu</h2>

        {/* Search and Filter Bar */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <FaSearch style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8"
            }} />
            <input
              type="text"
              placeholder="Tìm kiếm học liệu..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "10px 20px",
              background: showFilters ? "#4f46e5" : "#f1f5f9",
              color: showFilters ? "#fff" : "#64748b",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600
            }}
          >
            <FaFilter /> Bộ lọc
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{
            marginBottom: 20,
            padding: 20,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 15
          }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block" }}>
                DANH MỤC
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">-- Tất cả --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block" }}>
                MÔN HỌC
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">-- Tất cả --</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#64748b", display: "block" }}>
                LOẠI TÀI LIỆU
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">-- Tất cả --</option>
                <option value="Document">Tài liệu</option>
                <option value="Video">Video</option>
                <option value="Code">Code</option>
                <option value="Archive">Archive</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => {
                  setFilterCategory("");
                  setFilterSubject("");
                  setFilterType("");
                  setKeyword("");
                }}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 60,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <FaBook style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 16 }} />
            <p style={{ color: "#64748b", fontSize: 16 }}>
              {materials.length === 0 
                ? "Bạn chưa có học liệu nào. Học liệu sẽ xuất hiện sau khi bạn tham gia các buổi tư vấn."
                : "Không tìm thấy học liệu nào phù hợp với bộ lọc."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
            {filteredMaterials.map((material) => (
              <div
                key={material.material_id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: getTypeColor(material.type),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24
                  }}>
                    {getTypeIcon(material.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: 0,
                      marginBottom: 4,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1e293b",
                      lineHeight: 1.3
                    }}>
                      {material.title}
                    </h3>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {material.category} • {material.subject}
                    </div>
                  </div>
                </div>

                {material.description && (
                  <p style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 12,
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {material.description}
                  </p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {material.tags && material.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "4px 8px",
                        background: "#f1f5f9",
                        color: "#475569",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9"
                }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    <FaDownload style={{ marginRight: 4 }} />
                    {material.download_count || 0} lượt tải
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {material.file_size} • {material.file_format}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(material);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FaInfoCircle /> Chi tiết
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(material);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FaDownload /> Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedMaterial && (
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
          }} onClick={() => setShowDetailModal(false)}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 25,
              maxWidth: 700,
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto"
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "start", gap: 15, marginBottom: 20 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: getTypeColor(selectedMaterial.type),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32
                }}>
                  {getTypeIcon(selectedMaterial.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, marginBottom: 8, fontSize: 20, color: "#1e293b" }}>
                    {selectedMaterial.title}
                  </h2>
                  <div style={{ fontSize: 14, color: "#64748b" }}>
                    {selectedMaterial.category} • {selectedMaterial.subject} • {selectedMaterial.type}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 24,
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 0,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              </div>

              {selectedMaterial.description && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#475569" }}>Mô tả</h4>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                    {selectedMaterial.description}
                  </p>
                </div>
              )}

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 15,
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Kích thước</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{selectedMaterial.file_size}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Định dạng</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{selectedMaterial.file_format}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Ngày tải lên</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                    {formatDate(selectedMaterial.uploaded_at)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Lượt tải</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                    {selectedMaterial.download_count || 0}
                  </div>
                </div>
              </div>

              {selectedMaterial.tags && selectedMaterial.tags.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#475569" }}>Tags</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedMaterial.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "6px 12px",
                          background: "#f1f5f9",
                          color: "#475569",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMaterial.related_sessions && selectedMaterial.related_sessions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: "#475569" }}>
                    Buổi tư vấn liên quan
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selectedMaterial.related_sessions.map((session, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 12,
                          background: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                          {session.topic}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          <FaUser style={{ marginRight: 4 }} />
                          Tutor: {session.tutor_name} • 
                          <FaCalendarAlt style={{ marginLeft: 8, marginRight: 4 }} />
                          {session.start_time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedMaterial);
                    setShowDetailModal(false);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <FaDownload /> Tải xuống
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Materials;

