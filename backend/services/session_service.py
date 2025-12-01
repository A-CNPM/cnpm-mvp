from typing import Optional, Dict, List
from data.fake_sessions import fake_sessions_db
from data.profiles import fake_profiles_db
from data.session_notes import (
    fake_session_notes_db,
    get_session_note,
    get_session_notes,
    create_session_note,
    update_session_note,
    delete_session_note
)
from schemas.session import (
    Session, CreateSession, UpdateSession, SessionResource,
    CreateResourceRequest, UpdateResourceRequest,
    CreateSessionNoteRequest, UpdateSessionNoteRequest
)
import uuid
from datetime import datetime, timedelta
import re
import time
import threading

class SessionService:
    
    def _parse_datetime(self, date_str: str) -> Optional[datetime]:
        """Parse datetime từ format '01/11/2025 12:00'"""
        try:
            # Format: "01/11/2025 12:00"
            return datetime.strptime(date_str, "%d/%m/%Y %H:%M")
        except:
            try:
                # Format ISO: "2025-01-11T12:00:00"
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except:
                return None
    
    def _check_schedule_conflict(self, mentee_id: str, new_start: str, new_end: str) -> bool:
        """Kiểm tra xung đột lịch với các session đã đăng ký"""
        new_start_dt = self._parse_datetime(new_start)
        new_end_dt = self._parse_datetime(new_end)
        
        if not new_start_dt or not new_end_dt:
            return False  # Không parse được thì không kiểm tra
        
        # Lấy tất cả sessions mà mentee đã đăng ký
        for session in fake_sessions_db.values():
            if mentee_id in session.get("participants", []):
                existing_start = self._parse_datetime(session.get("startTime", ""))
                existing_end = self._parse_datetime(session.get("endTime", ""))
                
                if existing_start and existing_end:
                    # Kiểm tra xung đột: thời gian mới trùng với thời gian cũ
                    if not (new_end_dt <= existing_start or new_start_dt >= existing_end):
                        return True  # Có xung đột
        return False
    
    def _check_cancel_time_limit(self, session_start: str, hours_before: int = 12) -> bool:
        """Kiểm tra xem có thể hủy không (phải trước 12 giờ)"""
        session_start_dt = self._parse_datetime(session_start)
        if not session_start_dt:
            return True  # Không parse được thì cho phép hủy
        
        now = datetime.now()
        time_diff = session_start_dt - now
        
        # Cho phép hủy nếu còn hơn 12 giờ
        return time_diff.total_seconds() > (hours_before * 3600)
    
    def _record_violation(self, mentee_id: str, session_id: str, violation_type: str):
        """Ghi nhận vi phạm (không tham gia buổi đã đăng ký)"""
        # Tạo hoặc cập nhật bảng vi phạm (giả lập)
        if not hasattr(self, '_violations_db'):
            self._violations_db = {}
        
        if mentee_id not in self._violations_db:
            self._violations_db[mentee_id] = []
        
        self._violations_db[mentee_id].append({
            "session_id": session_id,
            "violation_type": violation_type,
            "timestamp": datetime.now().isoformat()
        })
        
        # Trả về số lần vi phạm
        return len(self._violations_db[mentee_id])
    
    def create_session(self, data: CreateSession) -> Dict:
        """Tạo session mới - kiểm tra tutor có tồn tại trong profiles"""
        # Kiểm tra tutor có tồn tại
        if data.tutor not in fake_profiles_db:
            raise ValueError("Tutor not found in profiles")
            
        session_id = f"S{str(uuid.uuid4())[:6]}"
        session = data.dict()
        session["sessionID"] = session_id
        session["status"] = "Đang mở đăng ký"
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
        """Đăng ký tham gia session - kiểm tra xung đột lịch và giới hạn số lượng"""
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
        
        # Kiểm tra xung đột lịch với các session đã đăng ký
        if self._check_schedule_conflict(mentee_id, session.get("startTime", ""), session.get("endTime", "")):
            return {"success": False, "message": "Schedule conflict: Bạn đã có buổi tư vấn khác trong khoảng thời gian này"}
        
        # Thêm mentee vào danh sách participants
        session["participants"].append(mentee_id)
        
        # Cập nhật status nếu cần
        if len(session["participants"]) == max_participants:
            session["status"] = "Đã đầy"
        elif session.get("status") == "Khởi tạo":
            session["status"] = "Đã xác nhận"
            
        return {"success": True, "message": "Registration successful", "session": session}
    
    def cancel_session(self, session_id: str, mentee_id: str) -> Dict:
        """Hủy đăng ký session - kiểm tra thời gian hủy (12h trước)"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
            
        if mentee_id not in session.get("participants", []):
            return {"success": False, "message": "Not registered for this session"}
        
        # Kiểm tra thời gian hủy: phải trước 12 giờ
        if not self._check_cancel_time_limit(session.get("startTime", ""), hours_before=12):
            return {"success": False, "message": "Không thể hủy: Buổi tư vấn sẽ diễn ra trong vòng 12 giờ tới. Vui lòng liên hệ quản trị viên để được hỗ trợ."}
        
        session["participants"].remove(mentee_id)
        
        # Cập nhật status nếu cần
        if session.get("status") == "Đã đầy":
            session["status"] = "Đã xác nhận"
        elif len(session.get("participants", [])) == 0:
            session["status"] = "Khởi tạo"
            
        return {"success": True, "message": "Cancellation successful", "session": session}
    
    def mark_absence(self, session_id: str, mentee_id: str) -> Dict:
        """Ghi nhận vi phạm: mentee không tham gia buổi đã đăng ký"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        if mentee_id not in session.get("participants", []):
            return {"success": False, "message": "User not registered for this session"}
        
        # Ghi nhận vi phạm
        violation_count = self._record_violation(mentee_id, session_id, "absence")
        
        # Áp dụng chế tài (có thể mở rộng)
        penalty = None
        if violation_count >= 3:
            penalty = "Giảm ưu tiên đăng ký"
        elif violation_count >= 5:
            penalty = "Báo cáo cho CTSV"
        
        return {
            "success": True, 
            "message": f"Đã ghi nhận vi phạm. Số lần vi phạm: {violation_count}",
            "violation_count": violation_count,
            "penalty": penalty
        }

    
    def get_session_resources(self, session_id: str, user_id: Optional[str] = None) -> List[Dict]:
        """Lấy danh sách tài nguyên của session (lọc theo quyền truy cập)"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return []
        
        resources = session.get("resources", [])
        
        # Nếu có user_id, lọc theo quyền truy cập
        if user_id:
            filtered_resources = []
            for resource in resources:
                access_level = resource.get("accessLevel", "public")
                
                # draft: chỉ tutor mới thấy
                if access_level == "draft":
                    if resource.get("uploadedBy") == user_id or session.get("tutor") == user_id:
                        filtered_resources.append(resource)
                # private: chỉ mentee được chỉ định
                elif access_level == "private":
                    allowed_mentees = resource.get("allowedMentees", [])
                    if user_id in allowed_mentees or resource.get("uploadedBy") == user_id or session.get("tutor") == user_id:
                        filtered_resources.append(resource)
                # session: chỉ participants của session
                elif access_level == "session":
                    participants = session.get("participants", [])
                    if user_id in participants or resource.get("uploadedBy") == user_id or session.get("tutor") == user_id:
                        filtered_resources.append(resource)
                # public: tất cả đều thấy
                else:
                    filtered_resources.append(resource)
            
            return filtered_resources
        
        return resources

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
        resource_data["uploadDate"] = datetime.now().strftime("%d/%m/%Y %H:%M")
        
        # Nếu source là library, cần xác thực quyền truy cập HCMUT_LIBRARY (giả lập)
        if resource_data.get("source") == "library" and resource_data.get("libraryResourceId"):
            # Giả lập xác thực quyền truy cập HCMUT_LIBRARY
            # Trong thực tế sẽ gọi API HCMUT_LIBRARY để xác thực
            if not self._verify_library_access(resource_data.get("uploadedBy"), resource_data.get("libraryResourceId")):
                return {"success": False, "message": "Không có quyền truy cập tài liệu từ HCMUT_LIBRARY"}
        
        session["resources"].append(resource_data)
        
        return {"success": True, "message": "Resource uploaded successfully", "resource": resource_data}
    
    def create_resource(self, data: CreateResourceRequest, tutor_id: str) -> Dict:
        """Tạo resource mới với quyền truy cập chi tiết"""
        session = fake_sessions_db.get(data.session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền thêm tài liệu vào session này"}
        
        resource_id = f"R{str(uuid.uuid4())[:6]}"
        resource_data = {
            "resourceID": resource_id,
            "session": data.session_id,
            "title": data.title,
            "description": data.description,
            "type": data.type,
            "url": data.url,
            "uploadedBy": tutor_id,
            "accessLevel": data.accessLevel,
            "allowedMentees": data.allowedMentees or [],
            "source": data.source or "upload",
            "libraryResourceId": data.libraryResourceId,
            "uploadDate": datetime.now().isoformat()
        }
        
        # Nếu source là library, cần xác thực quyền truy cập
        if resource_data.get("source") == "library" and resource_data.get("libraryResourceId"):
            if not self._verify_library_access(tutor_id, resource_data.get("libraryResourceId")):
                return {"success": False, "message": "Không có quyền truy cập tài liệu từ HCMUT_LIBRARY"}
        
        session["resources"].append(resource_data)
        
        return {"success": True, "message": "Tài liệu đã được thêm thành công", "resource": resource_data}
    
    def update_resource(self, session_id: str, resource_id: str, data: UpdateResourceRequest, tutor_id: str) -> Dict:
        """Cập nhật resource"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền chỉnh sửa tài liệu trong session này"}
        
        for resource in session.get("resources", []):
            if resource.get("resourceID") == resource_id:
                if resource.get("uploadedBy") != tutor_id:
                    return {"success": False, "message": "Bạn không có quyền chỉnh sửa tài liệu này"}
                
                # Cập nhật các trường
                if data.title is not None:
                    resource["title"] = data.title
                if data.description is not None:
                    resource["description"] = data.description
                if data.accessLevel is not None:
                    resource["accessLevel"] = data.accessLevel
                if data.allowedMentees is not None:
                    resource["allowedMentees"] = data.allowedMentees
                
                return {"success": True, "message": "Cập nhật tài liệu thành công", "resource": resource}
        
        return {"success": False, "message": "Tài liệu không tồn tại"}
    
    def delete_resource(self, session_id: str, resource_id: str, tutor_id: str) -> Dict:
        """Xóa resource"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền xóa tài liệu trong session này"}
        
        resources = session.get("resources", [])
        for i, resource in enumerate(resources):
            if resource.get("resourceID") == resource_id:
                if resource.get("uploadedBy") != tutor_id:
                    return {"success": False, "message": "Bạn không có quyền xóa tài liệu này"}
                
                resources.pop(i)
                return {"success": True, "message": "Đã xóa tài liệu thành công"}
        
        return {"success": False, "message": "Tài liệu không tồn tại"}
    
    def _verify_library_access(self, user_id: str, library_resource_id: str) -> bool:
        """Xác thực quyền truy cập HCMUT_LIBRARY (giả lập)"""
        # Trong thực tế sẽ gọi API HCMUT_LIBRARY để xác thực
        # Giả lập: tất cả tutor đều có quyền truy cập
        return user_id in fake_profiles_db

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
    
    def create_session_note(self, data: CreateSessionNoteRequest, tutor_id: str) -> Dict:
        """Tạo ghi chú/biên bản buổi tư vấn"""
        session = fake_sessions_db.get(data.session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền tạo ghi chú cho session này"}
        
        note_id = f"NOTE{str(uuid.uuid4())[:6]}"
        note_data = {
            "note_id": note_id,
            "session_id": data.session_id,
            "content": data.content,
            "created_by": tutor_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": None,
            "is_draft": data.is_draft
        }
        
        create_session_note(note_data)
        
        # Cập nhật content trong session nếu không phải nháp
        if not data.is_draft:
            session["content"] = data.content
        
        return {"success": True, "message": "Ghi chú đã được tạo thành công", "note": note_data}
    
    def update_session_note(self, note_id: str, data: UpdateSessionNoteRequest, tutor_id: str) -> Dict:
        """Cập nhật ghi chú/biên bản"""
        note = get_session_note(note_id)
        if not note:
            return {"success": False, "message": "Ghi chú không tồn tại"}
        
        if note.get("created_by") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền chỉnh sửa ghi chú này"}
        
        update_data = {
            "content": data.content,
            "updated_at": datetime.now().isoformat()
        }
        
        if data.is_draft is not None:
            update_data["is_draft"] = data.is_draft
        
        updated_note = update_session_note(note_id, update_data)
        
        # Cập nhật content trong session nếu không phải nháp
        if not updated_note.get("is_draft"):
            session = fake_sessions_db.get(updated_note.get("session_id"))
            if session:
                session["content"] = data.content
        
        return {"success": True, "message": "Ghi chú đã được cập nhật thành công", "note": updated_note}
    
    def get_session_notes(self, session_id: str, user_id: Optional[str] = None) -> List[Dict]:
        """Lấy danh sách ghi chú của session (lọc theo quyền)"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return []
        
        notes = get_session_notes(session_id)
        
        # Lọc theo quyền: chỉ tutor, participants, hoặc admin mới thấy
        if user_id:
            filtered_notes = []
            for note in notes:
                # Tutor của session luôn thấy
                if session.get("tutor") == user_id:
                    filtered_notes.append(note)
                # Participants cũng thấy (trừ nháp)
                elif user_id in session.get("participants", []):
                    if not note.get("is_draft"):
                        filtered_notes.append(note)
                # Admin (giả lập: có thể mở rộng)
                # Trong thực tế sẽ kiểm tra role từ HCMUT_DATACORE
            
            return filtered_notes
        
        return notes
    
    def delete_session_note(self, note_id: str, tutor_id: str) -> Dict:
        """Xóa ghi chú"""
        note = get_session_note(note_id)
        if not note:
            return {"success": False, "message": "Ghi chú không tồn tại"}
        
        if note.get("created_by") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền xóa ghi chú này"}
        
        delete_session_note(note_id)
        return {"success": True, "message": "Đã xóa ghi chú thành công"}
    
    def cancel_session_by_tutor(self, session_id: str, tutor_id: str, reason: Optional[str] = None) -> Dict:
        """Tutor hủy session - gửi thông báo cho tất cả participants"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session không tồn tại"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền hủy session này"}
        
        # Tạo change request để gửi thông báo
        change_request_id = f"CHANGE{str(uuid.uuid4())[:8].upper()}"
        if "pending_changes" not in session:
            session["pending_changes"] = {}
        
        session["pending_changes"][change_request_id] = {
            "change_request_id": change_request_id,
            "type": "cancel",
            "reason": reason,
            "created_at": datetime.now().isoformat(),
            "responses": {},
            "status": "pending",
            "timeout_at": (datetime.now() + timedelta(minutes=1)).isoformat()  # Timeout sau 1 phút
        }
        
        # Gửi thông báo cho tất cả participants
        participants = session.get("participants", [])
        for participant_id in participants:
            self._send_session_cancel_notification(participant_id, session, reason)
        
        # Tự động check timeout sau 1 phút
        self._schedule_timeout_check(change_request_id, session_id)
        
        return {
            "success": True,
            "message": "Đã gửi thông báo hủy session. Đang chờ phản hồi từ sinh viên.",
            "change_request_id": change_request_id
        }
    
    def reschedule_session_by_tutor(self, session_id: str, tutor_id: str, new_start_time: str, new_end_time: str, new_location: Optional[str] = None, reason: Optional[str] = None) -> Dict:
        """Tutor thay đổi session - áp dụng thay đổi ngay, sau đó gửi thông báo cho participants"""
        session = fake_sessions_db.get(session_id)
        if not session:
            return {"success": False, "message": "Session không tồn tại"}
        
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền đổi lịch session này"}
        
        if len(session.get("participants", [])) == 0:
            return {"success": False, "message": "Session chưa có người tham gia"}
        
        # Lưu dữ liệu cũ để có thể revert nếu không đạt 50% đồng ý
        old_data = {
            "startTime": session.get("startTime"),
            "endTime": session.get("endTime"),
            "location": session.get("location")
        }
        
        # ÁP DỤNG THAY ĐỔI NGAY (tạm thời)
        session["startTime"] = new_start_time
        session["endTime"] = new_end_time
        if new_location:
            session["location"] = new_location
        
        # Tạo change request để theo dõi phản hồi
        change_request_id = f"CHANGE{str(uuid.uuid4())[:8].upper()}"
        if "pending_changes" not in session:
            session["pending_changes"] = {}
        
        session["pending_changes"][change_request_id] = {
            "change_request_id": change_request_id,
            "type": "reschedule",
            "old_data": old_data,  # Lưu để revert nếu cần
            "new_data": {
                "startTime": new_start_time,
                "endTime": new_end_time,
                "location": new_location if new_location else old_data["location"]
            },
            "reason": reason,
            "created_at": datetime.now().isoformat(),
            "responses": {},
            "status": "pending",
            "timeout_at": (datetime.now() + timedelta(minutes=1)).isoformat()  # Timeout sau 1 phút
        }
        
        # Gửi thông báo cho tất cả participants
        participants = session.get("participants", [])
        for participant_id in participants:
            self._send_session_reschedule_notification(participant_id, session, change_request_id, reason)
        
        # Tự động check timeout sau 1 phút
        self._schedule_timeout_check(change_request_id, session_id)
        
        return {
            "success": True,
            "message": "Đã áp dụng thay đổi và gửi thông báo. Đang chờ phản hồi từ sinh viên.",
            "change_request_id": change_request_id
        }
    
    def respond_to_session_change(self, change_request_id: str, user_id: str, response: str) -> Dict:
        """Mentee phản hồi thay đổi session (Đồng ý/Từ chối)"""
        # Tìm session có change request này
        for session in fake_sessions_db.values():
            if "pending_changes" in session and change_request_id in session["pending_changes"]:
                change_request = session["pending_changes"][change_request_id]
                
                # Kiểm tra user có tham gia session không
                if user_id not in session.get("participants", []):
                    return {"success": False, "message": "Bạn không tham gia session này"}
                
                # Lưu phản hồi (mặc định là "reject" nếu không phản hồi trong thời hạn)
                change_request["responses"][user_id] = response
                
                # Kiểm tra tất cả đã phản hồi chưa
                all_participants = session.get("participants", [])
                all_responded = all(user_id in change_request["responses"] for user_id in all_participants)
                
                if all_responded:
                    # Đếm số đồng ý
                    accept_count = sum(1 for r in change_request["responses"].values() if r == "accept")
                    total_count = len(all_participants)
                    approval_rate = accept_count / total_count if total_count > 0 else 0
                    
                    # Chính sách: cần >= 50% đồng ý
                    if approval_rate >= 0.5:
                        if change_request["type"] == "cancel":
                            # Hủy session
                            session["status"] = "Đã hủy"
                            change_request["status"] = "approved"
                            # Gửi thông báo xác nhận hủy
                            for participant_id in all_participants:
                                self._send_session_cancel_confirmed_notification(participant_id, session)
                        elif change_request["type"] == "reschedule":
                            # Thay đổi đã được áp dụng từ trước, chỉ cần xác nhận
                            session["status"] = "Đã thay đổi"
                            change_request["status"] = "approved"
                            # Gửi thông báo xác nhận đổi lịch
                            for participant_id in all_participants:
                                self._send_session_reschedule_confirmed_notification(participant_id, session)
                    else:
                        # Không đạt tỷ lệ, giữ nguyên hoặc revert
                        if change_request["type"] == "cancel":
                            # Nếu không đủ đồng ý hủy, giữ nguyên session (không hủy)
                            change_request["status"] = "rejected"
                        else:
                            # Nếu không đủ đồng ý đổi lịch, REVERT về dữ liệu cũ
                            old_data = change_request.get("old_data", {})
                            if "startTime" in old_data:
                                session["startTime"] = old_data["startTime"]
                            if "endTime" in old_data:
                                session["endTime"] = old_data["endTime"]
                            if "location" in old_data:
                                session["location"] = old_data["location"]
                            change_request["status"] = "rejected"
                        # Gửi thông báo từ chối
                        for participant_id in all_participants:
                            self._send_session_change_rejected_notification(participant_id, session)
                
                return {
                    "success": True,
                    "message": "Đã ghi nhận phản hồi của bạn",
                    "change_request": change_request
                }
        
        return {"success": False, "message": "Không tìm thấy yêu cầu thay đổi"}
    
    def _send_session_cancel_notification(self, user_id: str, session: Dict, reason: Optional[str] = None):
        """Gửi thông báo hủy session"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        
        try:
            notification_service = NotificationService()
            notification_data = CreateNotification(
                user_id=user_id,
                type="session_cancelled",
                title="Yêu cầu hủy buổi tư vấn",
                message=f"Tutor đã yêu cầu hủy buổi tư vấn '{session.get('topic')}'. Lý do: {reason or 'Không có lý do'}. Vui lòng vào trang Buổi tư vấn để phản hồi Đồng ý/Từ chối.",
                related_id=session.get("sessionID"),
                action_url=f"/mentee/meeting"
            )
            notification_service.create_notification(notification_data)
            print(f"✅ Đã gửi thông báo hủy session cho user {user_id}, session {session.get('sessionID')}")
        except Exception as e:
            print(f"❌ Lỗi khi gửi thông báo hủy session cho user {user_id}: {e}")
    
    def _send_session_reschedule_notification(self, user_id: str, session: Dict, change_request_id: str, reason: Optional[str] = None):
        """Gửi thông báo đề xuất đổi lịch session"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        
        try:
            notification_service = NotificationService()
            notification_data = CreateNotification(
                user_id=user_id,
                type="session_reschedule",
                title="Yêu cầu đổi lịch buổi tư vấn",
                message=f"Tutor đã thay đổi lịch buổi tư vấn '{session.get('topic')}'. Lý do: {reason or 'Không có lý do'}. Vui lòng vào trang Buổi tư vấn để phản hồi Đồng ý/Từ chối.",
                related_id=change_request_id,
                action_url=f"/mentee/meeting"
            )
            notification_service.create_notification(notification_data)
            print(f"✅ Đã gửi thông báo đổi lịch session cho user {user_id}, session {session.get('sessionID')}")
        except Exception as e:
            print(f"❌ Lỗi khi gửi thông báo đổi lịch session cho user {user_id}: {e}")
    
    def _send_session_cancel_confirmed_notification(self, user_id: str, session: Dict):
        """Gửi thông báo xác nhận hủy session"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        
        notification_service = NotificationService()
        notification_data = CreateNotification(
            user_id=user_id,
            type="session_cancel_confirmed",
            title="Buổi tư vấn đã được hủy",
            message=f"Buổi tư vấn '{session.get('topic')}' đã được hủy sau khi đạt tỷ lệ đồng ý.",
            related_id=session.get("sessionID"),
            action_url=f"/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_session_reschedule_confirmed_notification(self, user_id: str, session: Dict):
        """Gửi thông báo xác nhận đổi lịch session"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        
        notification_service = NotificationService()
        notification_data = CreateNotification(
            user_id=user_id,
            type="session_reschedule_confirmed",
            title="Buổi tư vấn đã được đổi lịch",
            message=f"Buổi tư vấn '{session.get('topic')}' đã được đổi lịch sau khi đạt tỷ lệ đồng ý.",
            related_id=session.get("sessionID"),
            action_url=f"/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_session_change_rejected_notification(self, user_id: str, session: Dict):
        """Gửi thông báo từ chối thay đổi session"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        
        notification_service = NotificationService()
        notification_data = CreateNotification(
            user_id=user_id,
            type="session_change_rejected",
            title="Thay đổi buổi tư vấn không được áp dụng",
            message=f"Thay đổi buổi tư vấn '{session.get('topic')}' không được áp dụng do không đạt tỷ lệ đồng ý >= 50%.",
            related_id=session.get("sessionID"),
            action_url=f"/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _schedule_timeout_check(self, change_request_id: str, session_id: str):
        """Lên lịch kiểm tra timeout cho change request (1 phút)"""
        def check_timeout():
            time.sleep(60)  # Đợi 1 phút
            session = fake_sessions_db.get(session_id)
            if not session:
                return
            
            if "pending_changes" not in session:
                return
            
            change_request = session["pending_changes"].get(change_request_id)
            if not change_request or change_request.get("status") != "pending":
                return
            
            # Đã hết thời gian, tự động reject cho những người chưa phản hồi
            all_participants = session.get("participants", [])
            for participant_id in all_participants:
                if participant_id not in change_request.get("responses", {}):
                    # Mặc định là reject nếu không phản hồi
                    change_request["responses"][participant_id] = "reject"
            
            # Kiểm tra lại tỷ lệ đồng ý
            accept_count = sum(1 for r in change_request["responses"].values() if r == "accept")
            total_count = len(all_participants)
            approval_rate = accept_count / total_count if total_count > 0 else 0
            
            if approval_rate >= 0.5:
                # Đạt tỷ lệ, áp dụng thay đổi
                if change_request["type"] == "cancel":
                    session["status"] = "Đã hủy"
                    change_request["status"] = "approved"
                    for participant_id in all_participants:
                        self._send_session_cancel_confirmed_notification(participant_id, session)
                elif change_request["type"] == "reschedule":
                    # Thay đổi đã được áp dụng từ trước, chỉ cần xác nhận
                    change_request["status"] = "approved"
                    for participant_id in all_participants:
                        self._send_session_reschedule_confirmed_notification(participant_id, session)
            else:
                # Không đạt tỷ lệ
                if change_request["type"] == "cancel":
                    change_request["status"] = "rejected"
                else:
                    # Revert về dữ liệu cũ
                    old_data = change_request.get("old_data", {})
                    if "startTime" in old_data:
                        session["startTime"] = old_data["startTime"]
                    if "endTime" in old_data:
                        session["endTime"] = old_data["endTime"]
                    if "location" in old_data:
                        session["location"] = old_data["location"]
                    change_request["status"] = "rejected"
                
                for participant_id in all_participants:
                    self._send_session_change_rejected_notification(participant_id, session)
        
        # Chạy timeout check trong background thread
        thread = threading.Thread(target=check_timeout, daemon=True)
        thread.start()
