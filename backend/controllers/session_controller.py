from typing import Optional, Dict, List
from services.session_service import SessionService
from schemas.session import CreateSession, UpdateSession, SessionResource

class SessionController:
    def __init__(self):
        self.service = SessionService()

    def get_session(self, session_id: str) -> Optional[Dict]:
        return self.service.get_session(session_id)

    def get_user_sessions(self, user_id: str) -> List[Dict]:
        return self.service.get_user_sessions(user_id)

    def create_session(self, data: CreateSession) -> Dict:
        return self.service.create_session(data)

    def update_session(self, session_id: str, data: UpdateSession) -> Optional[Dict]:
        return self.service.update_session(session_id, data)

    def delete_session(self, session_id: str) -> bool:
        return self.service.delete_session(session_id)

    def register_session(self, session_id: str, mentee_id: str) -> bool:
        return self.service.register_session(session_id, mentee_id)

    def cancel_session(self, session_id: str, mentee_id: str) -> bool:
        return self.service.cancel_session(session_id, mentee_id)

    def get_session_resources(self, session_id: str) -> List[Dict]:
        return self.service.get_session_resources(session_id)

    def upload_resource(self, session_id: str, resource: SessionResource) -> bool:
        return self.service.upload_resource(session_id, resource)

    def download_resource(self, session_id: str, resource_id: str) -> Optional[Dict]:
        return self.service.download_resource(session_id, resource_id)
