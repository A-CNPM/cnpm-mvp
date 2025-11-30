"""
Database giả lập cho Tutor Professional Profile
Lưu trữ thông tin hồ sơ chuyên môn của Tutor
"""
from typing import Dict, Optional
from datetime import datetime

# Database giả lập: Tutor Professional Profiles
# Key: tutor_id (username)
# Value: thông tin hồ sơ chuyên môn
fake_tutor_profiles_db: Dict[str, Dict] = {
    # Giảng viên - tự động có hiệu lực
    "b.tutor": {
        "tutor_id": "b.tutor",
        # Thông tin từ DATACORE (chỉ đọc)
        "full_name": "Le Van B",
        "ma_can_bo_mssv": "CB001234",
        "email": "b.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Công nghệ phần mềm",
        "trang_thai": "Đang công tác",
        "tutor_type": "Giảng viên",
        # Thông tin bổ sung (có thể chỉnh sửa)
        "linh_vuc_chuyen_mon": ["Công nghệ phần mềm", "Phát triển ứng dụng web"],
        "mon_phu_trach": ["Lập trình Web", "Công nghệ phần mềm"],
        "kinh_nghiem_giang_day": "5 năm kinh nghiệm giảng dạy tại HCMUT",
        "phuong_thuc_lien_he": "Email: b.tutor@hcmut.edu.vn, Phone: 0901234567",
        "mo_ta": "Giảng viên với chuyên môn về công nghệ phần mềm và phát triển ứng dụng web",
        "tags": ["Web Development", "Software Engineering", "Fullstack"],
        # Trạng thái phê duyệt (giảng viên tự động approved)
        "approval_status": "approved",
        "approved_at": "2024-01-01T00:00:00",
        "approved_by": "system",
        # Metadata
        "is_editable": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "history": []
    },
    "f.tutor": {
        "tutor_id": "f.tutor",
        "full_name": "Nguyen Thi F",
        "ma_can_bo_mssv": "CB005678",
        "email": "f.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Trí tuệ nhân tạo",
        "trang_thai": "Đang công tác",
        "tutor_type": "Giảng viên",
        "linh_vuc_chuyen_mon": ["Trí tuệ nhân tạo", "Machine Learning"],
        "mon_phu_trach": ["Trí tuệ nhân tạo", "Học máy"],
        "kinh_nghiem_giang_day": "8 năm kinh nghiệm giảng dạy và nghiên cứu",
        "phuong_thuc_lien_he": "Email: f.tutor@hcmut.edu.vn",
        "mo_ta": "Chuyên gia về trí tuệ nhân tạo và học máy",
        "tags": ["AI", "Machine Learning", "Deep Learning"],
        "approval_status": "approved",
        "approved_at": "2024-01-01T00:00:00",
        "approved_by": "system",
        "is_editable": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "history": []
    },
    # Nghiên cứu sinh - tự động có hiệu lực
    "g.tutor": {
        "tutor_id": "g.tutor",
        "full_name": "Tran Van G",
        "ma_can_bo_mssv": "NCS001234",
        "email": "g.tutor@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Hệ thống thông tin",
        "trang_thai": "Đang học tập",
        "tutor_type": "Nghiên cứu sinh",
        "linh_vuc_chuyen_mon": ["Hệ thống thông tin", "Database"],
        "mon_phu_trach": ["Cơ sở dữ liệu", "Hệ thống thông tin"],
        "kinh_nghiem_giang_day": "2 năm kinh nghiệm hỗ trợ giảng dạy",
        "phuong_thuc_lien_he": "Email: g.tutor@hcmut.edu.vn",
        "mo_ta": "Nghiên cứu sinh chuyên về hệ thống thông tin và cơ sở dữ liệu",
        "tags": ["Database", "Information Systems"],
        "approval_status": "approved",
        "approved_at": "2024-01-01T00:00:00",
        "approved_by": "system",
        "is_editable": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "history": []
    },
    # Sinh viên năm trên - cần phê duyệt
    "h.duong": {
        "tutor_id": "h.duong",
        "full_name": "Duong Van H",
        "ma_can_bo_mssv": "2150001",
        "email": "h.duong@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,  # Sinh viên không có bộ môn
        "trang_thai": "Đang học tập",
        "tutor_type": "Sinh viên năm trên",
        "linh_vuc_chuyen_mon": ["Lập trình", "Web Development"],
        "mon_phu_trach": ["Lập trình C++", "Lập trình Web"],
        "kinh_nghiem_giang_day": "1 năm kinh nghiệm hỗ trợ sinh viên năm dưới",
        "phuong_thuc_lien_he": "Email: h.duong@hcmut.edu.vn, Zalo: 0901234567",
        "mo_ta": "Sinh viên năm 4 với kinh nghiệm lập trình web và hỗ trợ học tập",
        "tags": ["Web", "C++", "Programming"],
        # Sinh viên cần phê duyệt
        "approval_status": "approved",  # Đã được phê duyệt
        "approved_at": "2024-01-15T10:00:00",
        "approved_by": "admin",
        "is_editable": True,  # Sau khi phê duyệt mới được chỉnh sửa
        "created_at": "2024-01-10T00:00:00",
        "updated_at": "2024-01-15T10:00:00",
        "history": []
    },
    "i.vo": {
        "tutor_id": "i.vo",
        "full_name": "Vo Thi I",
        "ma_can_bo_mssv": "2150002",
        "email": "i.vo@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,
        "trang_thai": "Đang học tập",
        "tutor_type": "Sinh viên năm trên",
        "linh_vuc_chuyen_mon": [],
        "mon_phu_trach": [],
        "kinh_nghiem_giang_day": None,
        "phuong_thuc_lien_he": None,
        "mo_ta": None,
        "tags": [],
        # Chưa được phê duyệt
        "approval_status": "pending",
        "approved_at": None,
        "approved_by": None,
        "is_editable": False,  # Chưa được phê duyệt nên không thể chỉnh sửa
        "created_at": "2024-01-20T00:00:00",
        "updated_at": "2024-01-20T00:00:00",
        "history": []
    },
    "e.hoang": {
        "tutor_id": "e.hoang",
        "full_name": "Hoang Van E",
        "ma_can_bo_mssv": "2150003",
        "email": "e.hoang@hcmut.edu.vn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": None,
        "trang_thai": "Đang học tập",
        "tutor_type": "Sinh viên năm trên",
        "linh_vuc_chuyen_mon": ["Data Structures", "Algorithms"],
        "mon_phu_trach": ["Cấu trúc dữ liệu", "Giải thuật"],
        "kinh_nghiem_giang_day": "6 tháng kinh nghiệm hỗ trợ học tập",
        "phuong_thuc_lien_he": "Email: e.hoang@hcmut.edu.vn",
        "mo_ta": "Sinh viên năm 3 chuyên về cấu trúc dữ liệu và giải thuật",
        "tags": ["DSA", "Algorithms"],
        "approval_status": "approved",
        "approved_at": "2024-01-25T14:00:00",
        "approved_by": "admin",
        "is_editable": True,
        "created_at": "2024-01-22T00:00:00",
        "updated_at": "2024-01-25T14:00:00",
        "history": []
    }
}

