from fastapi import APIRouter, HTTPException, status
from controllers.notification_controller import NotificationController
from schemas.notification import CreateNotification, Notification
from typing import List, Dict

router = APIRouter(prefix="/notifications", tags=["notifications"])
notification_controller = NotificationController()

@router.post("", response_model=Notification)
def create_notification(notification_data: CreateNotification):
    """Tạo notification mới"""
    return notification_controller.create_notification(notification_data)

@router.get("/user/{user_id}", response_model=List[Notification])
def get_user_notifications(user_id: str, unread_only: bool = False):
    """Lấy danh sách notifications của user"""
    return notification_controller.get_user_notifications(user_id, unread_only)

@router.put("/user/{user_id}/read/{notification_id}")
def mark_as_read(user_id: str, notification_id: str):
    """Đánh dấu notification là đã đọc"""
    return notification_controller.mark_as_read(user_id, notification_id)

@router.put("/user/{user_id}/read-all")
def mark_all_as_read(user_id: str):
    """Đánh dấu tất cả notifications là đã đọc"""
    return notification_controller.mark_all_as_read(user_id)

@router.get("/user/{user_id}/unread-count")
def get_unread_count(user_id: str):
    """Lấy số lượng notifications chưa đọc"""
    return notification_controller.get_unread_count(user_id)

@router.delete("/user/{user_id}/{notification_id}")
def delete_notification(user_id: str, notification_id: str):
    """Xóa notification"""
    return notification_controller.delete_notification(user_id, notification_id)

