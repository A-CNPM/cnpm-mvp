from fastapi import APIRouter, HTTPException, status, Query
from controllers.tutor_registration_controller import TutorRegistrationController
from schemas.tutor_registration import (
    TutorRegistrationRequest,
    TutorRegistration,
    TutorRegistrationReview
)
from typing import List, Optional
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/tutor-registration", tags=["tutor-registration"])
controller = TutorRegistrationController()

@router.post("/submit")
def submit_registration(data: TutorRegistrationRequest):
    """Nộp hồ sơ đăng ký Tutor"""
    result = controller.submit_registration(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/user/{user_id}", response_model=Optional[TutorRegistration])
def get_user_registration(user_id: str):
    """Lấy hồ sơ đăng ký của user"""
    registration = controller.get_user_registration(user_id)
    return registration  # Trả về None nếu không tìm thấy (không raise 404)

@router.get("/all")
def get_all_registrations(status: Optional[str] = Query(None, description="Lọc theo trạng thái")):
    """Lấy tất cả hồ sơ đăng ký (cho admin)"""
    return controller.get_all_registrations(status)

@router.post("/review")
def review_registration(review: TutorRegistrationReview):
    """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ (cho admin)"""
    result = controller.review_registration(review)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.put("/{registration_id}")
def update_registration(registration_id: str, data: TutorRegistrationRequest):
    """Cập nhật hồ sơ đăng ký (khi yêu cầu bổ sung)"""
    result = controller.update_registration(registration_id, data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/{registration_id}/history")
def get_registration_history(registration_id: str):
    """Lấy lịch sử của một hồ sơ đăng ký"""
    return controller.get_registration_history(registration_id)

