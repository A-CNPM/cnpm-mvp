"""
Fake data cho available slots (lịch rảnh của tutor)
"""
fake_available_slots_db = {
    "SLOT001": {
        "slot_id": "SLOT001",
        "tutor_id": "a.nguyen",
        "start_time": "10/11/2025 14:00",
        "end_time": "10/11/2025 16:00",
        "topic": "Hướng dẫn DSA và Thuật toán",
        "max_participants": 5,
        "mode": "Online",
        "location": "www.meet.google.com/dsa-session",
        "registered_participants": ["b.levan", "c.tran"],
        "registration_times": {
            "b.levan": "2025-01-15T10:30:00",
            "c.tran": "2025-01-15T10:35:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-15T10:00:00",
        "closed_at": None
    },
    "SLOT002": {
        "slot_id": "SLOT002",
        "tutor_id": "a.nguyen",
        "start_time": "12/11/2025 19:00",
        "end_time": "12/11/2025 21:00",
        "topic": "Web Development nâng cao",
        "max_participants": 8,
        "mode": "Online",
        "location": "www.meet.google.com/web-advanced",
        "registered_participants": ["d.pham"],
        "registration_times": {
            "d.pham": "2025-01-16T09:15:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 3,
        "created_at": "2025-01-16T09:00:00",
        "closed_at": None
    },
    "SLOT003": {
        "slot_id": "SLOT003",
        "tutor_id": "b.tutor",
        "start_time": "11/11/2025 14:00",
        "end_time": "11/11/2025 16:00",
        "topic": "Data Science với Python",
        "max_participants": 6,
        "mode": "Offline",
        "location": "Phòng A201, Tòa nhà A2",
        "registered_participants": ["e.hoang", "c.tran", "d.pham"],
        "registration_times": {
            "e.hoang": "2025-01-14T11:20:00",
            "c.tran": "2025-01-14T11:25:00",
            "d.pham": "2025-01-14T11:30:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-14T11:00:00",
        "closed_at": None
    },
    "SLOT004": {
        "slot_id": "SLOT004",
        "tutor_id": "f.tutor",
        "start_time": "13/11/2025 19:00",
        "end_time": "13/11/2025 21:00",
        "topic": "Network Security",
        "max_participants": 10,
        "mode": "Online",
        "location": "www.meet.google.com/network-sec",
        "registered_participants": ["b.levan"],
        "registration_times": {
            "b.levan": "2025-01-17T08:10:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-17T08:00:00",
        "closed_at": None
    },
    "SLOT005": {
        "slot_id": "SLOT005",
        "tutor_id": "g.tutor",
        "start_time": "14/11/2025 14:00",
        "end_time": "14/11/2025 17:00",
        "topic": "Unity Game Development Workshop",
        "max_participants": 5,
        "mode": "Offline",
        "location": "Phòng Lab B301, Tòa nhà B3",
        "registered_participants": ["e.hoang"],
        "registration_times": {
            "e.hoang": "2025-01-18T10:05:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-18T10:00:00",
        "closed_at": None
    },
    "SLOT006": {
        "slot_id": "SLOT006",
        "tutor_id": "h.duong",
        "start_time": "15/11/2025 09:00",
        "end_time": "15/11/2025 11:00",
        "topic": "Smart Contracts Development",
        "max_participants": 8,
        "mode": "Online",
        "location": "www.meet.google.com/smart-contracts",
        "registered_participants": ["c.tran", "d.pham", "b.levan"],
        "registration_times": {
            "c.tran": "2025-01-19T09:10:00",
            "d.pham": "2025-01-19T09:12:00",
            "b.levan": "2025-01-19T09:15:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 3,
        "created_at": "2025-01-19T09:00:00",
        "closed_at": None
    },
    "SLOT007": {
        "slot_id": "SLOT007",
        "tutor_id": "i.vo",
        "start_time": "16/11/2025 14:00",
        "end_time": "16/11/2025 16:00",
        "topic": "Image Processing với OpenCV",
        "max_participants": 6,
        "mode": "Online",
        "location": "www.meet.google.com/opencv-tutorial",
        "registered_participants": ["e.hoang"],
        "registration_times": {
            "e.hoang": "2025-01-20T10:08:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-20T10:00:00",
        "closed_at": None
    },
    "SLOT008": {
        "slot_id": "SLOT008",
        "tutor_id": "a.nguyen",
        "start_time": "17/11/2025 19:00",
        "end_time": "17/11/2025 22:00",
        "topic": "Fullstack Development",
        "max_participants": 10,
        "mode": "Online",
        "location": "www.meet.google.com/fullstack",
        "registered_participants": [],
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-21T11:00:00",
        "closed_at": None
    },
    "SLOT009": {
        "slot_id": "SLOT009",
        "tutor_id": "b.tutor",
        "start_time": "18/11/2025 14:00",
        "end_time": "18/11/2025 16:00",
        "topic": "Deep Learning cơ bản",
        "max_participants": 8,
        "mode": "Offline",
        "location": "Phòng A301, Tòa nhà A3",
        "registered_participants": ["d.pham"],
        "registration_times": {
            "d.pham": "2025-01-22T09:12:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 2,
        "created_at": "2025-01-22T09:00:00",
        "closed_at": None
    },
    "SLOT010": {
        "slot_id": "SLOT010",
        "tutor_id": "f.tutor",
        "start_time": "19/11/2025 19:00",
        "end_time": "19/11/2025 21:00",
        "topic": "Ethical Hacking",
        "max_participants": 12,
        "mode": "Online",
        "location": "www.meet.google.com/ethical-hack",
        "registered_participants": ["c.tran", "e.hoang"],
        "registration_times": {
            "c.tran": "2025-01-23T08:10:00",
            "e.hoang": "2025-01-23T08:12:00"
        },
        "status": "Mở đăng ký",
        "min_participants": 3,
        "created_at": "2025-01-23T08:00:00",
        "closed_at": None
    }
}

