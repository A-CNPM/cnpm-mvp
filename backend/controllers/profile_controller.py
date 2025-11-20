from typing import Optional, Dict
from services.profile_service import ProfileService

class ProfileController:
    def __init__(self):
        self.service = ProfileService()

    def get_profile(self, user_id: str) -> Optional[Dict]:
        return self.service.get_profile(user_id)

    def update_profile(self, user_id: str, updated_data: Dict) -> bool:
        return self.service.update_profile(user_id, updated_data)

    def sync_from_datacore(self, user_id: str) -> bool:
        return self.service.sync_from_datacore(user_id)
