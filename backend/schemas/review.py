from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewRequest(BaseModel):
    """Schema cho yêu cầu đánh giá buổi tư vấn"""
    session_id: str
    user_id: str  # ID của mentee đánh giá
    rating: int  # Đánh giá từ 1-5
    comment: Optional[str] = None  # Nhận xét

class Review(BaseModel):
    """Schema cho đánh giá đã lưu"""
    review_id: str
    session_id: str
    user_id: str
    tutor_id: str  # ID của tutor được đánh giá
    rating: int
    comment: Optional[str] = None
    created_at: str  # Thời gian tạo đánh giá

class ReviewSummary(BaseModel):
    """Schema cho tổng hợp đánh giá"""
    session_id: str
    session_topic: str
    tutor_id: str
    tutor_name: str
    average_rating: float
    total_reviews: int
    reviews: list  # Danh sách các đánh giá

