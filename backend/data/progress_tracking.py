"""
Database giả lập cho Progress Tracking (Theo dõi tiến bộ học tập)
"""
from typing import Dict, List, Optional
import uuid
from datetime import datetime

# Database giả lập: Progress Tracking
fake_progress_tracking_db: Dict[str, Dict] = {}

def get_progress_tracking(tracking_id: str) -> Optional[Dict]:
    """Lấy thông tin theo dõi tiến bộ theo ID"""
    return fake_progress_tracking_db.get(tracking_id)

def get_mentee_progress_trackings(mentee_id: str) -> List[Dict]:
    """Lấy tất cả ghi nhận tiến bộ của một mentee"""
    trackings = []
    for tracking in fake_progress_tracking_db.values():
        if tracking.get("mentee_id") == mentee_id:
            trackings.append(tracking)
    # Sắp xếp theo thời gian (mới nhất trước)
    trackings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return trackings

def get_session_progress_trackings(session_id: str) -> List[Dict]:
    """Lấy tất cả ghi nhận tiến bộ của một session"""
    trackings = []
    for tracking in fake_progress_tracking_db.values():
        if tracking.get("session_id") == session_id:
            trackings.append(tracking)
    # Sắp xếp theo thời gian (mới nhất trước)
    trackings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return trackings

def get_tutor_progress_trackings(tutor_id: str) -> List[Dict]:
    """Lấy tất cả ghi nhận tiến bộ của một tutor"""
    trackings = []
    for tracking in fake_progress_tracking_db.values():
        if tracking.get("tutor_id") == tutor_id:
            trackings.append(tracking)
    # Sắp xếp theo thời gian (mới nhất trước)
    trackings.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return trackings

def create_progress_tracking(tracking_data: Dict) -> Dict:
    """Tạo ghi nhận tiến bộ mới"""
    tracking_id = f"PT{str(uuid.uuid4())[:8].upper()}"
    tracking_data["tracking_id"] = tracking_id
    tracking_data["created_at"] = datetime.now().isoformat()
    tracking_data["updated_at"] = None
    fake_progress_tracking_db[tracking_id] = tracking_data
    return tracking_data

def update_progress_tracking(tracking_id: str, update_data: Dict) -> Optional[Dict]:
    """Cập nhật ghi nhận tiến bộ"""
    tracking = fake_progress_tracking_db.get(tracking_id)
    if not tracking:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            tracking[key] = value
    
    tracking["updated_at"] = datetime.now().isoformat()
    return tracking

def delete_progress_tracking(tracking_id: str) -> bool:
    """Xóa ghi nhận tiến bộ"""
    if tracking_id in fake_progress_tracking_db:
        del fake_progress_tracking_db[tracking_id]
        return True
    return False

