fake_users_db = {
    # Mentee only
    "a.nguyen": {
        "username": "a.nguyen",
        "full_name": "Nguyen Van A",
        "role": "Mentee",
        "password": "123456"
    },
    "b.levan": {
        "username": "b.levan",
        "full_name": "Tran Thi B",
        "role": "Mentee",
        "password": "123456"
    },
    "c.tran": {
        "username": "c.tran",
        "full_name": "Le Van C",
        "role": "Mentee",
        "password": "123456"
    },
    "d.pham": {
        "username": "d.pham",
        "full_name": "Pham Thi D",
        "role": "Mentee",
        "password": "123456"
    },
    "e.hoang": {
        "username": "e.hoang",
        "full_name": "Hoang Van E",
        "role": ["Mentee", "Tutor"],  # Đã được phê duyệt làm tutor
        "password": "123456"
    },
    # Tutor only (có thể đăng nhập bằng email hoặc username)
    "b.tutor": {
        "username": "b.tutor",
        "full_name": "Le Van B",
        "role": "Tutor",
        "password": "123456",
        "email": "b.tutor@hcmut.edu.vn",
        "tutor_type": "Giảng viên"
    },
    "f.tutor": {
        "username": "f.tutor",
        "full_name": "Nguyen Thi F",
        "role": "Tutor",
        "password": "123456",
        "email": "f.tutor@hcmut.edu.vn",
        "tutor_type": "Giảng viên"
    },
    "g.tutor": {
        "username": "g.tutor",
        "full_name": "Tran Van G",
        "role": "Tutor",
        "password": "123456",
        "email": "g.tutor@hcmut.edu.vn",
        "tutor_type": "Nghiên cứu sinh"
    },
    # Both Mentee and Tutor (Sinh viên năm trên)
    "h.duong": {
        "username": "h.duong",
        "full_name": "Duong Van H",
        "role": ["Mentee", "Tutor"],
        "password": "123456",
        "email": "h.duong@hcmut.edu.vn",
        "tutor_type": "Sinh viên năm trên"
    },
    "i.vo": {
        "username": "i.vo",
        "full_name": "Vo Thi I",
        "role": ["Mentee", "Tutor"],
        "password": "123456",
        "email": "i.vo@hcmut.edu.vn",
        "tutor_type": "Sinh viên năm trên"
    },
    "e.hoang": {
        "username": "e.hoang",
        "full_name": "Hoang Van E",
        "role": ["Mentee", "Tutor"],
        "password": "123456",
        "email": "e.hoang@hcmut.edu.vn",
        "tutor_type": "Sinh viên năm trên"
    },
    # Admin
    "admin.khoa": {
        "username": "admin.khoa",
        "full_name": "Nguyen Van Admin",
        "role": "Admin",
        "password": "123456",
        "email": "admin.khoa@hcmut.edu.vn",
        "admin_type": "Khoa",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính"
    },
    "admin.bomon": {
        "username": "admin.bomon",
        "full_name": "Tran Thi Admin",
        "role": "Admin",
        "password": "123456",
        "email": "admin.bomon@hcmut.edu.vn",
        "admin_type": "Bộ môn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Công nghệ phần mềm"
    },
    "admin.bomon2": {
        "username": "admin.bomon2",
        "full_name": "Le Van Admin",
        "role": "Admin",
        "password": "123456",
        "email": "admin.bomon2@hcmut.edu.vn",
        "admin_type": "Bộ môn",
        "khoa": "Khoa Khoa học và Kỹ thuật máy tính",
        "bo_mon": "Bộ môn Trí tuệ nhân tạo"
    },
}
