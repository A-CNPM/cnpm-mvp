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
    accessLevel: str  # Public, Private, Restricted
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
