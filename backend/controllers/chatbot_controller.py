from services.chatbot_service import ChatbotService
from schemas.chatbot import ChatRequest, ChatResponse
from typing import Optional, List, Dict

class ChatbotController:
    def __init__(self):
        self.service = ChatbotService()

    def process_message(self, request: ChatRequest) -> ChatResponse:
        """Xử lý tin nhắn và trả về phản hồi"""
        return self.service.process_message(request)

    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        """Lấy thông tin conversation"""
        return self.service.get_conversation(conversation_id)

    def get_user_conversations(self, user_id: str) -> List[Dict]:
        """Lấy tất cả conversations của user"""
        return self.service.get_user_conversations(user_id)

