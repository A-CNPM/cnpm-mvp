from services.notification_service import NotificationService
from schemas.notification import CreateNotification
from typing import List, Dict

class NotificationController:
    def __init__(self):
        self.notification_service = NotificationService()
    
    def create_notification(self, notification_data: CreateNotification) -> Dict:
        """Tạo notification mới"""
        return self.notification_service.create_notification(notification_data)
    
    def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        """Lấy danh sách notifications của user"""
        return self.notification_service.get_user_notifications(user_id, unread_only)
    
    def mark_as_read(self, user_id: str, notification_id: str) -> Dict:
        """Đánh dấu notification là đã đọc"""
        success = self.notification_service.mark_as_read(user_id, notification_id)
        if success:
            return {"success": True, "message": "Notification marked as read"}
        return {"success": False, "message": "Notification not found"}
    
    def mark_all_as_read(self, user_id: str) -> Dict:
        """Đánh dấu tất cả notifications là đã đọc"""
        count = self.notification_service.mark_all_as_read(user_id)
        return {"success": True, "count": count}
    
    def get_unread_count(self, user_id: str) -> Dict:
        """Lấy số lượng notifications chưa đọc"""
        count = self.notification_service.get_unread_count(user_id)
        return {"count": count}
    
    def delete_notification(self, user_id: str, notification_id: str) -> Dict:
        """Xóa notification"""
        success = self.notification_service.delete_notification(user_id, notification_id)
        if success:
            return {"success": True, "message": "Notification deleted"}
        return {"success": False, "message": "Notification not found"}

