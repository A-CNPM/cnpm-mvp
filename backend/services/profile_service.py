from typing import Optional, Dict
from data.profiles import fake_profiles_db

class ProfileService:
    def get_profile(self, user_id: str) -> Optional[Dict]:
        return fake_profiles_db.get(user_id)

    def update_profile(self, user_id: str, updated_data: Dict) -> bool:
        if user_id not in fake_profiles_db:
            return False
        fake_profiles_db[user_id].update(updated_data)
        return True

    def sync_from_datacore(self, user_id: str) -> bool:
        return user_id in fake_profiles_db
