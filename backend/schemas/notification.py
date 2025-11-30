from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Notification(BaseModel):
    notification_id: str
    user_id: str
    type: str  # "profile_update", "tutor_registration", "slot_cancelled", "slot_changed", "slot_to_session", "review_submitted"
    title: str
    message: str
    is_read: bool = False
    created_at: str
    related_id: Optional[str] = None  # ID của item liên quan (session_id, slot_id, registration_id, etc.)
    action_url: Optional[str] = None  # URL để điều hướng khi click vào notification

class CreateNotification(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    related_id: Optional[str] = None
    action_url: Optional[str] = None

