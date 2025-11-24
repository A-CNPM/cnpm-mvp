from pydantic import BaseModel
from typing import List, Optional

class SessionResource(BaseModel):
    id: str
    url: str
    name: str

class Session(BaseModel):
    sessionID: str
    topic: str
    time: str
    created_date: str
    mode: str
    student_count: int
    location: str
    status: str
    resources: List[SessionResource] = []
    content: Optional[str] = None
    tutorID: str
    menteeIDs: List[str] = []

class CreateSession(BaseModel):
    topic: str
    time: str
    created_date: str
    mode: str
    student_count: int
    location: str
    tutorID: str
    content: Optional[str] = None

class UpdateSession(BaseModel):
    topic: Optional[str] = None
    time: Optional[str] = None
    mode: Optional[str] = None
    student_count: Optional[int] = None
    location: Optional[str] = None
    status: Optional[str] = None
    content: Optional[str] = None
    resources: Optional[List[SessionResource]] = None
