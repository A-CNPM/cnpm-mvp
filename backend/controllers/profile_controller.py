from typing import Optional, Dict
from services.profile_service import ProfileService
from schemas.profile import UpdateProfileRequest

class ProfileController:
    def __init__(self):
        self.service = ProfileService()

    def get_profile(self, user_id: str) -> Optional[Dict]:
        return self.service.get_profile(user_id)

    def update_profile(self, user_id: str, update_data: UpdateProfileRequest, changed_by: str = None) -> Dict:
        """Cập nhật profile với validation và history tracking"""
        return self.service.update_profile(user_id, update_data, changed_by)

    def get_profile_history(self, user_id: str) -> list:
        """Lấy lịch sử thay đổi của profile"""
        return self.service.get_profile_history(user_id)

    def sync_from_datacore(self, user_id: str) -> bool:
        return self.service.sync_from_datacore(user_id)
