"""
Controller cho Admin
"""
from typing import Optional, Dict, List
from services.admin_service import AdminService
from schemas.admin import TutorApprovalRequest, UserSearchCriteria
from data.admin_auth import get_admin_by_username

class AdminController:
    def __init__(self):
        self.service = AdminService()
    
    def verify_admin_login(self, email: str, password: str) -> Dict:
        """Xác thực đăng nhập Admin"""
        admin_auth = self.service.verify_admin_login(email, password)
        if not admin_auth:
            raise ValueError("Xác thực thất bại")
        return admin_auth
    
    def get_pending_tutor_registrations(self, admin_id: str) -> List[Dict]:
        """Lấy danh sách hồ sơ đăng ký Tutor đang chờ duyệt"""
        # Lấy thông tin admin để lọc theo khoa/bộ môn
        admin_auth = get_admin_by_username(admin_id)
        admin_khoa = admin_auth.get("khoa") if admin_auth else None
        admin_bo_mon = admin_auth.get("bo_mon") if admin_auth else None
        
        return self.service.get_pending_tutor_registrations(admin_khoa, admin_bo_mon)
    
    def approve_tutor_registration(self, request: TutorApprovalRequest) -> Dict:
        """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ Tutor"""
        return self.service.approve_tutor_registration(request)
    
    def search_users(self, criteria: UserSearchCriteria, admin_id: str) -> List[Dict]:
        """Tìm kiếm và lọc danh sách users"""
        # Lấy thông tin admin để lọc theo khoa/bộ môn
        admin_auth = get_admin_by_username(admin_id)
        admin_khoa = admin_auth.get("khoa") if admin_auth else None
        admin_bo_mon = admin_auth.get("bo_mon") if admin_auth else None
        
        return self.service.search_users(criteria, admin_khoa, admin_bo_mon)
    
    def get_activity_report(self, admin_id: str) -> Dict:
        """Lấy báo cáo hoạt động chương trình"""
        # Lấy thông tin admin để lọc theo khoa/bộ môn
        admin_auth = get_admin_by_username(admin_id)
        admin_khoa = admin_auth.get("khoa") if admin_auth else None
        admin_bo_mon = admin_auth.get("bo_mon") if admin_auth else None
        
        return self.service.get_activity_report(admin_khoa, admin_bo_mon)
    
    def get_quality_report(self, admin_id: str) -> Dict:
        """Lấy báo cáo chất lượng buổi tư vấn"""
        # Lấy thông tin admin để lọc theo khoa/bộ môn
        admin_auth = get_admin_by_username(admin_id)
        admin_khoa = admin_auth.get("khoa") if admin_auth else None
        admin_bo_mon = admin_auth.get("bo_mon") if admin_auth else None
        
        return self.service.get_quality_report(admin_khoa, admin_bo_mon)

