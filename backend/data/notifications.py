from datetime import datetime

# Fake database cho notifications
fake_notifications_db = {
    "12345": [
        {
            "notification_id": "notif_001",
            "user_id": "12345",
            "type": "profile_update",
            "title": "Cập nhật hồ sơ thành công",
            "message": "Hồ sơ cá nhân của bạn đã được cập nhật thành công.",
            "is_read": False,
            "created_at": "2024-01-15T10:30:00",
            "related_id": "12345",
            "action_url": "/mentee/id=12345"
        },
        {
            "notification_id": "notif_002",
            "user_id": "12345",
            "type": "tutor_registration",
            "title": "Đã nộp đơn đăng ký làm Tutor",
            "message": "Đơn đăng ký làm Tutor của bạn đã được gửi và đang chờ duyệt.",
            "is_read": False,
            "created_at": "2024-01-15T11:00:00",
            "related_id": "reg_001",
            "action_url": "/mentee/register-tutor"
        },
        {
            "notification_id": "notif_003",
            "user_id": "12345",
            "type": "slot_to_session",
            "title": "Lịch rảnh đã chuyển thành buổi tư vấn",
            "message": "Lịch rảnh của bạn với tutor a.nguyen đã chuyển thành buổi tư vấn.",
            "is_read": False,
            "created_at": "2024-01-15T12:00:00",
            "related_id": "session_001",
            "action_url": "/mentee/meeting"
        }
    ],
    "67890": [
        {
            "notification_id": "notif_004",
            "user_id": "67890",
            "type": "review_submitted",
            "title": "Đã đánh giá buổi tư vấn",
            "message": "Bạn đã đánh giá buổi tư vấn với tutor b.nguyen.",
            "is_read": False,
            "created_at": "2024-01-15T13:00:00",
            "related_id": "review_001",
            "action_url": "/mentee/review"
        }
    ]
}

