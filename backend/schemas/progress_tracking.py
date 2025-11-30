from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProgressTracking(BaseModel):
    """Schema cho theo dõi tiến bộ học tập"""
    tracking_id: str
    session_id: str
    mentee_id: str  # ID của sinh viên được theo dõi
    tutor_id: str  # ID của tutor ghi nhận
    progress_type: str  # "progress" (tiến bộ) hoặc "limitation" (hạn chế)
    content: str  # Nội dung mô tả tiến bộ hoặc hạn chế
    created_at: str  # Thời gian ghi nhận
    updated_at: Optional[str] = None

class CreateProgressTrackingRequest(BaseModel):
    """Schema cho tạo theo dõi tiến bộ mới"""
    session_id: str
    mentee_id: str
    progress_type: str  # "progress" hoặc "limitation"
    content: str

class UpdateProgressTrackingRequest(BaseModel):
    """Schema cho cập nhật theo dõi tiến bộ"""
    progress_type: Optional[str] = None
    content: Optional[str] = None

class ProgressTrackingSummary(BaseModel):
    """Schema cho tổng hợp theo dõi tiến bộ của một mentee"""
    mentee_id: str
    mentee_name: str
    total_sessions: int
    total_progress_records: int
    total_limitation_records: int
    recent_trackings: List[dict]  # Danh sách các ghi nhận gần đây
    average_rating: Optional[float] = None  # Điểm đánh giá trung bình từ mentee

