import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import NotificationService from "../api/notification";
import "../assets/css/style.css";

function NotificationDropdown({ userId }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await NotificationService.getNotifications(userId, false);
      setNotifications(data);
      
      // Lấy số lượng chưa đọc
      const count = await NotificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!userId) return;
    try {
      const count = await NotificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy số lượng notifications chưa đọc:", error);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown, userId]);

  // Load unread count on mount and periodically
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleNotificationClick = async (notification) => {
    // Đánh dấu là đã đọc nếu chưa đọc
    if (!notification.is_read) {
      await NotificationService.markAsRead(userId, notification.notification_id);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notification.notification_id
            ? { ...n, is_read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
      setShowDropdown(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await NotificationService.deleteNotification(userId, notificationId);
    setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
    if (notifications.find(n => n.notification_id === notificationId && !n.is_read)) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <span
        className="icon-bell notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <FaBell style={{ fontSize: "22px", color: "#fff" }} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </span>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title="Đánh dấu tất cả là đã đọc"
              >
                <FaCheck /> Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">Không có thông báo nào</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.created_at)}</div>
                  </div>
                  <button
                    className="notification-delete-btn"
                    onClick={(e) => handleDeleteNotification(e, notification.notification_id)}
                    title="Xóa thông báo"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;