def get_tutor_profile(tutor_id: str) -> Optional[Dict]:
    """Lấy thông tin hồ sơ chuyên môn của Tutor"""
    return fake_tutor_profiles_db.get(tutor_id)

def update_tutor_profile(tutor_id: str, profile_data: Dict):
    """Cập nhật hồ sơ chuyên môn của Tutor"""
    if tutor_id in fake_tutor_profiles_db:
        fake_tutor_profiles_db[tutor_id].update(profile_data)
        fake_tutor_profiles_db[tutor_id]["updated_at"] = datetime.now().isoformat()
    else:
        fake_tutor_profiles_db[tutor_id] = profile_data

def sync_from_datacore(tutor_id: str, datacore_data: Dict) -> Dict:
    """
    Đồng bộ thông tin từ HCMUT_DATACORE
    Chỉ cập nhật các trường từ DATACORE, không ghi đè thông tin bổ sung
    """
    if tutor_id not in fake_tutor_profiles_db:
        # Tạo mới profile từ DATACORE
        profile = {
            "tutor_id": tutor_id,
            "full_name": datacore_data.get("full_name", ""),
            "ma_can_bo_mssv": datacore_data.get("ma_can_bo_mssv", ""),
            "email": datacore_data.get("email", ""),
            "khoa": datacore_data.get("khoa", ""),
            "bo_mon": datacore_data.get("bo_mon"),
            "trang_thai": datacore_data.get("trang_thai", ""),
            "tutor_type": datacore_data.get("tutor_type", ""),
            "linh_vuc_chuyen_mon": [],
            "mon_phu_trach": [],
            "kinh_nghiem_giang_day": None,
            "phuong_thuc_lien_he": None,
            "mo_ta": None,
            "tags": [],
            "approval_status": "approved" if datacore_data.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"] else "pending",
            "approved_at": datetime.now().isoformat() if datacore_data.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"] else None,
            "approved_by": "system" if datacore_data.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"] else None,
            "is_editable": datacore_data.get("tutor_type") in ["Giảng viên", "Nghiên cứu sinh"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "history": []
        }
        fake_tutor_profiles_db[tutor_id] = profile
    else:
        # Cập nhật chỉ các trường từ DATACORE
        profile = fake_tutor_profiles_db[tutor_id]
        profile["full_name"] = datacore_data.get("full_name", profile.get("full_name", ""))
        profile["ma_can_bo_mssv"] = datacore_data.get("ma_can_bo_mssv", profile.get("ma_can_bo_mssv", ""))
        profile["email"] = datacore_data.get("email", profile.get("email", ""))
        profile["khoa"] = datacore_data.get("khoa", profile.get("khoa", ""))
        profile["bo_mon"] = datacore_data.get("bo_mon", profile.get("bo_mon"))
        profile["trang_thai"] = datacore_data.get("trang_thai", profile.get("trang_thai", ""))
        profile["tutor_type"] = datacore_data.get("tutor_type", profile.get("tutor_type", ""))
        profile["updated_at"] = datetime.now().isoformat()
    
    return fake_tutor_profiles_db[tutor_id]

