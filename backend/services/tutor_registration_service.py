from typing import Optional, Dict, List
from data.tutor_registrations import fake_tutor_registrations_db, fake_registration_history_db
from data.users import fake_users_db
from schemas.tutor_registration import (
    TutorRegistrationRequest, 
    TutorRegistration, 
    TutorRegistrationReview,
    TutorRegistrationHistory
)
import uuid
from datetime import datetime

class TutorRegistrationService:
    
    def submit_registration(self, data: TutorRegistrationRequest) -> Dict:
        """Nộp hồ sơ đăng ký Tutor"""
        # Kiểm tra user có tồn tại không
        if data.user_id not in fake_users_db:
            return {"success": False, "message": "User not found"}
        
        # Kiểm tra xem user đã có quyền Tutor chưa
        user = fake_users_db[data.user_id]
        if user.get("role") == "Tutor" or (isinstance(user.get("role"), list) and "Tutor" in user.get("role", [])):
            return {"success": False, "message": "Bạn đã có quyền Tutor"}
        
        # Kiểm tra xem đã có hồ sơ đang chờ duyệt chưa
        for reg in fake_tutor_registrations_db.values():
            if reg["user_id"] == data.user_id and reg["status"] == "Chờ duyệt":
                return {"success": False, "message": "Bạn đã có hồ sơ đang chờ duyệt"}
        
        # Tạo registration_id mới
        registration_id = f"REG{str(uuid.uuid4())[:8].upper()}"
        
        # Tạo hồ sơ đăng ký
        registration = {
            "registration_id": registration_id,
            "user_id": data.user_id,
            "gpa": data.gpa,
            "nam_hoc": data.nam_hoc,
            "tinh_trang_hoc_tap": data.tinh_trang_hoc_tap,
            "ho_so_nang_luc": data.ho_so_nang_luc,
            "chung_chi": data.chung_chi,
            "mon_muon_day": data.mon_muon_day,
            "kinh_nghiem": data.kinh_nghiem,
            "ly_do_dang_ky": data.ly_do_dang_ky,
            "status": "Chờ duyệt",
            "submitted_at": datetime.now().isoformat(),
            "updated_at": None
        }
        
        fake_tutor_registrations_db[registration_id] = registration
        
        # Ghi lịch sử
        history = {
            "history_id": f"HIST{str(uuid.uuid4())[:8].upper()}",
            "registration_id": registration_id,
            "action": "submit",
            "reviewed_by": None,
            "reason": None,
            "timestamp": datetime.now().isoformat()
        }
        fake_registration_history_db[history["history_id"]] = history
        
        # Gửi thông báo
        self._send_notification(data.user_id, registration_id)
        
        return {
            "success": True,
            "message": "Đã nộp hồ sơ thành công. Hồ sơ đang chờ duyệt.",
            "registration": registration
        }
    
    def _send_notification(self, user_id: str, registration_id: str):
        """Gửi thông báo khi nộp đơn đăng ký Tutor"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="tutor_registration",
            title="Đã nộp đơn đăng ký làm Tutor",
            message="Đơn đăng ký làm Tutor của bạn đã được gửi và đang chờ duyệt.",
            related_id=registration_id,
            action_url="/mentee/register-tutor"
        )
        notification_service.create_notification(notification_data)
    
    def get_user_registration(self, user_id: str) -> Optional[Dict]:
        """Lấy hồ sơ đăng ký của user"""
        for reg in fake_tutor_registrations_db.values():
            if reg["user_id"] == user_id:
                return reg
        return None
    
    def get_all_registrations(self, status: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả hồ sơ đăng ký (cho admin)"""
        result = list(fake_tutor_registrations_db.values())
        if status:
            result = [r for r in result if r["status"] == status]
        return result
    
    def review_registration(self, review: TutorRegistrationReview) -> Dict:
        """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ"""
        registration = fake_tutor_registrations_db.get(review.registration_id)
        if not registration:
            return {"success": False, "message": "Registration not found"}
        
        if review.action == "approve":
            # Phê duyệt: Cấp quyền Tutor
            user = fake_users_db.get(registration["user_id"])
            if user:
                # Cập nhật role: nếu đang là Mentee, thêm Tutor
                if user.get("role") == "Mentee":
                    user["role"] = ["Mentee", "Tutor"]
                elif isinstance(user.get("role"), list):
                    if "Tutor" not in user["role"]:
                        user["role"].append("Tutor")
                else:
                    user["role"] = ["Mentee", "Tutor"]
            
            registration["status"] = "Đã phê duyệt"
            message = "Hồ sơ đã được phê duyệt. Bạn đã được cấp quyền Tutor."
            
        elif review.action == "reject":
            # Từ chối
            if not review.reason:
                return {"success": False, "message": "Lý do từ chối là bắt buộc"}
            registration["status"] = "Từ chối"
            message = f"Hồ sơ đã bị từ chối. Lý do: {review.reason}"
            
        elif review.action == "request_more_info":
            # Yêu cầu bổ sung
            if not review.reason:
                return {"success": False, "message": "Lý do yêu cầu bổ sung là bắt buộc"}
            registration["status"] = "Yêu cầu bổ sung"
            message = f"Hồ sơ cần bổ sung thông tin. Lý do: {review.reason}"
        else:
            return {"success": False, "message": "Invalid action"}
        
        registration["updated_at"] = datetime.now().isoformat()
        
        # Ghi lịch sử
        history = {
            "history_id": f"HIST{str(uuid.uuid4())[:8].upper()}",
            "registration_id": review.registration_id,
            "action": review.action,
            "reviewed_by": review.reviewed_by,
            "reason": review.reason,
            "timestamp": datetime.now().isoformat()
        }
        fake_registration_history_db[history["history_id"]] = history
        
        return {
            "success": True,
            "message": message,
            "registration": registration
        }
    
    def update_registration(self, registration_id: str, data: TutorRegistrationRequest) -> Dict:
        """Cập nhật hồ sơ đăng ký (khi yêu cầu bổ sung)"""
        registration = fake_tutor_registrations_db.get(registration_id)
        if not registration:
            return {"success": False, "message": "Registration not found"}
        
        # Chỉ cho phép cập nhật nếu status là "Yêu cầu bổ sung"
        if registration["status"] != "Yêu cầu bổ sung":
            return {"success": False, "message": "Chỉ có thể cập nhật hồ sơ khi trạng thái là 'Yêu cầu bổ sung'"}
        
        # Cập nhật thông tin
        registration["gpa"] = data.gpa
        registration["nam_hoc"] = data.nam_hoc
        registration["tinh_trang_hoc_tap"] = data.tinh_trang_hoc_tap
        registration["ho_so_nang_luc"] = data.ho_so_nang_luc
        registration["chung_chi"] = data.chung_chi
        registration["mon_muon_day"] = data.mon_muon_day
        registration["kinh_nghiem"] = data.kinh_nghiem
        registration["ly_do_dang_ky"] = data.ly_do_dang_ky
        registration["status"] = "Chờ duyệt"  # Chuyển về chờ duyệt sau khi cập nhật
        registration["updated_at"] = datetime.now().isoformat()
        
        # Ghi lịch sử
        history = {
            "history_id": f"HIST{str(uuid.uuid4())[:8].upper()}",
            "registration_id": registration_id,
            "action": "resubmit",
            "reviewed_by": None,
            "reason": "Đã cập nhật và nộp lại hồ sơ",
            "timestamp": datetime.now().isoformat()
        }
        fake_registration_history_db[history["history_id"]] = history
        
        return {
            "success": True,
            "message": "Đã cập nhật và nộp lại hồ sơ thành công",
            "registration": registration
        }
    
    def get_registration_history(self, registration_id: str) -> List[Dict]:
        """Lấy lịch sử của một hồ sơ đăng ký"""
        history_list = []
        for hist in fake_registration_history_db.values():
            if hist["registration_id"] == registration_id:
                history_list.append(hist)
        # Sắp xếp theo thời gian
        history_list.sort(key=lambda x: x["timestamp"])
        return history_list

