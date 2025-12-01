"""
Controller xử lý request/response cho Tutor Professional Profile
"""
from typing import Optional, Dict
from services.tutor_profile_service import TutorProfileService
from schemas.tutor_profile import UpdateTutorProfileRequest


class TutorProfileController:
    def __init__(self):
        self.service = TutorProfileService()

    def get_profile(self, tutor_id: str) -> Optional[Dict]:
        """Lấy thông tin hồ sơ chuyên môn của Tutor"""
        return self.service.get_profile(tutor_id)

    def update_profile(self, tutor_id: str, update_data: UpdateTutorProfileRequest, changed_by: str = None) -> Dict:
        """Cập nhật hồ sơ với validation và history tracking"""
        return self.service.update_profile(tutor_id, update_data, changed_by)

    def get_profile_history(self, tutor_id: str) -> list:
        """Lấy lịch sử thay đổi của hồ sơ"""
        return self.service.get_profile_history(tutor_id)

    def sync_from_datacore(self, tutor_id: str) -> Dict:
        """Đồng bộ thông tin từ HCMUT_DATACORE"""
        return self.service.sync_from_datacore(tutor_id)

    def approve_profile(self, tutor_id: str, approved_by: str) -> Dict:
        """Phê duyệt hồ sơ Tutor (chỉ cho sinh viên)"""
        return self.service.approve_profile(tutor_id, approved_by)

