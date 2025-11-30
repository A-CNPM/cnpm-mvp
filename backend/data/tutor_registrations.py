"""
Fake data cho tutor registrations
"""
fake_tutor_registrations_db = {
    "REG001": {
        "registration_id": "REG001",
        "user_id": "c.tran",
        "gpa": 3.2,
        "nam_hoc": "Năm 4",
        "tinh_trang_hoc_tap": "Đang học",
        "ho_so_nang_luc": "Sinh viên năm 4 với kinh nghiệm phát triển ứng dụng mobile. Đã có 2 dự án React Native và 1 dự án Flutter.",
        "chung_chi": ["TOEIC 850", "Google Mobile Development Certificate"],
        "mon_muon_day": ["Mobile Development", "React Native", "Flutter"],
        "kinh_nghiem": "Đã từng hướng dẫn 3 sinh viên năm 2 về React Native trong 3 tháng.",
        "ly_do_dang_ky": "Muốn chia sẻ kiến thức và giúp đỡ các bạn sinh viên khác trong lĩnh vực mobile development.",
        "status": "Chờ duyệt",
        "submitted_at": "2025-01-15T10:00:00",
        "updated_at": None
    },
    "REG002": {
        "registration_id": "REG002",
        "user_id": "d.pham",
        "gpa": 3.5,
        "nam_hoc": "Năm 3",
        "tinh_trang_hoc_tap": "Đang học",
        "ho_so_nang_luc": "Sinh viên năm 3 chuyên về Data Science. Có kinh nghiệm với Python, pandas, scikit-learn, và các công cụ visualization.",
        "chung_chi": ["TOEIC 750", "Data Science Certificate"],
        "mon_muon_day": ["Data Science", "Python", "Data Analysis"],
        "kinh_nghiem": "Chưa có kinh nghiệm giảng dạy chính thức nhưng đã từng hỗ trợ các bạn trong nhóm học tập.",
        "ly_do_dang_ky": "Muốn phát triển kỹ năng giảng dạy và giúp đỡ các bạn sinh viên mới bắt đầu với Data Science.",
        "status": "Yêu cầu bổ sung",
        "submitted_at": "2025-01-10T14:00:00",
        "updated_at": "2025-01-12T09:00:00"
    },
    "REG003": {
        "registration_id": "REG003",
        "user_id": "e.hoang",
        "gpa": 3.8,
        "nam_hoc": "Năm 4",
        "tinh_trang_hoc_tap": "Đang học",
        "ho_so_nang_luc": "Sinh viên năm 4 với kinh nghiệm DevOps và Cloud Computing. Có chứng chỉ AWS và kinh nghiệm với Docker, Kubernetes.",
        "chung_chi": ["AWS Certified Solutions Architect", "TOEIC 900"],
        "mon_muon_day": ["DevOps", "Cloud Computing", "Docker"],
        "kinh_nghiem": "Đã từng tổ chức workshop về Docker cho 20 sinh viên trong câu lạc bộ.",
        "ly_do_dang_ky": "Muốn chia sẻ kiến thức về DevOps và Cloud Computing với các bạn sinh viên.",
        "status": "Đã phê duyệt",
        "submitted_at": "2025-01-05T11:00:00",
        "updated_at": "2025-01-07T10:00:00"
    }
}

fake_registration_history_db = {
    "HIST001": {
        "history_id": "HIST001",
        "registration_id": "REG001",
        "action": "submit",
        "reviewed_by": None,
        "reason": None,
        "timestamp": "2025-01-15T10:00:00"
    },
    "HIST002": {
        "history_id": "HIST002",
        "registration_id": "REG002",
        "action": "submit",
        "reviewed_by": None,
        "reason": None,
        "timestamp": "2025-01-10T14:00:00"
    },
    "HIST003": {
        "history_id": "HIST003",
        "registration_id": "REG002",
        "action": "request_more_info",
        "reviewed_by": "admin",
        "reason": "Cần bổ sung thông tin về kinh nghiệm giảng dạy và các dự án Data Science đã thực hiện.",
        "timestamp": "2025-01-12T09:00:00"
    },
    "HIST004": {
        "history_id": "HIST004",
        "registration_id": "REG003",
        "action": "submit",
        "reviewed_by": None,
        "reason": None,
        "timestamp": "2025-01-05T11:00:00"
    },
    "HIST005": {
        "history_id": "HIST005",
        "registration_id": "REG003",
        "action": "approve",
        "reviewed_by": "admin",
        "reason": "Hồ sơ đạt yêu cầu, có kinh nghiệm và chứng chỉ phù hợp.",
        "timestamp": "2025-01-07T10:00:00"
    }
}

