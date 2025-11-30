from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ForumPost(BaseModel):
    """Schema cho bài đăng diễn đàn"""
    post_id: str
    author_id: str
    author_name: str
    title: str
    content: str
    category: str  # "Học thuật", "Kỹ năng mềm", "Định hướng nghề nghiệp"
    attachments: List[dict] = []  # Danh sách tài liệu đính kèm
    likes: int = 0
    views: int = 0
    comments_count: int = 0
    created_at: str
    updated_at: Optional[str] = None
    is_pinned: bool = False
    is_locked: bool = False
    status: str = "active"  # active, deleted, hidden

class CreatePostRequest(BaseModel):
    """Schema cho yêu cầu tạo bài đăng"""
    author_id: str
    title: str
    content: str
    category: str
    attachments: List[dict] = []

class UpdatePostRequest(BaseModel):
    """Schema cho yêu cầu cập nhật bài đăng"""
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class ForumComment(BaseModel):
    """Schema cho bình luận"""
    comment_id: str
    post_id: str
    author_id: str
    author_name: str
    content: str
    created_at: str
    updated_at: Optional[str] = None
    likes: int = 0
    status: str = "active"

class CreateCommentRequest(BaseModel):
    """Schema cho yêu cầu tạo bình luận"""
    post_id: str
    author_id: str
    content: str

class PostSearchCriteria(BaseModel):
    """Schema cho tiêu chí tìm kiếm bài đăng"""
    keyword: Optional[str] = None
    category: Optional[str] = None
    author_id: Optional[str] = None
    sort_by: Optional[str] = "latest"  # latest, popular, most_commented

