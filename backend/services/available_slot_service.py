from typing import Optional, Dict, List
from data.available_slots import fake_available_slots_db
from data.fake_sessions import fake_sessions_db
from data.profiles import fake_profiles_db
from schemas.available_slot import (
    AvailableSlot,
    CreateAvailableSlot,
    RegisterSlotRequest,
    ChangeSlotRequest,
    CloseSlotRequest,
    UpdateAvailableSlot,
    ConfirmSlotRequest,
    CancelSlotRequest,
    ProposeRescheduleRequest,
    ChangeResponseRequest
)
import uuid
from datetime import datetime, timedelta
import re

class AvailableSlotService:
    
    def _parse_datetime(self, date_str: str) -> Optional[datetime]:
        """Parse datetime từ format '01/11/2025 12:00'"""
        try:
            return datetime.strptime(date_str, "%d/%m/%Y %H:%M")
        except:
            try:
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except:
                return None
    
    def _check_schedule_conflict(self, user_id: str, new_start: str, new_end: str, exclude_slot_id: Optional[str] = None) -> bool:
        """Kiểm tra xung đột lịch với các slot/session đã đăng ký"""
        new_start_dt = self._parse_datetime(new_start)
        new_end_dt = self._parse_datetime(new_end)
        
        if not new_start_dt or not new_end_dt:
            return False
        
        # Kiểm tra xung đột với các slot đã đăng ký
        for slot in fake_available_slots_db.values():
            if slot["slot_id"] == exclude_slot_id:
                continue
            if user_id in slot.get("registered_participants", []):
                existing_start = self._parse_datetime(slot.get("start_time", ""))
                existing_end = self._parse_datetime(slot.get("end_time", ""))
                
                if existing_start and existing_end:
                    if not (new_end_dt <= existing_start or new_start_dt >= existing_end):
                        return True
        
        # Kiểm tra xung đột với các session đã đăng ký
        for session in fake_sessions_db.values():
            if user_id in session.get("participants", []):
                existing_start = self._parse_datetime(session.get("startTime", ""))
                existing_end = self._parse_datetime(session.get("endTime", ""))
                
                if existing_start and existing_end:
                    if not (new_end_dt <= existing_start or new_start_dt >= existing_end):
                        return True
        return False
    
    def _check_can_cancel_or_change(self, slot_id: str, user_id: str, seconds_after_registration: int = 60) -> bool:
        """Kiểm tra có thể hủy/đổi không (phải trong vòng 1 phút sau khi đăng ký)"""
        slot = fake_available_slots_db.get(slot_id)
        if not slot:
            return False
        
        # Kiểm tra đã chuyển thành session chưa
        if slot.get("status") == "Đã chuyển thành session":
            return False
        
        # Lấy thời gian đăng ký của user
        registration_times = slot.get("registration_times", {})
        if user_id not in registration_times:
            return False
        
        registered_at_str = registration_times[user_id]
        try:
            registered_at = datetime.fromisoformat(registered_at_str)
            now = datetime.now()
            time_diff = (now - registered_at).total_seconds()
            # Trong vòng 1 phút (60 giây) sau khi đăng ký vẫn có thể hủy/đổi
            return time_diff <= seconds_after_registration
        except:
            return False
    
    def create_slot(self, data: CreateAvailableSlot) -> Dict:
        """Tutor tạo lịch rảnh mới"""
        # Kiểm tra tutor có tồn tại không
        if data.tutor_id not in fake_profiles_db:
            return {"success": False, "message": "Tutor not found"}
        
        slot_id = f"SLOT{str(uuid.uuid4())[:8].upper()}"
        
        slot = {
            "slot_id": slot_id,
            "tutor_id": data.tutor_id,
            "start_time": data.start_time,
            "end_time": data.end_time,
            "topic": data.topic,
            "max_participants": data.max_participants,
            "mode": data.mode,
            "location": data.location,
            "registered_participants": [],
            "status": "Mở đăng ký",
            "min_participants": data.min_participants,
            "created_at": datetime.now().isoformat(),
            "closed_at": None
        }
        
        fake_available_slots_db[slot_id] = slot
        
        return {
            "success": True,
            "message": "Đã tạo lịch rảnh thành công",
            "slot": slot
        }
    
    def get_tutor_slots(self, tutor_id: str, status: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả lịch rảnh của tutor và tự động chuyển thành session nếu đạt ngưỡng sau 60 giây"""
        slots = []
        now = datetime.now()
        
        for slot in list(fake_available_slots_db.values()):
            if slot["tutor_id"] != tutor_id:
                continue
            
            # Bỏ qua các slot đã chuyển thành session (chỉ hiển thị lịch rảnh chưa trở thành session)
            if slot.get("status") == "Đã chuyển thành session":
                continue
            
            # Kiểm tra và tự động xóa/chuyển thành session sau 60 giây
            if slot.get("status") == "Mở đăng ký":
                registered_count = len(slot.get("registered_participants", []))
                min_participants = slot.get("min_participants", 1)
                
                # Kiểm tra thời gian từ khi tạo slot
                created_at_str = slot.get("created_at")
                if created_at_str:
                    try:
                        created_at = datetime.fromisoformat(created_at_str)
                        time_since_creation = (now - created_at).total_seconds()
                        
                        # Nếu đã quá 60 giây kể từ khi tạo slot
                        if time_since_creation > 60:
                            # Nếu không đạt ngưỡng tối thiểu, XÓA slot
                            if registered_count < min_participants:
                                # Gửi thông báo cho những người đã đăng ký (nếu có)
                                for participant_id in slot.get("registered_participants", []):
                                    self._send_slot_cancelled_notification(participant_id, slot)
                                
                                # Xóa slot
                                slot_id = slot.get("slot_id")
                                if slot_id in fake_available_slots_db:
                                    del fake_available_slots_db[slot_id]
                                continue  # Bỏ qua slot này
                            
                            # Nếu đạt ngưỡng tối thiểu, chuyển thành session
                            elif registered_count >= min_participants:
                                # Kiểm tra xem đã tạo session chưa
                                slot_id = slot.get("slot_id")
                                existing_session = None
                                for session in fake_sessions_db.values():
                                    if session.get("_slot_id") == slot_id:
                                        existing_session = session
                                        break
                                
                                if not existing_session:
                                    # Tạo session mới
                                    session_id = f"S{str(uuid.uuid4())[:6]}"
                                    session = {
                                        "sessionID": session_id,
                                        "tutor": slot["tutor_id"],
                                        "participants": slot["registered_participants"].copy(),
                                        "topic": slot.get("topic", "Buổi tư vấn"),
                                        "mode": slot["mode"],
                                        "status": "Sắp diễn ra",
                                        "startTime": slot["start_time"],
                                        "endTime": slot["end_time"],
                                        "maxParticipants": slot["max_participants"],
                                        "resources": [],
                                        "location": slot.get("location", ""),
                                        "content": slot.get("topic", ""),
                                        "_slot_id": slot_id
                                    }
                                    fake_sessions_db[session_id] = session
                                    
                                    # Gửi thông báo cho tất cả participants
                                    tutor_profile = fake_profiles_db.get(slot["tutor_id"])
                                    tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
                                    for participant_id in slot["registered_participants"]:
                                        self._send_slot_to_session_notification(participant_id, slot, session_id, tutor_name)
                                
                                # Cập nhật status slot
                                slot["status"] = "Đã chuyển thành session"
                                slot["closed_at"] = datetime.now().isoformat()
                                # Bỏ qua slot này vì đã chuyển thành session
                                continue
                    except:
                        # Nếu không parse được datetime, bỏ qua
                        pass
            
            # Lọc theo status nếu có
            if status and slot.get("status") != status:
                continue
            
            slots.append(slot)
        
        # Sắp xếp theo thời gian
        slots.sort(key=lambda x: x.get("start_time", ""))
        return slots
    
    def register_slot(self, data: RegisterSlotRequest) -> Dict:
        """Sinh viên đăng ký lịch rảnh"""
        slot = fake_available_slots_db.get(data.slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["status"] != "Mở đăng ký":
            return {"success": False, "message": "Lịch rảnh không còn mở đăng ký"}
        
        # Kiểm tra đã đầy chưa
        current_count = len(slot.get("registered_participants", []))
        if current_count >= slot["max_participants"]:
            return {"success": False, "message": "Lịch rảnh đã đầy"}
        
        # Kiểm tra đã đăng ký chưa
        if data.user_id in slot.get("registered_participants", []):
            return {"success": False, "message": "Bạn đã đăng ký lịch rảnh này rồi"}
        
        # Kiểm tra xung đột lịch
        if self._check_schedule_conflict(data.user_id, slot["start_time"], slot["end_time"], data.slot_id):
            return {"success": False, "message": "Xung đột lịch: Bạn đã có buổi tư vấn khác trong khoảng thời gian này"}
        
        # Thêm user vào danh sách đăng ký
        slot["registered_participants"].append(data.user_id)
        
        # Lưu thời gian đăng ký
        if "registration_times" not in slot:
            slot["registration_times"] = {}
        slot["registration_times"][data.user_id] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Đăng ký thành công",
            "slot": slot
        }
    
    def cancel_slot_registration(self, slot_id: str, user_id: str) -> Dict:
        """Sinh viên hủy đăng ký lịch rảnh"""
        slot = fake_available_slots_db.get(slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if user_id not in slot.get("registered_participants", []):
            return {"success": False, "message": "Bạn chưa đăng ký lịch rảnh này"}
        
        # Kiểm tra đã chuyển thành session chưa
        if slot["status"] == "Đã chuyển thành session":
            return {"success": False, "message": "Lịch rảnh đã chuyển thành session, không thể hủy"}
        
        # Kiểm tra thời gian hủy (trong vòng 1 phút sau khi đăng ký)
        if not self._check_can_cancel_or_change(slot_id, user_id, seconds_after_registration=60):
            return {"success": False, "message": "Không thể hủy: Đã quá 1 phút sau khi đăng ký"}
        
        slot["registered_participants"].remove(user_id)
        # Xóa thời gian đăng ký
        if "registration_times" in slot and user_id in slot["registration_times"]:
            del slot["registration_times"][user_id]
        
        # Gửi thông báo
        self._send_slot_cancelled_notification(user_id, slot)
        
        return {
            "success": True,
            "message": "Hủy đăng ký thành công",
            "slot": slot
        }
    
    def change_slot(self, data: ChangeSlotRequest) -> Dict:
        """Sinh viên thay đổi lịch đã đăng ký (cùng tutor)"""
        old_slot = fake_available_slots_db.get(data.old_slot_id)
        new_slot = fake_available_slots_db.get(data.new_slot_id)
        
        if not old_slot or not new_slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        # Kiểm tra cùng tutor
        if old_slot["tutor_id"] != new_slot["tutor_id"]:
            return {"success": False, "message": "Chỉ có thể đổi lịch của cùng một tutor"}
        
        # Kiểm tra đã đăng ký lịch cũ chưa
        if data.user_id not in old_slot.get("registered_participants", []):
            return {"success": False, "message": "Bạn chưa đăng ký lịch rảnh cũ"}
        
        # Kiểm tra lịch cũ đã chuyển thành session chưa
        if old_slot["status"] == "Đã chuyển thành session":
            return {"success": False, "message": "Lịch rảnh cũ đã chuyển thành session, không thể đổi"}
        
        # Kiểm tra thời gian đổi (trong vòng 1 phút sau khi đăng ký)
        if not self._check_can_cancel_or_change(data.old_slot_id, data.user_id, seconds_after_registration=60):
            return {"success": False, "message": "Không thể đổi: Đã quá 1 phút sau khi đăng ký lịch cũ"}
        
        # Kiểm tra lịch mới còn chỗ không
        if len(new_slot.get("registered_participants", [])) >= new_slot["max_participants"]:
            return {"success": False, "message": "Lịch rảnh mới đã đầy"}
        
        # Kiểm tra đã đăng ký lịch mới chưa
        if data.user_id in new_slot.get("registered_participants", []):
            return {"success": False, "message": "Bạn đã đăng ký lịch rảnh mới rồi"}
        
        # Kiểm tra xung đột với các lịch khác (trừ lịch cũ)
        if self._check_schedule_conflict(data.user_id, new_slot["start_time"], new_slot["end_time"], data.old_slot_id):
            return {"success": False, "message": "Xung đột lịch: Bạn đã có buổi tư vấn khác trong khoảng thời gian này"}
        
        # Thực hiện đổi lịch
        old_slot["registered_participants"].remove(data.user_id)
        new_slot["registered_participants"].append(data.user_id)
        
        # Cập nhật thời gian đăng ký cho lịch mới
        if "registration_times" not in new_slot:
            new_slot["registration_times"] = {}
        new_slot["registration_times"][data.user_id] = datetime.now().isoformat()
        
        # Xóa thời gian đăng ký của lịch cũ
        if "registration_times" in old_slot and data.user_id in old_slot["registration_times"]:
            del old_slot["registration_times"][data.user_id]
        
        # Gửi thông báo
        self._send_slot_changed_notification(data.user_id, old_slot, new_slot)
        
        return {
            "success": True,
            "message": "Đổi lịch thành công",
            "old_slot": old_slot,
            "new_slot": new_slot
        }
    
    def delete_slot(self, slot_id: str, tutor_id: str) -> Dict:
        """Tutor xóa lịch rảnh (không ràng buộc điều kiện)"""
        slot = fake_available_slots_db.get(slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["tutor_id"] != tutor_id:
            return {"success": False, "message": "Bạn không có quyền xóa lịch rảnh này"}
        
        # Xóa slot
        del fake_available_slots_db[slot_id]
        
        return {
            "success": True,
            "message": "Đã xóa lịch rảnh thành công"
        }
    
    def close_slot(self, data: CloseSlotRequest) -> Dict:
        """Đóng đăng ký lịch rảnh và chuyển thành session (nếu đạt ngưỡng)"""
        slot = fake_available_slots_db.get(data.slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["tutor_id"] != data.tutor_id:
            return {"success": False, "message": "Bạn không có quyền đóng lịch rảnh này"}
        
        if slot["status"] != "Mở đăng ký":
            return {"success": False, "message": "Lịch rảnh không còn mở đăng ký"}
        
        # Tutor có thể đóng bất cứ lúc nào (không ràng buộc điều kiện)
        # Logic này chỉ áp dụng cho sinh viên hủy/đổi
        
        registered_count = len(slot.get("registered_participants", []))
        
        # Kiểm tra đạt ngưỡng tối thiểu
        if registered_count < slot["min_participants"]:
            # Đóng nhưng không chuyển thành session
            slot["status"] = "Đã đóng"
            slot["closed_at"] = datetime.now().isoformat()
            return {
                "success": True,
                "message": f"Đã đóng lịch rảnh. Số lượng đăng ký ({registered_count}) chưa đạt ngưỡng tối thiểu ({slot['min_participants']})",
                "slot": slot,
                "converted_to_session": False
            }
        
        # Chuyển thành session
        session_id = f"S{str(uuid.uuid4())[:6]}"
        session = {
            "sessionID": session_id,
            "tutor": slot["tutor_id"],
            "participants": slot["registered_participants"].copy(),
            "topic": slot.get("topic", "Buổi tư vấn"),
            "mode": slot["mode"],
            "status": "Sắp diễn ra",
            "startTime": slot["start_time"],
            "endTime": slot["end_time"],
            "maxParticipants": slot["max_participants"],
            "resources": [],
            "location": slot.get("location", ""),
            "content": slot.get("topic", "")
        }
        
        fake_sessions_db[session_id] = session
        
        # Cập nhật status slot
        slot["status"] = "Đã chuyển thành session"
        slot["closed_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": f"Đã đóng đăng ký và chuyển thành session. Số lượng đăng ký: {registered_count}",
            "slot": slot,
            "session": session,
            "converted_to_session": True
        }
    
    def get_user_registered_slots(self, user_id: str) -> List[Dict]:
        """Lấy tất cả lịch rảnh mà user đã đăng ký (chỉ trong vòng 1 phút sau khi đăng ký)"""
        slots = []
        now = datetime.now()
        
        for slot in list(fake_available_slots_db.values()):
            if user_id not in slot.get("registered_participants", []):
                continue
            
            # Bỏ qua nếu đã chuyển thành session
            if slot.get("status") == "Đã chuyển thành session":
                continue
            
            # Lấy thời gian đăng ký của user
            registration_times = slot.get("registration_times", {})
            registered_at_str = registration_times.get(user_id, None)
            
            if not registered_at_str:
                # Nếu không có thời gian đăng ký (trường hợp cũ), bỏ qua
                continue
            
            try:
                registered_at = datetime.fromisoformat(registered_at_str)
                time_diff = (now - registered_at).total_seconds()
                
                # Nếu quá 1 phút (60 giây), tự động chuyển thành session
                if time_diff > 60:
                    # Kiểm tra xem đã tạo session chưa (tránh tạo trùng)
                    slot_id = slot.get("slot_id")
                    existing_session = None
                    for session in fake_sessions_db.values():
                        if session.get("_slot_id") == slot_id:
                            existing_session = session
                            break
                    
                    if not existing_session:
                        # Tạo session mới
                        session_id = f"S{str(uuid.uuid4())[:6]}"
                        session = {
                            "sessionID": session_id,
                            "tutor": slot["tutor_id"],
                            "participants": slot["registered_participants"].copy(),
                            "topic": slot.get("topic", "Buổi tư vấn"),
                            "mode": slot["mode"],
                            "status": "Sắp diễn ra",
                            "startTime": slot["start_time"],
                            "endTime": slot["end_time"],
                            "maxParticipants": slot["max_participants"],
                            "resources": [],
                            "location": slot.get("location", ""),
                            "content": slot.get("topic", ""),
                            "_slot_id": slot_id  # Đánh dấu session được tạo từ slot này
                        }
                        fake_sessions_db[session_id] = session
                        
                        # Gửi thông báo cho tất cả participants
                        tutor_profile = fake_profiles_db.get(slot["tutor_id"])
                        tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
                        for participant_id in slot["registered_participants"]:
                            self._send_slot_to_session_notification(participant_id, slot, session_id, tutor_name)
                    
                    # Cập nhật status slot
                    slot["status"] = "Đã chuyển thành session"
                    slot["closed_at"] = datetime.now().isoformat()
                    continue  # Không thêm vào danh sách slots
                
                # Chỉ thêm slot nếu còn trong vòng 1 phút
                tutor_profile = fake_profiles_db.get(slot["tutor_id"])
                slot_with_tutor = {
                    **slot,
                    "tutor_name": tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"],
                    "registered_at": registered_at_str
                }
                slots.append(slot_with_tutor)
            except:
                continue
        
        # Sắp xếp theo thời gian
        slots.sort(key=lambda x: x.get("start_time", ""))
        return slots
    
    def _send_slot_cancelled_notification(self, user_id: str, slot: Dict):
        """Gửi thông báo khi hủy lịch rảnh"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(slot["tutor_id"])
        tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_cancelled",
            title="Lịch rảnh đã bị hủy",
            message=f"Lịch rảnh '{slot.get('topic', 'Buổi tư vấn')}' với tutor {tutor_name} đã bị hủy do không đạt đủ số lượng tối thiểu sau 60 giây.",
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_slot_changed_notification(self, user_id: str, old_slot: Dict, new_slot: Dict):
        """Gửi thông báo khi thay đổi lịch rảnh"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(new_slot["tutor_id"])
        tutor_name = tutor_profile.get("full_name") if tutor_profile else new_slot["tutor_id"]
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_changed",
            title="Đã thay đổi lịch rảnh",
            message=f"Bạn đã thay đổi lịch rảnh với tutor {tutor_name}.",
            related_id=new_slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_slot_to_session_notification(self, user_id: str, slot: Dict, session_id: str, tutor_name: str):
        """Gửi thông báo khi lịch rảnh chuyển thành buổi tư vấn"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_to_session",
            title="Lịch rảnh đã chuyển thành buổi tư vấn",
            message=f"Lịch rảnh của bạn với tutor {tutor_name} đã chuyển thành buổi tư vấn.",
            related_id=session_id,
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def update_slot(self, data: UpdateAvailableSlot) -> Dict:
        """Tutor cập nhật lịch rảnh (thời gian, hình thức, số lượng, địa điểm) - chỉ gửi thông báo nếu đã có người đăng ký VÀ quá 1 phút sau khi tạo"""
        slot = fake_available_slots_db.get(data.slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["tutor_id"] != data.tutor_id:
            return {"success": False, "message": "Bạn không có quyền chỉnh sửa lịch rảnh này"}
        
        # Kiểm tra xem có người đăng ký không và đã quá 1 phút sau khi tạo chưa
        has_registrations = len(slot.get("registered_participants", [])) > 0
        created_at = datetime.fromisoformat(slot.get("created_at", datetime.now().isoformat()))
        time_since_creation = (datetime.now() - created_at).total_seconds()
        within_one_minute = time_since_creation <= 60
        
        # Chỉ gửi thông báo nếu đã có người đăng ký VÀ quá 1 phút sau khi tạo
        if has_registrations and not within_one_minute:
            # Tạo change request và gửi thông báo
            change_request_id = f"CHANGE{str(uuid.uuid4())[:8].upper()}"
            old_data = {
                "start_time": slot.get("start_time"),
                "end_time": slot.get("end_time"),
                "mode": slot.get("mode"),
                "location": slot.get("location"),
                "max_participants": slot.get("max_participants")
            }
            
            # Lưu thông tin thay đổi
            if "pending_changes" not in slot:
                slot["pending_changes"] = {}
            slot["pending_changes"][change_request_id] = {
                "change_request_id": change_request_id,
                "old_data": old_data,
                "new_data": {
                    "start_time": data.start_time if data.start_time else old_data["start_time"],
                    "end_time": data.end_time if data.end_time else old_data["end_time"],
                    "mode": data.mode if data.mode else old_data["mode"],
                    "location": data.location if data.location is not None else old_data["location"],
                    "max_participants": data.max_participants if data.max_participants else old_data["max_participants"]
                },
                "created_at": datetime.now().isoformat(),
                "responses": {},  # user_id -> "accept" hoặc "reject"
                "status": "pending"  # pending, approved, rejected
            }
            
            # Gửi thông báo cho tất cả participants
            for participant_id in slot["registered_participants"]:
                self._send_change_notification(participant_id, slot, change_request_id)
            
            return {
                "success": True,
                "message": "Đã gửi yêu cầu thay đổi. Đang chờ phản hồi từ sinh viên.",
                "slot": slot,
                "change_request_id": change_request_id,
                "requires_approval": True
            }
        else:
            # Không có người đăng ký, cập nhật trực tiếp
            if data.start_time:
                slot["start_time"] = data.start_time
            if data.end_time:
                slot["end_time"] = data.end_time
            if data.topic is not None:
                slot["topic"] = data.topic
            if data.max_participants:
                slot["max_participants"] = data.max_participants
            if data.mode:
                slot["mode"] = data.mode
            if data.location is not None:
                slot["location"] = data.location
            if data.min_participants:
                slot["min_participants"] = data.min_participants
            
            return {
                "success": True,
                "message": "Cập nhật lịch rảnh thành công",
                "slot": slot,
                "requires_approval": False
            }
    
    def confirm_slot(self, data: ConfirmSlotRequest) -> Dict:
        """Tutor xác nhận slot (chuyển thành session)"""
        return self.close_slot(CloseSlotRequest(slot_id=data.slot_id, tutor_id=data.tutor_id))
    
    def cancel_slot(self, data: CancelSlotRequest) -> Dict:
        """Tutor hủy slot - chỉ gửi thông báo nếu đã có người đăng ký VÀ quá 1 phút sau khi tạo"""
        slot = fake_available_slots_db.get(data.slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["tutor_id"] != data.tutor_id:
            return {"success": False, "message": "Bạn không có quyền hủy lịch rảnh này"}
        
        # Kiểm tra xem có người đăng ký không và đã quá 1 phút sau khi tạo chưa
        has_registrations = len(slot.get("registered_participants", [])) > 0
        created_at = datetime.fromisoformat(slot.get("created_at", datetime.now().isoformat()))
        time_since_creation = (datetime.now() - created_at).total_seconds()
        within_one_minute = time_since_creation <= 60
        
        # Chỉ gửi thông báo nếu đã có người đăng ký VÀ quá 1 phút sau khi tạo
        if has_registrations and not within_one_minute:
            # Gửi thông báo cho tất cả participants
            for participant_id in slot.get("registered_participants", []):
                self._send_slot_cancelled_by_tutor_notification(participant_id, slot, data.reason)
        
        # Xóa slot (luôn luôn xóa, không cần thông báo nếu trong vòng 1 phút)
        del fake_available_slots_db[data.slot_id]
        
        return {
            "success": True,
            "message": "Đã hủy lịch rảnh thành công"
        }
    
    def propose_reschedule(self, data: ProposeRescheduleRequest) -> Dict:
        """Tutor đề xuất đổi lịch"""
        slot = fake_available_slots_db.get(data.slot_id)
        if not slot:
            return {"success": False, "message": "Lịch rảnh không tồn tại"}
        
        if slot["tutor_id"] != data.tutor_id:
            return {"success": False, "message": "Bạn không có quyền đề xuất đổi lịch này"}
        
        if len(slot.get("registered_participants", [])) == 0:
            return {"success": False, "message": "Lịch rảnh chưa có người đăng ký"}
        
        # Tạo reschedule request
        reschedule_request_id = f"RESCHEDULE{str(uuid.uuid4())[:8].upper()}"
        old_data = {
            "start_time": slot.get("start_time"),
            "end_time": slot.get("end_time"),
            "location": slot.get("location")
        }
        
        if "pending_reschedules" not in slot:
            slot["pending_reschedules"] = {}
        slot["pending_reschedules"][reschedule_request_id] = {
            "reschedule_request_id": reschedule_request_id,
            "old_data": old_data,
            "new_data": {
                "start_time": data.new_start_time,
                "end_time": data.new_end_time,
                "location": data.new_location if data.new_location else old_data["location"]
            },
            "reason": data.reason,
            "created_at": datetime.now().isoformat(),
            "responses": {},
            "status": "pending"
        }
        
        # Gửi thông báo cho tất cả participants
        for participant_id in slot["registered_participants"]:
            self._send_reschedule_notification(participant_id, slot, reschedule_request_id, data.reason)
        
        return {
            "success": True,
            "message": "Đã gửi đề xuất đổi lịch. Đang chờ phản hồi từ sinh viên.",
            "slot": slot,
            "reschedule_request_id": reschedule_request_id
        }
    
    def respond_to_change(self, data: ChangeResponseRequest) -> Dict:
        """Sinh viên phản hồi thay đổi (Đồng ý/Từ chối)"""
        # Tìm slot có change request này
        for slot in fake_available_slots_db.values():
            if "pending_changes" in slot and data.change_request_id in slot["pending_changes"]:
                change_request = slot["pending_changes"][data.change_request_id]
                
                # Lưu phản hồi
                change_request["responses"][data.user_id] = data.response
                
                # Kiểm tra tất cả đã phản hồi chưa
                all_participants = slot.get("registered_participants", [])
                all_responded = all(user_id in change_request["responses"] for user_id in all_participants)
                
                if all_responded:
                    # Đếm số đồng ý
                    accept_count = sum(1 for r in change_request["responses"].values() if r == "accept")
                    total_count = len(all_participants)
                    approval_rate = accept_count / total_count if total_count > 0 else 0
                    
                    # Chính sách: cần >= 50% đồng ý
                    if approval_rate >= 0.5:
                        # Áp dụng thay đổi
                        new_data = change_request["new_data"]
                        if "start_time" in new_data:
                            slot["start_time"] = new_data["start_time"]
                        if "end_time" in new_data:
                            slot["end_time"] = new_data["end_time"]
                        if "mode" in new_data:
                            slot["mode"] = new_data["mode"]
                        if "location" in new_data:
                            slot["location"] = new_data["location"]
                        if "max_participants" in new_data:
                            slot["max_participants"] = new_data["max_participants"]
                        
                        change_request["status"] = "approved"
                        slot["status"] = "Đã thay đổi"
                        
                        # Gửi thông báo xác nhận
                        for participant_id in all_participants:
                            self._send_change_approved_notification(participant_id, slot)
                    else:
                        # Không đạt tỷ lệ, giữ nguyên
                        change_request["status"] = "rejected"
                        for participant_id in all_participants:
                            self._send_change_rejected_notification(participant_id, slot)
                
                return {
                    "success": True,
                    "message": "Đã ghi nhận phản hồi của bạn",
                    "slot": slot,
                    "change_request": change_request
                }
        
        return {"success": False, "message": "Không tìm thấy yêu cầu thay đổi"}
    
    def respond_to_reschedule(self, reschedule_request_id: str, user_id: str, response: str) -> Dict:
        """Sinh viên phản hồi đề xuất đổi lịch"""
        for slot in fake_available_slots_db.values():
            if "pending_reschedules" in slot and reschedule_request_id in slot["pending_reschedules"]:
                reschedule_request = slot["pending_reschedules"][reschedule_request_id]
                reschedule_request["responses"][user_id] = response
                
                all_participants = slot.get("registered_participants", [])
                all_responded = all(uid in reschedule_request["responses"] for uid in all_participants)
                
                if all_responded:
                    accept_count = sum(1 for r in reschedule_request["responses"].values() if r == "accept")
                    total_count = len(all_participants)
                    approval_rate = accept_count / total_count if total_count > 0 else 0
                    
                    if approval_rate >= 0.5:
                        new_data = reschedule_request["new_data"]
                        slot["start_time"] = new_data["start_time"]
                        slot["end_time"] = new_data["end_time"]
                        slot["location"] = new_data["location"]
                        reschedule_request["status"] = "approved"
                        slot["status"] = "Đã thay đổi"
                        
                        for participant_id in all_participants:
                            self._send_reschedule_approved_notification(participant_id, slot)
                    else:
                        reschedule_request["status"] = "rejected"
                        for participant_id in all_participants:
                            self._send_reschedule_rejected_notification(participant_id, slot)
                
                return {
                    "success": True,
                    "message": "Đã ghi nhận phản hồi của bạn",
                    "slot": slot
                }
        
        return {"success": False, "message": "Không tìm thấy đề xuất đổi lịch"}
    
    def _send_change_notification(self, user_id: str, slot: Dict, change_request_id: str):
        """Gửi thông báo thay đổi lịch rảnh"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(slot["tutor_id"])
        tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_change_request",
            title="Yêu cầu thay đổi lịch rảnh",
            message=f"Tutor {tutor_name} đã yêu cầu thay đổi lịch rảnh. Vui lòng phản hồi.",
            related_id=change_request_id,
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_reschedule_notification(self, user_id: str, slot: Dict, reschedule_request_id: str, reason: Optional[str]):
        """Gửi thông báo đề xuất đổi lịch"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(slot["tutor_id"])
        tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
        
        message = f"Tutor {tutor_name} đã đề xuất đổi lịch rảnh."
        if reason:
            message += f" Lý do: {reason}"
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_reschedule_request",
            title="Đề xuất đổi lịch rảnh",
            message=message,
            related_id=reschedule_request_id,
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_slot_cancelled_by_tutor_notification(self, user_id: str, slot: Dict, reason: Optional[str]):
        """Gửi thông báo khi tutor hủy slot"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(slot["tutor_id"])
        tutor_name = tutor_profile.get("full_name") if tutor_profile else slot["tutor_id"]
        
        message = f"Tutor {tutor_name} đã hủy lịch rảnh."
        if reason:
            message += f" Lý do: {reason}"
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_cancelled_by_tutor",
            title="Lịch rảnh đã bị hủy",
            message=message,
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_change_approved_notification(self, user_id: str, slot: Dict):
        """Gửi thông báo khi thay đổi được chấp nhận"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_change_approved",
            title="Thay đổi lịch rảnh đã được chấp nhận",
            message="Lịch rảnh đã được cập nhật theo yêu cầu.",
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_change_rejected_notification(self, user_id: str, slot: Dict):
        """Gửi thông báo khi thay đổi bị từ chối"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_change_rejected",
            title="Thay đổi lịch rảnh không được chấp nhận",
            message="Lịch rảnh giữ nguyên do không đạt tỷ lệ đồng ý.",
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_reschedule_approved_notification(self, user_id: str, slot: Dict):
        """Gửi thông báo khi đề xuất đổi lịch được chấp nhận"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_reschedule_approved",
            title="Đề xuất đổi lịch đã được chấp nhận",
            message="Lịch rảnh đã được đổi theo đề xuất.",
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)
    
    def _send_reschedule_rejected_notification(self, user_id: str, slot: Dict):
        """Gửi thông báo khi đề xuất đổi lịch bị từ chối"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="slot_reschedule_rejected",
            title="Đề xuất đổi lịch không được chấp nhận",
            message="Lịch rảnh giữ nguyên do không đạt tỷ lệ đồng ý.",
            related_id=slot.get("slot_id"),
            action_url="/mentee/meeting"
        )
        notification_service.create_notification(notification_data)

