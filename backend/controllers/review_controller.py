from typing import List, Dict
from services.review_service import ReviewService
from schemas.review import ReviewRequest

class ReviewController:
    def __init__(self):
        self.service = ReviewService()
    
    def submit_review(self, data: ReviewRequest) -> Dict:
        """Gửi đánh giá cho buổi tư vấn"""
        return self.service.submit_review(data)
    
    def get_session_reviews(self, session_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một session"""
        return self.service.get_session_reviews(session_id)
    
    def get_user_reviews(self, user_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một user"""
        return self.service.get_user_reviews(user_id)
    
    def get_tutor_reviews(self, tutor_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một tutor"""
        return self.service.get_tutor_reviews(tutor_id)
    
    def get_user_completed_sessions(self, user_id: str) -> List[Dict]:
        """Lấy danh sách các session đã hoàn thành mà user đã tham gia (chưa đánh giá)"""
        return self.service.get_user_completed_sessions(user_id)
    
    def get_tutor_average_rating(self, tutor_id: str) -> float:
        """Tính điểm đánh giá trung bình của tutor"""
        return self.service.get_tutor_average_rating(tutor_id)

