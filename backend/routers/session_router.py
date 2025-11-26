from fastapi import APIRouter, HTTPException, status, Body
from controllers.session_controller import SessionController
from schemas.session import Session, CreateSession, UpdateSession, SessionResource
from typing import List

router = APIRouter(prefix="/session", tags=["session"])
session_controller = SessionController()

@router.get("/{session_id}", response_model=Session)
def get_session(session_id: str):
    """Lấy thông tin chi tiết session"""
    session = session_controller.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.get("/user/{user_id}", response_model=List[Session])
def get_user_sessions(user_id: str):
    """Lấy danh sách sessions của user (tutor hoặc mentee)"""
    return session_controller.get_user_sessions(user_id)

@router.post("/create", response_model=Session)
def create_session(data: CreateSession):
    """Tạo session mới - TutorSessionView"""
    return session_controller.create_session(data)

@router.put("/{session_id}", response_model=Session)
def update_session(session_id: str, data: UpdateSession):
    """Cập nhật session - TutorSessionView"""
    session = session_controller.update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: str):
    """Xóa session - TutorSessionView"""
    result = session_controller.delete_session(session_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/{session_id}/register")
def register_session(session_id: str, mentee_id: str = Body(..., embed=True)):
    """Đăng ký tham gia session - MenteeSessionView"""
    result = session_controller.register_session(session_id, mentee_id)
    if not result["success"]:
        if "full" in result["message"].lower():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result["message"])
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/{session_id}/cancel")
def cancel_session(session_id: str, mentee_id: str = Body(..., embed=True)):
    """Hủy đăng ký session - MenteeSessionView"""
    result = session_controller.cancel_session(session_id, mentee_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/{session_id}/resources")
def get_session_resources(session_id: str):
    """Lấy danh sách tài nguyên của session"""
    return session_controller.get_session_resources(session_id)

@router.post("/{session_id}/upload-resource")
def upload_resource(session_id: str, resource: SessionResource):
    """Upload tài nguyên vào session - TutorSessionView"""
    result = session_controller.upload_resource(session_id, resource)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/{session_id}/download-resource/{resource_id}")
def download_resource(session_id: str, resource_id: str):
    """Download tài nguyên từ session"""
    resource = session_controller.download_resource(session_id, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource
