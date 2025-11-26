from typing import Optional, Dict, List
from services.session_service import SessionService
from schemas.session import CreateSession, UpdateSession, SessionResource

class SessionController:
    def __init__(self):
        self.service = SessionService()

    def create_session(self, data: CreateSession) -> Dict:
        """Tạo session mới"""
        try:
            return self.service.create_session(data)
        except ValueError as e:
            return {"error": str(e)}

    def update_session(self, session_id: str, data: UpdateSession) -> Optional[Dict]:
        """Cập nhật session"""
        return self.service.update_session(session_id, data)
    
    def delete_session(self, session_id: str) -> Dict:
        """Xóa session"""
        success = self.service.delete_session(session_id)
        if success:
            return {"success": True, "message": "Session deleted successfully"}
        return {"success": False, "message": "Cannot delete session"}

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Lấy thông tin session với thông tin chi tiết Profile"""
        return self.service.display_session_details(session_id)

    def get_user_sessions(self, user_id: str) -> List[Dict]:
        """Lấy danh sách session của user"""
        return self.service.get_user_sessions(user_id)

    def register_session(self, session_id: str, mentee_id: str) -> Dict:
        """Đăng ký tham gia session"""
        return self.service.register_session(session_id, mentee_id)

    def cancel_session(self, session_id: str, mentee_id: str) -> Dict:
        """Hủy đăng ký session"""
        return self.service.cancel_session(session_id, mentee_id)

    def get_session_resources(self, session_id: str) -> List[Dict]:
        """Lấy danh sách tài nguyên của session"""
        return self.service.get_session_resources(session_id)

    def upload_resource(self, session_id: str, resource: SessionResource) -> Dict:
        """Upload tài nguyên"""
        return self.service.upload_resource(session_id, resource)

    def download_resource(self, session_id: str, resource_id: str) -> Optional[Dict]:
        """Download tài nguyên"""
        return self.service.download_resource(session_id, resource_id)
