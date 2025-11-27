from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SessionStatus(str, Enum):
    UPCOMING = "Sắp diễn ra"
    OPEN_REGISTRATION = "Đang mở đăng ký" 
    COMPLETED = "Hoàn thành"
    CANCELLED = "Đã hủy"

class SessionMode(str, Enum):
    ONLINE = "Online"
    OFFLINE = "Offline"

class SessionResource(BaseModel):
    resourceID: str
    session: str  # sessionID reference
    title: str
    description: Optional[str] = None
    type: str  # Document, Video, Link, etc.
    url: str
    uploadedBy: str  # tutorID (userID từ profile)
    accessLevel: str  # Public, Private, Restricted
    uploadDate: str  # Format: dd/mm/yyyy HH:MM

class Session(BaseModel):
    sessionID: str
    tutor: str  # userID reference từ Profile
    participants: List[str] = []  # list of userIDs từ Profile
    topic: str
    mode: SessionMode  # Online/Offline
    status: SessionStatus  # Sử dụng enum cho trạng thái
    startTime: str  # Format: dd/mm/yyyy HH:MM
    endTime: str  # Format: dd/mm/yyyy HH:MM
    maxParticipants: int
    resources: List[SessionResource] = []
    location: str
    content: Optional[str] = None
    
    

class CreateSession(BaseModel):
    tutor: str  # userID từ Profile
    topic: str
    mode: SessionMode  # Online/Offline
    startTime: str  # Format: dd/mm/yyyy HH:MM
    endTime: str  # Format: dd/mm/yyyy HH:MM
    maxParticipants: int

class UpdateSession(BaseModel):
    topic: Optional[str] = None
    mode: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    maxParticipants: Optional[int] = None
    status: Optional[SessionStatus] = None
