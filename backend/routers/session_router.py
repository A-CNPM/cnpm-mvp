from fastapi import APIRouter, HTTPException, status, Body, Query
from controllers.session_controller import SessionController
from schemas.session import (
    Session, CreateSession, UpdateSession, SessionResource,
    CreateResourceRequest, UpdateResourceRequest,
    CreateSessionNoteRequest, UpdateSessionNoteRequest,
    CancelSessionRequest, RescheduleSessionRequest, SessionChangeResponseRequest
)
from typing import List, Optional

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

@router.post("/{session_id}/mark-absence")
def mark_absence(session_id: str, mentee_id: str = Body(..., embed=True)):
    """Ghi nhận vi phạm: mentee không tham gia buổi đã đăng ký"""
    result = session_controller.mark_absence(session_id, mentee_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/{session_id}/resources")
def get_session_resources(session_id: str, user_id: Optional[str] = Query(None, description="ID của user để lọc theo quyền")):
    """Lấy danh sách tài nguyên của session (lọc theo quyền truy cập)"""
    return session_controller.get_session_resources(session_id, user_id)

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

@router.post("/{session_id}/resources/create")
def create_resource(session_id: str, data: CreateResourceRequest, tutor_id: str = Query(..., description="ID của tutor")):
    """Tạo resource mới cho session"""
    # Tạo dict mới với session_id từ URL
    data_dict = data.dict()
    data_dict["session_id"] = session_id
    data_with_session = CreateResourceRequest(**data_dict)
    result = session_controller.create_resource(data_with_session, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.put("/{session_id}/resources/{resource_id}")
def update_resource(session_id: str, resource_id: str, data: UpdateResourceRequest, tutor_id: str = Query(..., description="ID của tutor")):
    """Cập nhật resource"""
    result = session_controller.update_resource(session_id, resource_id, data, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.delete("/{session_id}/resources/{resource_id}")
def delete_resource(session_id: str, resource_id: str, tutor_id: str = Query(..., description="ID của tutor")):
    """Xóa resource"""
    result = session_controller.delete_resource(session_id, resource_id, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/{session_id}/notes")
def create_session_note(session_id: str, data: CreateSessionNoteRequest, tutor_id: str = Query(..., description="ID của tutor")):
    """Tạo ghi chú/biên bản buổi tư vấn"""
    # Tạo dict mới với session_id từ URL
    data_dict = data.dict()
    data_dict["session_id"] = session_id
    data_with_session = CreateSessionNoteRequest(**data_dict)
    result = session_controller.create_session_note(data_with_session, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/{session_id}/notes")
def get_session_notes(session_id: str, user_id: Optional[str] = Query(None, description="ID của user để lọc theo quyền")):
    """Lấy danh sách ghi chú của session"""
    return session_controller.get_session_notes(session_id, user_id)

@router.put("/notes/{note_id}")
def update_session_note(note_id: str, data: UpdateSessionNoteRequest, tutor_id: str = Query(..., description="ID của tutor")):
    """Cập nhật ghi chú/biên bản"""
    result = session_controller.update_session_note(note_id, data, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.delete("/notes/{note_id}")
def delete_session_note(note_id: str, tutor_id: str = Query(..., description="ID của tutor")):
    """Xóa ghi chú"""
    result = session_controller.delete_session_note(note_id, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/cancel")
def cancel_session_by_tutor(data: CancelSessionRequest):
    """Tutor hủy session - gửi thông báo cho participants"""
    result = session_controller.cancel_session_by_tutor(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/reschedule")
def reschedule_session_by_tutor(data: RescheduleSessionRequest):
    """Tutor đề xuất đổi lịch session - gửi thông báo cho participants"""
    result = session_controller.reschedule_session_by_tutor(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/change/respond")
def respond_to_session_change(data: SessionChangeResponseRequest):
    """Mentee phản hồi thay đổi session (Đồng ý/Từ chối)"""
    result = session_controller.respond_to_session_change(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result
