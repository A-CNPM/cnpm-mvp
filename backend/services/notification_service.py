from typing import Optional, Dict, List
from data.notifications import fake_notifications_db
from schemas.notification import CreateNotification, Notification
import uuid
from datetime import datetime

class NotificationService:
    
    def create_notification(self, notification_data: CreateNotification) -> Dict:
        """Tạo notification mới"""
        notification_id = f"notif_{str(uuid.uuid4())[:8]}"
        
        notification = {
            "notification_id": notification_id,
            "user_id": notification_data.user_id,
            "type": notification_data.type,
            "title": notification_data.title,
            "message": notification_data.message,
            "is_read": False,
            "created_at": datetime.now().isoformat(),
            "related_id": notification_data.related_id,
            "action_url": notification_data.action_url
        }
        
        # Thêm vào database
        if notification_data.user_id not in fake_notifications_db:
            fake_notifications_db[notification_data.user_id] = []
        
        fake_notifications_db[notification_data.user_id].insert(0, notification)  # Thêm vào đầu list
        
        return notification
    
    def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        """Lấy danh sách notifications của user"""
        notifications = fake_notifications_db.get(user_id, [])
        
        if unread_only:
            notifications = [n for n in notifications if not n.get("is_read", False)]
        
        # Sắp xếp theo thời gian mới nhất
        notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return notifications
    
    def mark_as_read(self, user_id: str, notification_id: str) -> bool:
        """Đánh dấu notification là đã đọc"""
        notifications = fake_notifications_db.get(user_id, [])
        
        for notification in notifications:
            if notification["notification_id"] == notification_id:
                notification["is_read"] = True
                return True
        
        return False
    
    def mark_all_as_read(self, user_id: str) -> int:
        """Đánh dấu tất cả notifications của user là đã đọc"""
        notifications = fake_notifications_db.get(user_id, [])
        count = 0
        
        for notification in notifications:
            if not notification.get("is_read", False):
                notification["is_read"] = True
                count += 1
        
        return count
    
    def get_unread_count(self, user_id: str) -> int:
        """Lấy số lượng notifications chưa đọc"""
        notifications = fake_notifications_db.get(user_id, [])
        return sum(1 for n in notifications if not n.get("is_read", False))
    
    def delete_notification(self, user_id: str, notification_id: str) -> bool:
        """Xóa notification"""
        notifications = fake_notifications_db.get(user_id, [])
        
        for i, notification in enumerate(notifications):
            if notification["notification_id"] == notification_id:
                notifications.pop(i)
                return True
        
        return False

