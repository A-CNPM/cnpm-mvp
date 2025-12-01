from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime


class ScheduleItem(BaseModel):
    id: int
    time: str


class ProfileHistoryItem(BaseModel):
    field_name: str
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: str
    changed_by: str


class Profile(BaseModel):
    userID: str
    full_name: str  # Từ DATACORE - chỉ đọc
    email: str  # Từ DATACORE - chỉ đọc
    mssv: str  # Từ DATACORE - chỉ đọc
    khoa: str  # Từ DATACORE - chỉ đọc
    nganh: str  # Từ DATACORE - chỉ đọc
    trinh_do: str  # Từ DATACORE - chỉ đọc (trạng thái học tập)
    chuyen_mon: Optional[str] = None
    trinh_do_chuyen_mon: Optional[str] = None
    trinh_do_ngoai_ngu: Optional[str] = None
    mo_ta: Optional[str] = None
    tags: List[str] = []
    lich_ranh: List[ScheduleItem] = []
    # Các trường bổ sung có thể chỉnh sửa
    nhu_cau_ho_tro: Optional[str] = None  # Nhu cầu hỗ trợ
    linh_vuc_quan_tam: Optional[List[str]] = []  # Lĩnh vực quan tâm
    phuong_thuc_lien_he: Optional[str] = None  # Phương thức liên hệ
    history: List[ProfileHistoryItem] = []  # Lịch sử thay đổi


class UpdateProfileRequest(BaseModel):
    # Chỉ cho phép cập nhật các trường bổ sung, không được cập nhật thông tin từ DATACORE
    nhu_cau_ho_tro: Optional[str] = None
    linh_vuc_quan_tam: Optional[List[str]] = None
    phuong_thuc_lien_he: Optional[str] = None
    mo_ta: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @validator('nhu_cau_ho_tro')
    def validate_nhu_cau_ho_tro(cls, v):
        if v and len(v) > 1000:
            raise ValueError('Nhu cầu hỗ trợ không được vượt quá 1000 ký tự')
        return v
    
    @validator('phuong_thuc_lien_he')
    def validate_phuong_thuc_lien_he(cls, v):
        if v and len(v) > 500:
            raise ValueError('Phương thức liên hệ không được vượt quá 500 ký tự')
        return v
    
    @validator('mo_ta')
    def validate_mo_ta(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Mô tả không được vượt quá 2000 ký tự')
        return v


class UpdateProfile(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mssv: Optional[str] = None
    khoa: Optional[str] = None
    trinh_do: Optional[str] = None
    nganh: Optional[str] = None
    chuyen_mon: Optional[str] = None
    trinh_do_chuyen_mon: Optional[str] = None
    trinh_do_ngoai_ngu: Optional[str] = None
    mo_ta: Optional[str] = None
    tags: Optional[List[str]] = None
    lich_ranh: Optional[List[ScheduleItem]] = None
