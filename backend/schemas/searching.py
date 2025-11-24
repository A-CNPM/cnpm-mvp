from pydantic import BaseModel
from typing import List, Optional

class SearchCriteria(BaseModel):
    keyword: Optional[str] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = None
    major: Optional[str] = None
    available_time: Optional[str] = None

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
