"""
Schema cho Tutor Professional Profile
"""
from pydantic import BaseModel, validator
from typing import List, Optional, Dict
from datetime import datetime


class TutorProfessionalProfile(BaseModel):
    """Schema cho hồ sơ chuyên môn của Tutor"""
    tutor_id: str
    # Thông tin từ DATACORE (chỉ đọc)
    full_name: str
    ma_can_bo_mssv: str  # Mã cán bộ hoặc MSSV
    email: str
    khoa: str
    bo_mon: Optional[str] = None  # Chỉ có với giảng viên/nghiên cứu sinh
    trang_thai: str  # Trạng thái công tác hoặc học tập
    tutor_type: str  # Giảng viên, Nghiên cứu sinh, Sinh viên năm trên
    
    # Thông tin bổ sung (có thể chỉnh sửa)
    linh_vuc_chuyen_mon: Optional[List[str]] = []  # Lĩnh vực chuyên môn
    mon_phu_trach: Optional[List[str]] = []  # Môn phụ trách
    kinh_nghiem_giang_day: Optional[str] = None  # Kinh nghiệm giảng dạy
    phuong_thuc_lien_he: Optional[str] = None  # Phương thức liên hệ
    mo_ta: Optional[str] = None  # Mô tả giới thiệu
    tags: Optional[List[str]] = []  # Tags
    
    # Trạng thái phê duyệt (chỉ cho sinh viên)
    approval_status: Optional[str] = None  # "pending", "approved", "rejected"
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    
    # Lịch sử thay đổi
    history: List[Dict] = []
    
    # Metadata
    created_at: str
    updated_at: str
    is_editable: bool = True  # Có thể chỉnh sửa hay không


class UpdateTutorProfileRequest(BaseModel):
    """Schema cho yêu cầu cập nhật hồ sơ Tutor"""
    linh_vuc_chuyen_mon: Optional[List[str]] = None
    mon_phu_trach: Optional[List[str]] = None
    kinh_nghiem_giang_day: Optional[str] = None
    phuong_thuc_lien_he: Optional[str] = None
    mo_ta: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @validator('kinh_nghiem_giang_day')
    def validate_kinh_nghiem(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Kinh nghiệm giảng dạy không được vượt quá 2000 ký tự')
        return v
    
    @validator('phuong_thuc_lien_he')
    def validate_phuong_thuc(cls, v):
        if v and len(v) > 500:
            raise ValueError('Phương thức liên hệ không được vượt quá 500 ký tự')
        return v
    
    @validator('mo_ta')
    def validate_mo_ta(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Mô tả không được vượt quá 2000 ký tự')
        return v
    
    @validator('linh_vuc_chuyen_mon', 'mon_phu_trach', 'tags')
    def validate_lists(cls, v):
        if v and len(v) > 20:
            raise ValueError('Danh sách không được vượt quá 20 mục')
        return v


class ProfileHistoryItem(BaseModel):
    """Schema cho một mục trong lịch sử thay đổi"""
    field_name: str
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: str
    changed_by: str


class TutorProfileResponse(BaseModel):
    """Response schema cho Tutor Profile"""
    success: bool
    message: str
    profile: Optional[TutorProfessionalProfile] = None

