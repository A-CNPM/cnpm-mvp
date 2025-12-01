from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # "user" hoặc "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatConversation(BaseModel):
    conversation_id: str
    user_id: str
    messages: List[ChatMessage]
    created_at: str
    updated_at: str
    matched_tutors: Optional[List[str]] = None  # Danh sách tutor IDs được match


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None  # Nếu None thì tạo conversation mới
    user_id: str


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    matched_tutors: Optional[List[dict]] = None  # Thông tin tutor được match
    suggestions: Optional[List[str]] = None  # Gợi ý câu hỏi tiếp theo

