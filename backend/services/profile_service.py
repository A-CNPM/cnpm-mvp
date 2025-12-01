from typing import Optional, Dict, List
from datetime import datetime
from data.profiles import fake_profiles_db
from schemas.profile import UpdateProfileRequest, ProfileHistoryItem
from schemas.notification import CreateNotification

class ProfileService:
    # Danh sách các trường từ DATACORE (chỉ đọc)
    DATACORE_FIELDS = {"full_name", "email", "mssv", "khoa", "nganh", "trinh_do"}
    
    # Danh sách các trường có thể chỉnh sửa
    EDITABLE_FIELDS = {"nhu_cau_ho_tro", "linh_vuc_quan_tam", "phuong_thuc_lien_he", "mo_ta", "tags"}

    def get_profile(self, user_id: str) -> Optional[Dict]:
        """Lấy thông tin profile của user"""
        profile = fake_profiles_db.get(user_id)
        if profile:
            # Đảm bảo các trường mới có giá trị mặc định
            if "nhu_cau_ho_tro" not in profile:
                profile["nhu_cau_ho_tro"] = None
            if "linh_vuc_quan_tam" not in profile:
                profile["linh_vuc_quan_tam"] = []
            if "phuong_thuc_lien_he" not in profile:
                profile["phuong_thuc_lien_he"] = None
            if "history" not in profile:
                profile["history"] = []
        return profile

    def update_profile(self, user_id: str, update_data: UpdateProfileRequest, changed_by: str = None) -> Dict:
        """
        Cập nhật profile với validation và history tracking
        Chỉ cho phép cập nhật các trường bổ sung, không được cập nhật thông tin từ DATACORE
        """
        if user_id not in fake_profiles_db:
            raise ValueError("Profile not found")
        
        profile = fake_profiles_db[user_id]
        update_dict = update_data.dict(exclude_unset=True)
        
        # Kiểm tra không được cập nhật các trường từ DATACORE
        for field in self.DATACORE_FIELDS:
            if field in update_dict:
                raise ValueError(f"Không được phép cập nhật trường {field} (từ HCMUT_DATACORE)")
        
        # Chỉ cho phép cập nhật các trường có thể chỉnh sửa
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
                    "changed_by": changed_by or user_id
                })
                allowed_updates[field] = new_value
        
        # Cập nhật profile
        profile.update(allowed_updates)
        
        # Thêm vào lịch sử
        if "history" not in profile:
            profile["history"] = []
        profile["history"].extend(history_items)
        
        # Gửi thông báo nếu có thay đổi
        if history_items:
            self._send_notification(user_id)
        
        return profile

    def _send_notification(self, user_id: str):
        """Gửi thông báo khi cập nhật profile"""
        from services.notification_service import NotificationService
        notification_service = NotificationService()
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="profile_update",
            title="Cập nhật hồ sơ thành công",
            message="Hồ sơ cá nhân của bạn đã được cập nhật thành công.",
            related_id=user_id,
            action_url=f"/mentee/id={user_id}"
        )
        notification_service.create_notification(notification_data)

    def get_profile_history(self, user_id: str) -> List[Dict]:
        """Lấy lịch sử thay đổi của profile"""
        profile = self.get_profile(user_id)
        if not profile:
            return []
        return profile.get("history", [])

    def sync_from_datacore(self, user_id: str) -> bool:
        """Đồng bộ thông tin từ HCMUT_DATACORE (mock implementation)"""
        return user_id in fake_profiles_db
