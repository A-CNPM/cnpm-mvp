"""
Service xử lý logic nghiệp vụ cho Tutor Professional Profile
"""
from typing import Optional, Dict, List
from datetime import datetime
from data.tutor_profiles import get_tutor_profile, update_tutor_profile, sync_from_datacore
from data.tutors_auth import get_tutor_by_username
from schemas.tutor_profile import UpdateTutorProfileRequest


class TutorProfileService:
    # Danh sách các trường từ DATACORE (chỉ đọc)
    DATACORE_FIELDS = {"full_name", "ma_can_bo_mssv", "email", "khoa", "bo_mon", "trang_thai", "tutor_type"}
    
    # Danh sách các trường có thể chỉnh sửa
    EDITABLE_FIELDS = {
        "linh_vuc_chuyen_mon", 
        "mon_phu_trach", 
        "kinh_nghiem_giang_day", 
        "phuong_thuc_lien_he", 
        "mo_ta", 
        "tags"
    }

    def get_profile(self, tutor_id: str) -> Optional[Dict]:
        """Lấy thông tin hồ sơ chuyên môn của Tutor"""
        profile = get_tutor_profile(tutor_id)
        
        if not profile:
            # Nếu chưa có profile, đồng bộ từ DATACORE
            tutor_auth = get_tutor_by_username(tutor_id)
            if tutor_auth:
                datacore_data = {
                    "full_name": tutor_auth.get("full_name", ""),
                    "ma_can_bo_mssv": tutor_auth.get("ma_can_bo_mssv", tutor_id),
                    "email": tutor_auth.get("email", f"{tutor_id}@hcmut.edu.vn"),
                    "khoa": tutor_auth.get("khoa", "Khoa Khoa học và Kỹ thuật máy tính"),
                    "bo_mon": tutor_auth.get("bo_mon"),
                    "trang_thai": tutor_auth.get("trang_thai", "Đang công tác" if tutor_auth.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"] else "Đang học tập"),
                    "tutor_type": tutor_auth.get("tutor_type", "Sinh viên năm trên")
                }
                profile = sync_from_datacore(tutor_id, datacore_data)
        
        if profile:
            # Đảm bảo các trường có giá trị mặc định
            if "linh_vuc_chuyen_mon" not in profile:
                profile["linh_vuc_chuyen_mon"] = []
            if "mon_phu_trach" not in profile:
                profile["mon_phu_trach"] = []
            if "tags" not in profile:
                profile["tags"] = []
            if "history" not in profile:
                profile["history"] = []
        
        return profile

    def can_edit(self, tutor_id: str) -> bool:
        """Kiểm tra Tutor có được phép chỉnh sửa hồ sơ không"""
        profile = get_tutor_profile(tutor_id)
        if not profile:
            return False
        
        tutor_type = profile.get("tutor_type", "")
        
        # Giảng viên và Nghiên cứu sinh: tự động có hiệu lực
        if tutor_type in ["Giảng viên", "Nghiên cứu sinh"]:
            return True
        
        # Sinh viên: chỉ được chỉnh sửa sau khi được phê duyệt
        if tutor_type == "Sinh viên năm trên":
            approval_status = profile.get("approval_status")
            return approval_status == "approved"
        
        return False

    def update_profile(self, tutor_id: str, update_data: UpdateTutorProfileRequest, changed_by: str = None) -> Dict:
        """
        Cập nhật hồ sơ chuyên môn của Tutor
        - Chỉ cho phép cập nhật các trường bổ sung
        - Kiểm tra quyền chỉnh sửa
        - Ghi nhận lịch sử thay đổi
        """
        profile = self.get_profile(tutor_id)
        if not profile:
            raise ValueError("Không tìm thấy hồ sơ Tutor")
        
        # Kiểm tra quyền chỉnh sửa
        if not self.can_edit(tutor_id):
            raise ValueError("Bạn chưa được phép chỉnh sửa hồ sơ. Vui lòng chờ phê duyệt từ ban quản trị.")
        
        # Chuyển đổi Pydantic model sang dict
        update_dict = update_data.dict(exclude_none=True)
        
        allowed_updates = {}
        history_items = []
        
        for field, new_value in update_dict.items():
            if field not in self.EDITABLE_FIELDS:
                continue  # Bỏ qua các trường không được phép chỉnh sửa
            
            old_value = profile.get(field)
            
            # Chuyển đổi giá trị để so sánh
            if isinstance(old_value, list):
                old_value_str = ", ".join(map(str, old_value)) if old_value else None
            else:
                old_value_str = str(old_value) if old_value is not None else None
            
            if isinstance(new_value, list):
                new_value_str = ", ".join(map(str, new_value)) if new_value else None
            else:
                new_value_str = str(new_value) if new_value is not None else None
            
            # Chỉ ghi nhận lịch sử nếu có thay đổi
            if old_value_str != new_value_str:
                history_items.append({
                    "field_name": field,
                    "old_value": old_value_str,
                    "new_value": new_value_str,
                    "changed_at": datetime.now().isoformat(),
                    "changed_by": changed_by or tutor_id
                })
                allowed_updates[field] = new_value
        
        # Cập nhật profile
        profile.update(allowed_updates)
        profile["updated_at"] = datetime.now().isoformat()
        
        # Thêm vào lịch sử
        if "history" not in profile:
            profile["history"] = []
        profile["history"].extend(history_items)
        
        # Lưu vào database
        update_tutor_profile(tutor_id, profile)
        
        # Gửi thông báo nếu có thay đổi
        if history_items:
            self._send_notification(tutor_id, "Hồ sơ chuyên môn của bạn đã được cập nhật")
        
        return profile

    def get_profile_history(self, tutor_id: str) -> List[Dict]:
        """Lấy lịch sử thay đổi của hồ sơ"""
        profile = self.get_profile(tutor_id)
        if not profile:
            return []
        
        return profile.get("history", [])

    def sync_from_datacore(self, tutor_id: str) -> Dict:
        """
        Đồng bộ thông tin từ HCMUT_DATACORE
        Giả lập: Lấy từ tutors_auth và users
        """
        tutor_auth = get_tutor_by_username(tutor_id)
        if not tutor_auth:
            raise ValueError("Không tìm thấy thông tin Tutor trong hệ thống")
        
        # Giả lập dữ liệu từ DATACORE
        datacore_data = {
            "full_name": tutor_auth.get("full_name", ""),
            "ma_can_bo_mssv": tutor_auth.get("ma_can_bo_mssv", tutor_id),
            "email": tutor_auth.get("email", f"{tutor_id}@hcmut.edu.vn"),
            "khoa": tutor_auth.get("khoa", "Khoa Khoa học và Kỹ thuật máy tính"),
            "bo_mon": tutor_auth.get("bo_mon"),
            "trang_thai": tutor_auth.get("trang_thai", "Đang công tác" if tutor_auth.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"] else "Đang học tập"),
            "tutor_type": tutor_auth.get("tutor_type", "Sinh viên năm trên")
        }
        
        profile = sync_from_datacore(tutor_id, datacore_data)
        
        # Gửi thông báo
        self._send_notification(tutor_id, "Thông tin từ HCMUT_DATACORE đã được đồng bộ")
        
        return profile

    def approve_profile(self, tutor_id: str, approved_by: str) -> Dict:
        """
        Phê duyệt hồ sơ Tutor (chỉ cho sinh viên)
        Sau khi phê duyệt, Tutor mới được phép chỉnh sửa
        """
        profile = self.get_profile(tutor_id)
        if not profile:
            raise ValueError("Không tìm thấy hồ sơ Tutor")
        
        tutor_type = profile.get("tutor_type", "")
        if tutor_type not in ["Sinh viên năm trên"]:
            raise ValueError("Chỉ sinh viên mới cần phê duyệt hồ sơ")
        
        profile["approval_status"] = "approved"
        profile["approved_at"] = datetime.now().isoformat()
        profile["approved_by"] = approved_by
        profile["is_editable"] = True
        profile["updated_at"] = datetime.now().isoformat()
        
        # Ghi nhận vào lịch sử
        if "history" not in profile:
            profile["history"] = []
        profile["history"].append({
            "field_name": "approval_status",
            "old_value": "pending",
            "new_value": "approved",
            "changed_at": datetime.now().isoformat(),
            "changed_by": approved_by
        })
        
        update_tutor_profile(tutor_id, profile)
        
        # Gửi thông báo
        self._send_notification(tutor_id, "Hồ sơ của bạn đã được phê duyệt. Bạn có thể chỉnh sửa thông tin chuyên môn.")
        
        return profile

    def _send_notification(self, tutor_id: str, message: str):
        """Gửi thông báo (giả lập)"""
        # Trong thực tế sẽ gửi thông báo qua hệ thống notification
        print(f"📧 Thông báo cho {tutor_id}: {message}")

