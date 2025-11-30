from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AvailableSlot(BaseModel):
    """Schema cho lịch rảnh của tutor"""
    slot_id: str
    tutor_id: str
    start_time: str  # Format: "01/11/2025 12:00"
    end_time: str    # Format: "01/11/2025 14:00"
    topic: Optional[str] = None  # Chủ đề (tùy chọn)
    max_participants: int  # Số lượng tối đa
    mode: str  # "Online" hoặc "Offline"
    location: Optional[str] = None  # Địa điểm (nếu Offline) hoặc link (nếu Online)
    registered_participants: List[str] = []  # Danh sách user_id đã đăng ký
    status: str  # "Mở đăng ký", "Đã đóng", "Đã chuyển thành session"
    min_participants: int = 1  # Ngưỡng tối thiểu để chuyển thành session
    created_at: str
    closed_at: Optional[str] = None  # Thời gian đóng đăng ký

class CreateAvailableSlot(BaseModel):
    """Schema cho tạo lịch rảnh mới"""
    tutor_id: str
    start_time: str
    end_time: str
    topic: Optional[str] = None
    max_participants: int
    mode: str
    location: Optional[str] = None
    min_participants: int = 1

class RegisterSlotRequest(BaseModel):
    """Schema cho đăng ký lịch rảnh"""
    slot_id: str
    user_id: str

class ChangeSlotRequest(BaseModel):
    """Schema cho thay đổi lịch đã đăng ký"""
    old_slot_id: str
    new_slot_id: str
    user_id: str

class CloseSlotRequest(BaseModel):
    """Schema cho đóng đăng ký lịch rảnh (chuyển thành session)"""
    slot_id: str
    tutor_id: str

class UpdateAvailableSlot(BaseModel):
    """Schema cho cập nhật lịch rảnh"""
    slot_id: str
    tutor_id: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    topic: Optional[str] = None
    max_participants: Optional[int] = None
    mode: Optional[str] = None
    location: Optional[str] = None
    min_participants: Optional[int] = None

class ConfirmSlotRequest(BaseModel):
    """Schema cho xác nhận slot (chuyển thành session)"""
    slot_id: str
    tutor_id: str

class CancelSlotRequest(BaseModel):
    """Schema cho hủy slot"""
    slot_id: str
    tutor_id: str
    reason: Optional[str] = None

class ProposeRescheduleRequest(BaseModel):
    """Schema cho đề xuất đổi lịch"""
    slot_id: str
    tutor_id: str
    new_start_time: str
    new_end_time: str
    new_location: Optional[str] = None
    reason: Optional[str] = None

class ChangeResponseRequest(BaseModel):
    """Schema cho phản hồi thay đổi (Đồng ý/Từ chối)"""
    change_request_id: str
    user_id: str
    response: str  # "accept" hoặc "reject"

