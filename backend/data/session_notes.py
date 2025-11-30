"""
Database giả lập cho ghi chú/biên bản buổi tư vấn
"""
from typing import Dict

# Database giả lập: Ghi chú/biên bản buổi tư vấn
# Key: note_id
# Value: thông tin ghi chú
fake_session_notes_db: Dict[str, Dict] = {
    "NOTE001": {
        "note_id": "NOTE001",
        "session_id": "S001",
        "content": "Buổi tư vấn diễn ra tốt. Sinh viên đã hiểu các kỹ thuật học tập hiệu quả. Cần theo dõi tiến độ trong tuần tới.",
        "created_by": "a.nguyen",
        "created_at": "2025-01-10T16:30:00",
        "updated_at": "2025-01-10T16:30:00",
        "is_draft": False
    },
    "NOTE002": {
        "note_id": "NOTE002",
        "session_id": "S002",
        "content": "Sinh viên cần luyện tập thêm về vòng lặp và hàm trong Python.",
        "created_by": "b.tutor",
        "created_at": "2025-01-11T11:15:00",
        "updated_at": None,
        "is_draft": False
    }
}

def get_session_note(note_id: str) -> Dict:
    """Lấy ghi chú theo ID"""
    return fake_session_notes_db.get(note_id)

def get_session_notes(session_id: str) -> list:
    """Lấy tất cả ghi chú của một session"""
    return [note for note in fake_session_notes_db.values() if note.get("session_id") == session_id]

def create_session_note(note_data: Dict) -> Dict:
    """Tạo ghi chú mới"""
    fake_session_notes_db[note_data["note_id"]] = note_data
    return note_data

def update_session_note(note_id: str, note_data: Dict) -> Dict:
    """Cập nhật ghi chú"""
    if note_id in fake_session_notes_db:
        fake_session_notes_db[note_id].update(note_data)
        return fake_session_notes_db[note_id]
    return None

def delete_session_note(note_id: str) -> bool:
    """Xóa ghi chú"""
    if note_id in fake_session_notes_db:
        del fake_session_notes_db[note_id]
        return True
    return False

