from fastapi import APIRouter, HTTPException, status
from controllers.chatbot_controller import ChatbotController
from schemas.chatbot import ChatRequest, ChatResponse
from typing import List, Dict

router = APIRouter(prefix="/chatbot", tags=["chatbot"])
chatbot_controller = ChatbotController()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Gửi tin nhắn đến chatbot và nhận phản hồi"""
    try:
        return chatbot_controller.process_message(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/conversation/{conversation_id}")
def get_conversation(conversation_id: str):
    """Lấy thông tin conversation"""
    conversation = chatbot_controller.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conversation

@router.get("/user/{user_id}/conversations")
def get_user_conversations(user_id: str):
    """Lấy tất cả conversations của user"""
    return chatbot_controller.get_user_conversations(user_id)

