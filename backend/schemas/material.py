from pydantic import BaseModel
from typing import Optional, List

class Material(BaseModel):
    material_id: str
    title: str
    description: Optional[str] = None
    type: str  # Document, Video, Code, etc.
    category: str
    subject: str
    file_url: str
    file_size: str
    file_format: str
    uploaded_by: str
    uploaded_at: str
    library_id: Optional[str] = None  # ID từ HCMUT_LIBRARY
    access_level: str  # Public, Private, Restricted
    download_count: int = 0
    tags: List[str] = []
    tutor_name: Optional[str] = None
    related_session: Optional[dict] = None

class MaterialSearchCriteria(BaseModel):
    keyword: Optional[str] = None
    category: Optional[str] = None
    subject: Optional[str] = None
    material_type: Optional[str] = None

