from typing import Optional, Dict, List
from services.progress_tracking_service import ProgressTrackingService
from schemas.progress_tracking import (
    CreateProgressTrackingRequest,
    UpdateProgressTrackingRequest
)

class ProgressTrackingController:
    def __init__(self):
        self.service = ProgressTrackingService()
    
    def create_progress_tracking(self, data: CreateProgressTrackingRequest, tutor_id: str) -> Dict:
        """Tạo ghi nhận tiến bộ/hạn chế"""
        return self.service.create_progress_tracking(data, tutor_id)
    
    def update_progress_tracking(self, tracking_id: str, data: UpdateProgressTrackingRequest, tutor_id: str) -> Dict:
        """Cập nhật ghi nhận tiến bộ"""
        return self.service.update_progress_tracking(tracking_id, data, tutor_id)
    
    def delete_progress_tracking(self, tracking_id: str, tutor_id: str) -> Dict:
        """Xóa ghi nhận tiến bộ"""
        return self.service.delete_progress_tracking(tracking_id, tutor_id)
    
    def get_mentee_progress_trackings(self, mentee_id: str, tutor_id: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một mentee"""
        return self.service.get_mentee_progress_trackings(mentee_id, tutor_id)
    
    def get_session_progress_trackings(self, session_id: str, tutor_id: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một session"""
        return self.service.get_session_progress_trackings(session_id, tutor_id)
    
    def get_tutor_progress_trackings(self, tutor_id: str) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một tutor"""
        return self.service.get_tutor_progress_trackings(tutor_id)
    
    def get_mentee_progress_summary(self, mentee_id: str, tutor_id: Optional[str] = None) -> Dict:
        """Lấy tổng hợp tiến bộ của một mentee"""
        return self.service.get_mentee_progress_summary(mentee_id, tutor_id)
    
    def get_tutor_sessions_with_feedback(self, tutor_id: str) -> List[Dict]:
        """Lấy danh sách sessions của tutor kèm phản hồi từ mentee"""
        return self.service.get_tutor_sessions_with_feedback(tutor_id)

