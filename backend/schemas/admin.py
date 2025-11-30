"""
Schema cho Admin
"""
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class AdminLoginRequest(BaseModel):
    """Schema cho yêu cầu đăng nhập Admin"""
    email: str
    password: str

class TutorApprovalRequest(BaseModel):
    """Schema cho yêu cầu phê duyệt/từ chối Tutor"""
    registration_id: str
    action: str  # "approve", "reject", "request_more_info"
    reason: Optional[str] = None
    admin_id: str

class UserSearchCriteria(BaseModel):
    """Schema cho tiêu chí tìm kiếm user"""
    keyword: Optional[str] = None
    role: Optional[str] = None  # "Mentee", "Tutor"
    khoa: Optional[str] = None
    bo_mon: Optional[str] = None
    status: Optional[str] = None  # Cho tutor: "approved", "pending", "rejected"

class ActivityReport(BaseModel):
    """Schema cho báo cáo hoạt động"""
    total_sessions: int
    completed_sessions: int
    cancelled_sessions: int
    rescheduled_sessions: int
    total_participants: int
    participation_rate: float
    sessions_by_month: List[Dict]
    sessions_by_tutor: List[Dict]

class QualityReport(BaseModel):
    """Schema cho báo cáo chất lượng"""
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[str, int]  # {"5": 10, "4": 5, ...}
    reviews_by_tutor: List[Dict]
    recent_reviews: List[Dict]
    common_feedback: List[str]

