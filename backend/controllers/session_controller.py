from typing import Optional, Dict, List
from services.session_service import SessionService
from schemas.session import (
    CreateSession, UpdateSession, SessionResource,
    CreateResourceRequest, UpdateResourceRequest,
    CreateSessionNoteRequest, UpdateSessionNoteRequest,
    CancelSessionRequest, RescheduleSessionRequest, SessionChangeResponseRequest
)

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

    def mark_absence(self, session_id: str, mentee_id: str) -> Dict:
        """Ghi nhận vi phạm: mentee không tham gia buổi đã đăng ký"""
        return self.service.mark_absence(session_id, mentee_id)
    
    def cancel_session_by_tutor(self, data: CancelSessionRequest) -> Dict:
        """Tutor hủy session"""
        return self.service.cancel_session_by_tutor(data.session_id, data.tutor_id, data.reason)
    
    def reschedule_session_by_tutor(self, data: RescheduleSessionRequest) -> Dict:
        """Tutor đề xuất đổi lịch session"""
        return self.service.reschedule_session_by_tutor(
            data.session_id, 
            data.tutor_id, 
            data.new_start_time, 
            data.new_end_time, 
            data.new_location, 
            data.reason
        )
    
    def respond_to_session_change(self, data: SessionChangeResponseRequest) -> Dict:
        """Mentee phản hồi thay đổi session"""
        return self.service.respond_to_session_change(data.change_request_id, data.user_id, data.response)

    def get_session_resources(self, session_id: str, user_id: Optional[str] = None) -> List[Dict]:
        """Lấy danh sách tài nguyên của session (lọc theo quyền truy cập)"""
        return self.service.get_session_resources(session_id, user_id)

    def upload_resource(self, session_id: str, resource: SessionResource) -> Dict:
        """Upload tài nguyên"""
        return self.service.upload_resource(session_id, resource)

    def download_resource(self, session_id: str, resource_id: str) -> Optional[Dict]:
        """Download tài nguyên"""
        return self.service.download_resource(session_id, resource_id)
    
    def create_resource(self, data: CreateResourceRequest, tutor_id: str) -> Dict:
        """Tạo resource mới"""
        return self.service.create_resource(data, tutor_id)
    
    def update_resource(self, session_id: str, resource_id: str, data: UpdateResourceRequest, tutor_id: str) -> Dict:
        """Cập nhật resource"""
        return self.service.update_resource(session_id, resource_id, data, tutor_id)
    
    def delete_resource(self, session_id: str, resource_id: str, tutor_id: str) -> Dict:
        """Xóa resource"""
        return self.service.delete_resource(session_id, resource_id, tutor_id)
    
    def create_session_note(self, data: CreateSessionNoteRequest, tutor_id: str) -> Dict:
        """Tạo ghi chú/biên bản"""
        return self.service.create_session_note(data, tutor_id)
    
    def update_session_note(self, note_id: str, data: UpdateSessionNoteRequest, tutor_id: str) -> Dict:
        """Cập nhật ghi chú/biên bản"""
        return self.service.update_session_note(note_id, data, tutor_id)
    
    def get_session_notes(self, session_id: str, user_id: Optional[str] = None) -> List[Dict]:
        """Lấy danh sách ghi chú của session"""
        return self.service.get_session_notes(session_id, user_id)
    
    def delete_session_note(self, note_id: str, tutor_id: str) -> Dict:
        """Xóa ghi chú"""
        return self.service.delete_session_note(note_id, tutor_id)
