from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TutorRegistrationRequest(BaseModel):
    """Schema cho yêu cầu đăng ký Tutor"""
    user_id: str
    gpa: float  # GPA
    nam_hoc: str  # Năm học (VD: "Năm 3", "Năm 4")
    tinh_trang_hoc_tap: str  # Tình trạng học tập (VD: "Đang học", "Tốt nghiệp")
    ho_so_nang_luc: str  # Hồ sơ năng lực (mô tả)
    chung_chi: List[str] = []  # Danh sách chứng chỉ
    mon_muon_day: List[str] = []  # Danh sách môn muốn dạy
    kinh_nghiem: Optional[str] = None  # Kinh nghiệm giảng dạy
    ly_do_dang_ky: Optional[str] = None  # Lý do đăng ký

class TutorRegistration(BaseModel):
    """Schema cho hồ sơ đăng ký Tutor đã lưu"""
    registration_id: str
    user_id: str
    gpa: float
    nam_hoc: str
    tinh_trang_hoc_tap: str
    ho_so_nang_luc: str
    chung_chi: List[str] = []
    mon_muon_day: List[str] = []
    kinh_nghiem: Optional[str] = None
    ly_do_dang_ky: Optional[str] = None
    status: str  # "Chờ duyệt", "Đã phê duyệt", "Từ chối", "Yêu cầu bổ sung"
    submitted_at: str  # Thời gian nộp hồ sơ
    updated_at: Optional[str] = None  # Thời gian cập nhật cuối

class TutorRegistrationReview(BaseModel):
    """Schema cho phê duyệt/từ chối hồ sơ"""
    registration_id: str
    action: str  # "approve", "reject", "request_more_info"
    reviewed_by: str  # Người duyệt (admin username)
    reason: Optional[str] = None  # Lý do (bắt buộc nếu reject hoặc request_more_info)

class TutorRegistrationHistory(BaseModel):
    """Schema cho lịch sử phê duyệt/từ chối"""
    history_id: str
    registration_id: str
    action: str  # "approve", "reject", "request_more_info", "submit"
    reviewed_by: Optional[str] = None  # Người duyệt (None nếu là submit)
    reason: Optional[str] = None
    timestamp: str

