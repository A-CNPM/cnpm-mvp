"""
Database giả lập HCMUT_DATACORE
Lưu trữ thông tin cơ bản của cán bộ và sinh viên (chỉ đọc)
"""
from typing import Dict, Optional

# Database giả lập HCMUT_DATACORE
# Key: username hoặc email
# Value: thông tin từ DATACORE
fake_datacore_db: Dict[str, Dict] = {
    # Giảng viên
    "b.tutor": {
        "username": "b.tutor",
        "full_name": "Le Van B",
        "ma_can_bo": "CB001",
        "email": "b.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Khoa học máy tính",
        "trang_thai_cong_tac": "Đang công tác",
        "tutor_type": "Giảng viên"
    },
    "f.tutor": {
        "username": "f.tutor",
        "full_name": "Nguyen Thi F",
        "ma_can_bo": "CB002",
        "email": "f.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn An ninh mạng",
        "trang_thai_cong_tac": "Đang công tác",
        "tutor_type": "Giảng viên"
    },
    # Nghiên cứu sinh
    "g.tutor": {
        "username": "g.tutor",
        "full_name": "Tran Van G",
        "ma_can_bo": "CB003",
        "email": "g.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Kỹ thuật phần mềm",
        "trang_thai_cong_tac": "Đang học tập",
        "tutor_type": "Nghiên cứu sinh"
    },
    # Sinh viên năm trên
    "h.duong": {
        "username": "h.duong",
        "full_name": "Duong Van H",
        "mssv": "2510103",
        "email": "h.duong@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,
        "trang_thai_hoc_tap": "Đang học",
        "tutor_type": "Sinh viên năm trên"
    },
    "i.vo": {
        "username": "i.vo",
        "full_name": "Vo Thi I",
        "mssv": "2510104",
        "email": "i.vo@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,
        "trang_thai_hoc_tap": "Đang học",
        "tutor_type": "Sinh viên năm trên"
    },
    "e.hoang": {
        "username": "e.hoang",
        "full_name": "Hoang Van E",
        "mssv": "2510004",
        "email": "e.hoang@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,
        "trang_thai_hoc_tap": "Đang học",
        "tutor_type": "Sinh viên năm trên"
    },
}

def get_datacore_info(username: str) -> Optional[Dict]:
    """Lấy thông tin từ HCMUT_DATACORE"""
    return fake_datacore_db.get(username)

def sync_datacore_info(username: str) -> Optional[Dict]:
    """Đồng bộ thông tin từ HCMUT_DATACORE (giả lập)"""
    return get_datacore_info(username)

