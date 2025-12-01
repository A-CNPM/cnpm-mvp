import React, { useState, useEffect } from "react";
import "../../assets/css/style.css";
import AdminService from "../../api/admin";
import { FaSearch, FaUser, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter } from "react-icons/fa";

function UserManagement() {
  const adminId = localStorage.getItem("username") || "admin.khoa";
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterKhoa, setFilterKhoa] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadUsers();
  }, [adminId]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const criteria = {
        keyword: keyword || null,
        role: filterRole || null,
        khoa: filterKhoa || null,
        status: filterStatus || null
      };
      const data = await AdminService.searchUsers(adminId, criteria);
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách users:", error);
      showMessage("Không thể tải danh sách users", "error");
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

  const handleSearch = () => {
    loadUsers();
  };

  const getRoleBadge = (role) => {
    if (Array.isArray(role)) {
      return role.join(", ");
    }
    return role;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    switch (status) {
      case "approved":
        return { text: "Đã phê duyệt", color: "#10b981", bg: "#d1fae5" };
      case "pending":
        return { text: "Chờ duyệt", color: "#f59e0b", bg: "#fef3c7" };
      case "rejected":
        return { text: "Từ chối", color: "#ef4444", bg: "#fee2e2" };
      default:
        return { text: status, color: "#64748b", bg: "#f1f5f9" };
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
            <h2 className="main-title">Quản lý danh sách Tutor và Sinh viên</h2>
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

          {/* Search and Filter */}
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            marginBottom: 20
          }}>
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "center", marginBottom: 15 }}>
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
                  placeholder="Tìm kiếm theo tên, email, username..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: "12px 15px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 150
                }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="Mentee">Mentee</option>
                <option value="Tutor">Tutor</option>
              </select>
              <input
                type="text"
                placeholder="Khoa..."
                value={filterKhoa}
                onChange={(e) => setFilterKhoa(e.target.value)}
                style={{
                  padding: "12px 15px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 200
                }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "12px 15px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 150
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="approved">Đã phê duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
              <button
                onClick={handleSearch}
                style={{
                  padding: "12px 24px",
                  background: "#4f46e5",
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
                <FaFilter /> Tìm kiếm
              </button>
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Tổng số: <strong>{users.length}</strong> users
            </div>
          </div>
          
          {/* Danh sách users */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, marginBottom: 10 }} />
              <p>Đang tải...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <FaUser style={{ fontSize: 48, color: "#94a3b8", marginBottom: 10 }} />
              <p style={{ color: "#64748b" }}>
                {keyword || filterRole || filterKhoa || filterStatus
                  ? "Không tìm thấy user nào phù hợp"
                  : "Chưa có user nào"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {users.map((user) => {
                const statusBadge = getStatusBadge(user.approval_status);
                
                return (
                  <div
                    key={user.user_id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
                            {user.full_name}
                          </h3>
                          <span style={{
                            padding: "4px 12px",
                            background: Array.isArray(user.role) && user.role.includes("Tutor") ? "#e0e7ff" : "#d1fae5",
                            color: Array.isArray(user.role) && user.role.includes("Tutor") ? "#6366f1" : "#065f46",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {getRoleBadge(user.role)}
                          </span>
                          {statusBadge && (
                            <span style={{
                              padding: "4px 12px",
                              background: statusBadge.bg,
                              color: statusBadge.color,
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              {statusBadge.text}
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "#64748b" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaUser /> {user.email || `${user.user_id}@hcmut.edu.vn`}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaGraduationCap /> {user.khoa || "N/A"}
                          </span>
                          {user.bo_mon && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              Bộ môn: {user.bo_mon}
                            </span>
                          )}
                          {user.tutor_type && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              Loại: {user.tutor_type}
                            </span>
                          )}
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
    </>
  );
}

export default UserManagement;

