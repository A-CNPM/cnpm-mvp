from typing import Optional, Dict, List
from data.fake_sessions import fake_sessions_db
from schemas.session import Session, CreateSession, UpdateSession, SessionResource
import uuid

class SessionService:
    def get_session(self, session_id: str) -> Optional[Dict]:
        return fake_sessions_db.get(session_id)

    def get_user_sessions(self, user_id: str) -> List[Dict]:
        return [s for s in fake_sessions_db.values() if user_id in s.get("menteeIDs", []) or user_id == s.get("tutorID")]

    def create_session(self, data: CreateSession) -> Dict:
        session_id = f"S{str(uuid.uuid4())[:6]}"
        session = data.dict()
        session["sessionID"] = session_id
        session["status"] = "Khởi tạo"
        session["resources"] = []
        session["menteeIDs"] = []
        fake_sessions_db[session_id] = session
        return session

    def update_session(self, session_id: str, data: UpdateSession) -> Optional[Dict]:
        session = fake_sessions_db.get(session_id)
        if not session:
            return None
        for k, v in data.dict(exclude_unset=True).items():
            session[k] = v
        return session

    def delete_session(self, session_id: str) -> bool:
        if session_id in fake_sessions_db:
            del fake_sessions_db[session_id]
            return True
        return False

    def register_session(self, session_id: str, mentee_id: str) -> bool:
        session = fake_sessions_db.get(session_id)
        if not session:
            return False
        if mentee_id not in session["menteeIDs"]:
            session["menteeIDs"].append(mentee_id)
        return True

    def cancel_session(self, session_id: str, mentee_id: str) -> bool:
        session = fake_sessions_db.get(session_id)
        if not session:
            return False
        if mentee_id in session["menteeIDs"]:
            session["menteeIDs"].remove(mentee_id)
        return True

    def get_session_resources(self, session_id: str) -> List[Dict]:
        session = fake_sessions_db.get(session_id)
        if not session:
            return []
        return session.get("resources", [])

    def upload_resource(self, session_id: str, resource: SessionResource) -> bool:
        session = fake_sessions_db.get(session_id)
        if not session:
            return False
        session["resources"].append(resource.dict())
        return True

    def download_resource(self, session_id: str, resource_id: str) -> Optional[Dict]:
        session = fake_sessions_db.get(session_id)
        if not session:
            return None
        for r in session.get("resources", []):
            if r["id"] == resource_id:
                return r
        return None
