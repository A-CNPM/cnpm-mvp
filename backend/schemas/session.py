from pydantic import BaseModel
from typing import List, Optional

class SessionResource(BaseModel):
    resourceID: str
    session: str  # sessionID reference
    title: str
    description: Optional[str] = None
    type: str  # Document, Video, Link, etc.
    url: str
    uploadedBy: str  # tutorID (userID từ profile)
    accessLevel: str  # draft, private, session, public
    allowedMentees: Optional[List[str]] = []  # Danh sách mentee được phép truy cập (nếu accessLevel = "private")
    source: Optional[str] = None  # "upload" hoặc "library" (HCMUT_LIBRARY)
    libraryResourceId: Optional[str] = None  # ID tài liệu từ HCMUT_LIBRARY nếu source = "library"
    uploadDate: str

class Session(BaseModel):
    sessionID: str
    tutor: str  # userID reference từ Profile
    participants: List[str] = []  # list of userIDs từ Profile
    topic: str
    mode: str  # Online/Offline
    status: str  # Khởi tạo, Đã xác nhận, Đã hoàn thành, Đã huỷ, etc.
    startTime: str  # ISO format datetime string
    endTime: str
    maxParticipants: int
    resources: List[SessionResource] = []
    location: str
    content: Optional[str] = None
    
    

class CreateSession(BaseModel):
    tutor: str  # userID từ Profile
    topic: str
    mode: str  # Online/Offline
    startTime: str
    endTime: str
    maxParticipants: int

class UpdateSession(BaseModel):
    topic: Optional[str] = None
    mode: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    maxParticipants: Optional[int] = None
    status: Optional[str] = None
    content: Optional[str] = None  # Ghi chú/biên bản buổi tư vấn

class CreateResourceRequest(BaseModel):
    """Schema cho tạo resource mới"""
    session_id: Optional[str] = None  # Sẽ được set từ URL path
    title: str
    description: Optional[str] = None
    type: str  # Document, Video, Link, etc.
    url: str
    accessLevel: str  # draft, private, session, public
    allowedMentees: Optional[List[str]] = []  # Danh sách mentee được phép truy cập (nếu accessLevel = "private")
    source: Optional[str] = "upload"  # "upload" hoặc "library"
    libraryResourceId: Optional[str] = None  # ID tài liệu từ HCMUT_LIBRARY

class UpdateResourceRequest(BaseModel):
    """Schema cho cập nhật resource"""
    title: Optional[str] = None
    description: Optional[str] = None
    accessLevel: Optional[str] = None
    allowedMentees: Optional[List[str]] = None

class SessionNote(BaseModel):
    """Schema cho ghi chú/biên bản buổi tư vấn"""
    note_id: str
    session_id: str
    content: str
    created_by: str  # tutorID
    created_at: str
    updated_at: Optional[str] = None
    is_draft: bool = False  # True nếu là nháp, False nếu đã hoàn thành

class CreateSessionNoteRequest(BaseModel):
    """Schema cho tạo ghi chú mới"""
    session_id: Optional[str] = None  # Sẽ được set từ URL path
    content: str
    is_draft: bool = False

class UpdateSessionNoteRequest(BaseModel):
    """Schema cho cập nhật ghi chú"""
    content: str
    is_draft: Optional[bool] = None

class CancelSessionRequest(BaseModel):
    """Schema cho tutor hủy session"""
    session_id: str
    tutor_id: str
    reason: Optional[str] = None

class RescheduleSessionRequest(BaseModel):
    """Schema cho tutor đề xuất đổi lịch session"""
    session_id: str
    tutor_id: str
    new_start_time: str
    new_end_time: str
    new_location: Optional[str] = None
    reason: Optional[str] = None

class SessionChangeResponseRequest(BaseModel):
    """Schema cho mentee phản hồi thay đổi session"""
    change_request_id: str
    user_id: str
    response: str  # "accept" hoặc "reject"
