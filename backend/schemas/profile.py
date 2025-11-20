from pydantic import BaseModel
from typing import List, Optional

class ScheduleItem(BaseModel):
    id: int
    time: str


class Profile(BaseModel):
    userID: str
    full_name: str
    email: str
    mssv: str
    khoa: str
    trinh_do: str
    nganh: str
    chuyen_mon: str
    trinh_do_chuyen_mon: str
    trinh_do_ngoai_ngu: str
    mo_ta: Optional[str] = None
    tags: List[str] = []
    lich_ranh: List[ScheduleItem] = []

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
