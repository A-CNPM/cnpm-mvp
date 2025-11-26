from typing import Optional, Dict, List
from data.fake_sessions import fake_sessions_db
from data.profiles import fake_profiles_db
from schemas.session import Session, CreateSession, UpdateSession, SessionResource
import uuid
from datetime import datetime

class SessionService:
    
    def create_session(self, data: CreateSession) -> Dict:
        """Tạo session mới - kiểm tra tutor có tồn tại trong profiles"""
        # Kiểm tra tutor có tồn tại
        if data.tutor not in fake_profiles_db:
            raise ValueError("Tutor not found in profiles")
            
        session_id = f"S{str(uuid.uuid4())[:6]}"
        session = data.dict()
        session["sessionID"] = session_id
        session["status"] = "Khởi tạo"
        session["participants"] = []
        session["resources"] = []
        fake_sessions_db[session_id] = session
        return session
    
    def update_session(self, session_id: str, data: UpdateSession) -> Optional[Dict]:
        """Cập nhật thông tin session"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return None
        
        # Cập nhật từng field nếu có trong data
        for k, v in data.dict(exclude_unset=True).items():
            session[k] = v
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Xóa session - chỉ cho phép nếu chưa có participants hoặc trong thời hạn cho phép"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return False
            
        # Logic kiểm tra điều kiện xóa (có thể mở rộng)
        # Ví dụ: chỉ cho phép xóa nếu chưa có participants
        if len(session.get("participants", [])) == 0:
            del fake_sessions_db[session_id]
            return True
        return False
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Lấy thông tin chi tiết một session"""
        return fake_sessions_db.get(session_id)
    
    def get_user_sessions(self, user_id: str) -> List[Dict]:
        """Lấy danh sách sessions của user (tutor hoặc mentee)"""
        result = []
        for session in fake_sessions_db.values():
            # Kiểm tra nếu user là tutor của session
            if session.get("tutor") == user_id:
                result.append(session)
            # Kiểm tra nếu user là participant của session  
            elif user_id in session.get("participants", []):
                result.append(session)
        return result

    
    def register_session(self, session_id: str, mentee_id: str) -> Dict:
        """Đăng ký tham gia session - kiểm tra mentee có tồn tại trong profiles"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        # Kiểm tra mentee có tồn tại trong profiles
        if mentee_id not in fake_profiles_db:
            return {"success": False, "message": "User not found in profiles"}
        
        # Kiểm tra session đã đầy chưa
        current_participants = len(session.get("participants", []))
        max_participants = session.get("maxParticipants", 0)
        
        if current_participants >= max_participants:
            return {"success": False, "message": "Session is full"}
            
        # Kiểm tra đã đăng ký chưa
        if mentee_id in session.get("participants", []):
            return {"success": False, "message": "Already registered"}
            
        # Thêm mentee vào danh sách participants
        session["participants"].append(mentee_id)
        
        # Cập nhật status nếu cần
        if len(session["participants"]) == max_participants:
            session["status"] = "Đã đầy"
            
        return {"success": True, "message": "Registration successful", "session": session}
    
    def cancel_session(self, session_id: str, mentee_id: str) -> Dict:
        """Hủy đăng ký session - từ MenteeSessionView"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
            
        if mentee_id not in session.get("participants", []):
            return {"success": False, "message": "Not registered for this session"}
            
        # Kiểm tra thời gian hủy (cần implement logic kiểm tra 12h trước session)
        # Tạm thời cho phép hủy
        
        session["participants"].remove(mentee_id)
        
        # Cập nhật status nếu cần
        if session.get("status") == "Đã đầy":
            session["status"] = "Đã xác nhận"
            
        return {"success": True, "message": "Cancellation successful", "session": session}

    
    def get_session_resources(self, session_id: str) -> List[Dict]:
        """Lấy danh sách tài nguyên của session"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return []
        return session.get("resources", [])

    def upload_resource(self, session_id: str, resource: SessionResource) -> Dict:
        """Upload tài nguyên vào session - từ TutorSessionView"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
            
        # Tạo resourceID mới
        resource_data = resource.dict()
        if not resource_data.get("resourceID"):
            resource_data["resourceID"] = f"R{str(uuid.uuid4())[:6]}"
            
        # Đảm bảo session reference đúng
        resource_data["session"] = session_id
        resource_data["uploadDate"] = datetime.now().isoformat()
        
        session["resources"].append(resource_data)
        
        return {"success": True, "message": "Resource uploaded successfully", "resource": resource_data}

    def download_resource(self, session_id: str, resource_id: str) -> Optional[Dict]:
        """Tải xuống tài nguyên - kiểm tra quyền truy cập"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return None
            
        for resource in session.get("resources", []):
            if resource["resourceID"] == resource_id:
                # Kiểm tra access level (có thể mở rộng logic kiểm tra quyền)
                return resource
                
        return None
    
    def display_session_details(self, session_id: str) -> Optional[Dict]:
        """Hiển thị chi tiết session với thông tin Profile của tutor và participants"""
        session = self.get_session(session_id)
        if not session:
            return None
            
        # Thêm thông tin profile của tutor
        tutor_profile = fake_profiles_db.get(session.get("tutor"))
        
        # Thêm thông tin profile của participants
        participants_info = []
        for participant_id in session.get("participants", []):
            participant_profile = fake_profiles_db.get(participant_id)
            if participant_profile:
                participants_info.append({
                    "userID": participant_id,
                    "full_name": participant_profile.get("full_name"),
                    "email": participant_profile.get("email"),
                    "mssv": participant_profile.get("mssv")
                })
        
        return {
            "session": session,
            "tutor_info": {
                "userID": session.get("tutor"),
                "full_name": tutor_profile.get("full_name") if tutor_profile else None,
                "email": tutor_profile.get("email") if tutor_profile else None,
                "chuyen_mon": tutor_profile.get("chuyen_mon") if tutor_profile else None
            },
            "participants_info": participants_info,
            "participant_count": len(session.get("participants", [])),
            "available_slots": session.get("maxParticipants", 0) - len(session.get("participants", [])),
            "resource_count": len(session.get("resources", []))
        }
