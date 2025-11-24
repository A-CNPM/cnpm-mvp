from fastapi import APIRouter, HTTPException, status
from controllers.session_controller import SessionController
from schemas.session import Session, CreateSession, UpdateSession, SessionResource
from typing import List

router = APIRouter(prefix="/session", tags=["session"])
session_controller = SessionController()

@router.get("/{session_id}", response_model=Session)
def get_session(session_id: str):
    session = session_controller.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.get("/user/{user_id}", response_model=List[Session])
def get_user_sessions(user_id: str):
    return session_controller.get_user_sessions(user_id)

@router.post("/create", response_model=Session)
def create_session(data: CreateSession):
    return session_controller.create_session(data)

@router.put("/{session_id}", response_model=Session)
def update_session(session_id: str, data: UpdateSession):
    session = session_controller.update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: str):
    success = session_controller.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return {"detail": "Delete successful"}

@router.post("/{session_id}/register")
def register_session(session_id: str, mentee_id: str):
    success = session_controller.register_session(session_id, mentee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or mentee invalid")
    return {"detail": "Register successful"}

@router.post("/{session_id}/cancel")
def cancel_session(session_id: str, mentee_id: str):
    success = session_controller.cancel_session(session_id, mentee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or mentee invalid")
    return {"detail": "Cancel successful"}

@router.get("/{session_id}/resources", response_model=List[SessionResource])
def get_session_resources(session_id: str):
    return session_controller.get_session_resources(session_id)

@router.post("/{session_id}/upload-resource")
def upload_resource(session_id: str, resource: SessionResource):
    success = session_controller.upload_resource(session_id, resource)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return {"detail": "Upload successful"}

@router.get("/{session_id}/download-resource/{resource_id}", response_model=SessionResource)
def download_resource(session_id: str, resource_id: str):
    resource = session_controller.download_resource(session_id, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource
