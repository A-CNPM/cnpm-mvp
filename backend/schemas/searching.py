from pydantic import BaseModel
from typing import List, Optional

class SearchCriteria(BaseModel):
    keyword: Optional[str] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = None
    major: Optional[str] = None
    khoa: Optional[str] = None  # Khoa/bộ môn
    mon_hoc: Optional[str] = None  # Môn học
    available_time: Optional[str] = None  # Thời gian rảnh
    chuyen_mon: Optional[str] = None  # Lĩnh vực chuyên môn

class Tutor(BaseModel):
    tutorID: str
    full_name: str
    email: str
    rating: float
    major: str
    tags: List[str] = []
    profile: Optional[str] = None

class SuggestedTutor(BaseModel):
    tutorID: str
    score: float

class SessionSearchCriteria(BaseModel):
    keyword: Optional[str] = None        # Tìm theo topic hoặc content
    mode: Optional[str] = None           # Online/Offline
    date_from: Optional[str] = None      # Tìm từ ngày...
    date_to: Optional[str] = None        # ...đến ngày
    tutor_name: Optional[str] = None     # Tìm theo tên gia sư
    status: Optional[str] = None         # Khởi tạo, Đã kết thúc...