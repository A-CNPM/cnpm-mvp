from typing import Optional, Dict, List
from services.tutor_registration_service import TutorRegistrationService
from schemas.tutor_registration import (
    TutorRegistrationRequest,
    TutorRegistrationReview
)

class TutorRegistrationController:
    def __init__(self):
        self.service = TutorRegistrationService()
    
    def submit_registration(self, data: TutorRegistrationRequest) -> Dict:
        """Nộp hồ sơ đăng ký Tutor"""
        return self.service.submit_registration(data)
    
    def get_user_registration(self, user_id: str) -> Optional[Dict]:
        """Lấy hồ sơ đăng ký của user"""
        return self.service.get_user_registration(user_id)
    
    def get_all_registrations(self, status: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả hồ sơ đăng ký (cho admin)"""
        return self.service.get_all_registrations(status)
    
    def review_registration(self, review: TutorRegistrationReview) -> Dict:
        """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ"""
        return self.service.review_registration(review)
    
    def update_registration(self, registration_id: str, data: TutorRegistrationRequest) -> Dict:
        """Cập nhật hồ sơ đăng ký"""
        return self.service.update_registration(registration_id, data)
    
    def get_registration_history(self, registration_id: str) -> List[Dict]:
        """Lấy lịch sử của một hồ sơ đăng ký"""
        return self.service.get_registration_history(registration_id)

