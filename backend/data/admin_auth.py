"""
Database giả lập cho Admin authentication
Lưu trữ thông tin Admin đã được xác thực qua HCMUT_SSO
"""
from typing import Dict, Optional

# Database giả lập: Admin đã được xác thực
# Key: email hoặc username
# Value: thông tin Admin
fake_admins_auth_db: Dict[str, Dict] = {
    # Admin khoa
    "admin.khoa@hcmut.edu.vn": {
        "username": "admin.khoa",
        "email": "admin.khoa@hcmut.edu.vn",
        "full_name": "Nguyen Van Admin",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,  # Admin khoa không có bộ môn cụ thể
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "admin_type": "Khoa"
    },
    # Admin bộ môn
    "admin.bomon@hcmut.edu.vn": {
        "username": "admin.bomon",
        "email": "admin.bomon@hcmut.edu.vn",
        "full_name": "Tran Thi Admin",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Công nghệ phần mềm",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "admin_type": "Bộ môn"
    },
    "admin.bomon2@hcmut.edu.vn": {
        "username": "admin.bomon2",
        "email": "admin.bomon2@hcmut.edu.vn",
        "full_name": "Le Van Admin",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Trí tuệ nhân tạo",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "admin_type": "Bộ môn"
    }
}

def get_admin_by_email(email: str) -> Optional[Dict]:
    """Lấy thông tin Admin theo email"""
    return fake_admins_auth_db.get(email.lower())

def get_admin_by_username(username: str) -> Optional[Dict]:
    """Lấy thông tin Admin theo username"""
    for admin in fake_admins_auth_db.values():
        if admin.get("username") == username:
            return admin
    return None

def is_admin_verified(email: str) -> bool:
    """Kiểm tra Admin đã được xác thực chưa"""
    admin = get_admin_by_email(email)
    return admin is not None and admin.get("is_verified", False)

