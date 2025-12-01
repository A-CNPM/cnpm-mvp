"""
Router cho Admin
"""
from fastapi import APIRouter, HTTPException, status, Query
from controllers.admin_controller import AdminController
from schemas.admin import AdminLoginRequest, TutorApprovalRequest, UserSearchCriteria
from typing import List, Optional
from core.security import create_access_token

router = APIRouter(prefix="/admin", tags=["admin"])
controller = AdminController()

@router.post("/login")
def admin_login(data: AdminLoginRequest):
    """Đăng nhập Admin"""
    try:
        admin_auth = controller.verify_admin_login(data.email, data.password)
        
        # Tạo token
        access_token = create_access_token({
            "sub": admin_auth.get("username"),
            "role": "Admin",
            "admin_type": admin_auth.get("admin_type"),
            "khoa": admin_auth.get("khoa"),
            "bo_mon": admin_auth.get("bo_mon")
        })
        
        return {
            "success": True,
            "access_token": access_token,
            "username": admin_auth.get("username"),
            "full_name": admin_auth.get("full_name"),
            "role": "Admin",
            "admin_type": admin_auth.get("admin_type"),
            "khoa": admin_auth.get("khoa"),
            "bo_mon": admin_auth.get("bo_mon")
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/tutor-registrations/pending")
def get_pending_registrations(admin_id: str = Query(..., description="ID của admin")):
    """Lấy danh sách hồ sơ đăng ký Tutor đang chờ duyệt"""
    try:
        registrations = controller.get_pending_tutor_registrations(admin_id)
        return {"success": True, "registrations": registrations}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/tutor-registrations/approve")
def approve_tutor_registration(request: TutorApprovalRequest):
    """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ Tutor"""
    try:
        result = controller.approve_tutor_registration(request)
        if not result.get("success"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/users/search")
def search_users(
    admin_id: str = Query(..., description="ID của admin"),
    keyword: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    khoa: Optional[str] = Query(None),
    bo_mon: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Tìm kiếm và lọc danh sách users"""
    try:
        criteria = UserSearchCriteria(
            keyword=keyword,
            role=role,
            khoa=khoa,
            bo_mon=bo_mon,
            status=status
        )
        users = controller.search_users(criteria, admin_id)
        return {"success": True, "users": users}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/reports/activity")
def get_activity_report(admin_id: str = Query(..., description="ID của admin")):
    """Lấy báo cáo hoạt động chương trình"""
    try:
        report = controller.get_activity_report(admin_id)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/reports/quality")
def get_quality_report(admin_id: str = Query(..., description="ID của admin")):
    """Lấy báo cáo chất lượng buổi tư vấn"""
    try:
        report = controller.get_quality_report(admin_id)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

