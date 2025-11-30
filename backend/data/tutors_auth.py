"""
Database giả lập cho Tutor authentication
Lưu trữ thông tin Tutor đã được xác thực qua HCMUT_SSO và đồng bộ từ HCMUT_DATACORE
"""
from typing import Dict, Optional

# Database giả lập: Tutor đã được xác thực
# Key: email hoặc username
# Value: thông tin Tutor
fake_tutors_auth_db: Dict[str, Dict] = {
    # Giảng viên
    "b.tutor@hcmut.edu.vn": {
        "username": "b.tutor",
        "email": "b.tutor@hcmut.edu.vn",
        "full_name": "Le Van B",
        "tutor_type": "Giảng viên",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE"
    },
    "f.tutor@hcmut.edu.vn": {
        "username": "f.tutor",
        "email": "f.tutor@hcmut.edu.vn",
        "full_name": "Nguyen Thi F",
        "tutor_type": "Giảng viên",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE"
    },
    # Nghiên cứu sinh
    "g.tutor@hcmut.edu.vn": {
        "username": "g.tutor",
        "email": "g.tutor@hcmut.edu.vn",
        "full_name": "Tran Van G",
        "tutor_type": "Nghiên cứu sinh",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE"
    },
    # Sinh viên năm trên (có cả vai trò Mentee)
    "h.duong@hcmut.edu.vn": {
        "username": "h.duong",
        "email": "h.duong@hcmut.edu.vn",
        "full_name": "Duong Van H",
        "tutor_type": "Sinh viên năm trên",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE",
        "has_mentee_role": True  # Có cả vai trò Mentee
    },
    "i.vo@hcmut.edu.vn": {
        "username": "i.vo",
        "email": "i.vo@hcmut.edu.vn",
        "full_name": "Vo Thi I",
        "tutor_type": "Sinh viên năm trên",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE",
        "has_mentee_role": True  # Có cả vai trò Mentee
    },
    "e.hoang@hcmut.edu.vn": {
        "username": "e.hoang",
        "email": "e.hoang@hcmut.edu.vn",
        "full_name": "Hoang Van E",
        "tutor_type": "Sinh viên năm trên",
        "is_verified": True,
        "verified_by": "HCMUT_SSO",
        "synced_from": "HCMUT_DATACORE",
        "has_mentee_role": True  # Có cả vai trò Mentee
    },
}

def get_tutor_by_email(email: str) -> Optional[Dict]:
    """Lấy thông tin Tutor theo email"""
    return fake_tutors_auth_db.get(email.lower())

def get_tutor_by_username(username: str) -> Optional[Dict]:
    """Lấy thông tin Tutor theo username"""
    for tutor in fake_tutors_auth_db.values():
        if tutor.get("username") == username:
            return tutor
    return None

def is_tutor_verified(email: str) -> bool:
    """Kiểm tra Tutor đã được xác thực chưa"""
    tutor = get_tutor_by_email(email)
    return tutor is not None and tutor.get("is_verified", False)

