from fastapi import APIRouter, HTTPException, status, Query
from controllers.progress_tracking_controller import ProgressTrackingController
from schemas.progress_tracking import (
    CreateProgressTrackingRequest,
    UpdateProgressTrackingRequest
)
from typing import Optional, List

router = APIRouter(prefix="/progress-tracking", tags=["progress-tracking"])
progress_tracking_controller = ProgressTrackingController()

@router.post("/create")
def create_progress_tracking(
    data: CreateProgressTrackingRequest,
    tutor_id: str = Query(..., description="ID của tutor")
):
    """Tạo ghi nhận tiến bộ/hạn chế học tập"""
    result = progress_tracking_controller.create_progress_tracking(data, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.put("/{tracking_id}")
def update_progress_tracking(
    tracking_id: str,
    data: UpdateProgressTrackingRequest,
    tutor_id: str = Query(..., description="ID của tutor")
):
    """Cập nhật ghi nhận tiến bộ"""
    result = progress_tracking_controller.update_progress_tracking(tracking_id, data, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.delete("/{tracking_id}")
def delete_progress_tracking(
    tracking_id: str,
    tutor_id: str = Query(..., description="ID của tutor")
):
    """Xóa ghi nhận tiến bộ"""
    result = progress_tracking_controller.delete_progress_tracking(tracking_id, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/mentee/{mentee_id}")
def get_mentee_progress_trackings(
    mentee_id: str,
    tutor_id: Optional[str] = Query(None, description="ID của tutor để lọc")
):
    """Lấy tất cả ghi nhận tiến bộ của một mentee"""
    return progress_tracking_controller.get_mentee_progress_trackings(mentee_id, tutor_id)

@router.get("/session/{session_id}")
def get_session_progress_trackings(
    session_id: str,
    tutor_id: Optional[str] = Query(None, description="ID của tutor để lọc")
):
    """Lấy tất cả ghi nhận tiến bộ của một session"""
    return progress_tracking_controller.get_session_progress_trackings(session_id, tutor_id)

@router.get("/tutor/{tutor_id}")
def get_tutor_progress_trackings(tutor_id: str):
    """Lấy tất cả ghi nhận tiến bộ của một tutor"""
    return progress_tracking_controller.get_tutor_progress_trackings(tutor_id)

@router.get("/mentee/{mentee_id}/summary")
def get_mentee_progress_summary(
    mentee_id: str,
    tutor_id: Optional[str] = Query(None, description="ID của tutor để lọc")
):
    """Lấy tổng hợp tiến bộ của một mentee"""
    return progress_tracking_controller.get_mentee_progress_summary(mentee_id, tutor_id)

@router.get("/tutor/{tutor_id}/sessions-with-feedback")
def get_tutor_sessions_with_feedback(tutor_id: str):
    """Lấy danh sách sessions của tutor kèm phản hồi từ mentee"""
    return progress_tracking_controller.get_tutor_sessions_with_feedback(tutor_id)

