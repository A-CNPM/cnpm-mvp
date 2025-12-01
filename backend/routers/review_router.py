from fastapi import APIRouter, HTTPException, status
from controllers.review_controller import ReviewController
from schemas.review import ReviewRequest
from typing import List

router = APIRouter(prefix="/review", tags=["review"])
controller = ReviewController()

@router.post("/submit")
def submit_review(data: ReviewRequest):
    """Gửi đánh giá cho buổi tư vấn"""
    result = controller.submit_review(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/session/{session_id}")
def get_session_reviews(session_id: str):
    """Lấy tất cả đánh giá của một session"""
    return controller.get_session_reviews(session_id)

@router.get("/user/{user_id}")
def get_user_reviews(user_id: str):
    """Lấy tất cả đánh giá của một user"""
    return controller.get_user_reviews(user_id)

@router.get("/tutor/{tutor_id}")
def get_tutor_reviews(tutor_id: str):
    """Lấy tất cả đánh giá của một tutor"""
    return controller.get_tutor_reviews(tutor_id)

@router.get("/user/{user_id}/completed-sessions")
def get_user_completed_sessions(user_id: str):
    """Lấy danh sách các session đã hoàn thành mà user đã tham gia (chưa đánh giá)"""
    return controller.get_user_completed_sessions(user_id)

@router.get("/tutor/{tutor_id}/average-rating")
def get_tutor_average_rating(tutor_id: str):
    """Tính điểm đánh giá trung bình của tutor"""
    return {"tutor_id": tutor_id, "average_rating": controller.get_tutor_average_rating(tutor_id)}

