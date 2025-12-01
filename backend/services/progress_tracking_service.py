from typing import Optional, Dict, List
from data.progress_tracking import (
    fake_progress_tracking_db,
    get_progress_tracking,
    get_mentee_progress_trackings,
    get_session_progress_trackings,
    get_tutor_progress_trackings,
    create_progress_tracking,
    update_progress_tracking,
    delete_progress_tracking
)
from data.fake_sessions import fake_sessions_db
from data.profiles import fake_profiles_db
from data.reviews import fake_reviews_db
from schemas.progress_tracking import (
    CreateProgressTrackingRequest,
    UpdateProgressTrackingRequest
)
import uuid
from datetime import datetime

class ProgressTrackingService:
    
    def create_progress_tracking(self, data: CreateProgressTrackingRequest, tutor_id: str) -> Dict:
        """Tạo ghi nhận tiến bộ/hạn chế học tập"""
        # Kiểm tra session có tồn tại không
        session = fake_sessions_db.get(data.session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        # Kiểm tra tutor có phải là tutor của session không
        if session.get("tutor") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền ghi nhận tiến bộ cho session này"}
        
        # Kiểm tra mentee có tham gia session không
        if data.mentee_id not in session.get("participants", []):
            return {"success": False, "message": "Sinh viên này không tham gia buổi tư vấn này"}
        
        # Kiểm tra progress_type hợp lệ
        if data.progress_type not in ["progress", "limitation"]:
            return {"success": False, "message": "Loại theo dõi không hợp lệ. Phải là 'progress' hoặc 'limitation'"}
        
        # Tạo tracking
        tracking_data = {
            "session_id": data.session_id,
            "mentee_id": data.mentee_id,
            "tutor_id": tutor_id,
            "progress_type": data.progress_type,
            "content": data.content
        }
        
        created_tracking = create_progress_tracking(tracking_data)
        
        return {
            "success": True,
            "message": "Đã ghi nhận tiến bộ thành công" if data.progress_type == "progress" else "Đã ghi nhận hạn chế thành công",
            "tracking": created_tracking
        }
    
    def update_progress_tracking(self, tracking_id: str, data: UpdateProgressTrackingRequest, tutor_id: str) -> Dict:
        """Cập nhật ghi nhận tiến bộ"""
        tracking = get_progress_tracking(tracking_id)
        if not tracking:
            return {"success": False, "message": "Ghi nhận tiến bộ không tồn tại"}
        
        # Kiểm tra quyền: chỉ tutor đã tạo mới có thể cập nhật
        if tracking.get("tutor_id") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền chỉnh sửa ghi nhận này"}
        
        # Kiểm tra progress_type nếu có
        if data.progress_type and data.progress_type not in ["progress", "limitation"]:
            return {"success": False, "message": "Loại theo dõi không hợp lệ"}
        
        update_data = {}
        if data.progress_type is not None:
            update_data["progress_type"] = data.progress_type
        if data.content is not None:
            update_data["content"] = data.content
        
        updated_tracking = update_progress_tracking(tracking_id, update_data)
        
        if updated_tracking:
            return {
                "success": True,
                "message": "Đã cập nhật ghi nhận tiến bộ thành công",
                "tracking": updated_tracking
            }
        return {"success": False, "message": "Cập nhật thất bại"}
    
    def delete_progress_tracking(self, tracking_id: str, tutor_id: str) -> Dict:
        """Xóa ghi nhận tiến bộ"""
        tracking = get_progress_tracking(tracking_id)
        if not tracking:
            return {"success": False, "message": "Ghi nhận tiến bộ không tồn tại"}
        
        # Kiểm tra quyền
        if tracking.get("tutor_id") != tutor_id:
            return {"success": False, "message": "Bạn không có quyền xóa ghi nhận này"}
        
        if delete_progress_tracking(tracking_id):
            return {"success": True, "message": "Đã xóa ghi nhận tiến bộ thành công"}
        return {"success": False, "message": "Xóa thất bại"}
    
    def get_mentee_progress_trackings(self, mentee_id: str, tutor_id: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một mentee"""
        trackings = get_mentee_progress_trackings(mentee_id)
        
        # Nếu có tutor_id, chỉ lấy các ghi nhận của tutor đó
        if tutor_id:
            trackings = [t for t in trackings if t.get("tutor_id") == tutor_id]
        
        # Thêm thông tin session và tutor
        enriched_trackings = []
        for tracking in trackings:
            session = fake_sessions_db.get(tracking.get("session_id"))
            tutor_profile = fake_profiles_db.get(tracking.get("tutor_id"))
            
            enriched_tracking = {
                **tracking,
                "session_topic": session.get("topic") if session else "N/A",
                "session_time": f"{session.get('startTime', '')} - {session.get('endTime', '')}" if session else "N/A",
                "tutor_name": tutor_profile.get("full_name") if tutor_profile else tracking.get("tutor_id")
            }
            enriched_trackings.append(enriched_tracking)
        
        return enriched_trackings
    
    def get_session_progress_trackings(self, session_id: str, tutor_id: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một session"""
        trackings = get_session_progress_trackings(session_id)
        
        # Nếu có tutor_id, chỉ lấy các ghi nhận của tutor đó
        if tutor_id:
            trackings = [t for t in trackings if t.get("tutor_id") == tutor_id]
        
        # Thêm thông tin mentee và tutor
        enriched_trackings = []
        for tracking in trackings:
            mentee_profile = fake_profiles_db.get(tracking.get("mentee_id"))
            tutor_profile = fake_profiles_db.get(tracking.get("tutor_id"))
            session = fake_sessions_db.get(session_id)
            
            enriched_tracking = {
                **tracking,
                "mentee_name": mentee_profile.get("full_name") if mentee_profile else tracking.get("mentee_id"),
                "tutor_name": tutor_profile.get("full_name") if tutor_profile else tracking.get("tutor_id"),
                "session_topic": session.get("topic") if session else "N/A"
            }
            enriched_trackings.append(enriched_tracking)
        
        return enriched_trackings
    
    def get_tutor_progress_trackings(self, tutor_id: str) -> List[Dict]:
        """Lấy tất cả ghi nhận tiến bộ của một tutor"""
        trackings = get_tutor_progress_trackings(tutor_id)
        
        # Thêm thông tin session và mentee
        enriched_trackings = []
        for tracking in trackings:
            session = fake_sessions_db.get(tracking.get("session_id"))
            mentee_profile = fake_profiles_db.get(tracking.get("mentee_id"))
            
            enriched_tracking = {
                **tracking,
                "session_topic": session.get("topic") if session else "N/A",
                "session_time": f"{session.get('startTime', '')} - {session.get('endTime', '')}" if session else "N/A",
                "mentee_name": mentee_profile.get("full_name") if mentee_profile else tracking.get("mentee_id")
            }
            enriched_trackings.append(enriched_tracking)
        
        return enriched_trackings
    
    def get_mentee_progress_summary(self, mentee_id: str, tutor_id: Optional[str] = None) -> Dict:
        """Lấy tổng hợp tiến bộ của một mentee"""
        trackings = self.get_mentee_progress_trackings(mentee_id, tutor_id)
        
        mentee_profile = fake_profiles_db.get(mentee_id)
        mentee_name = mentee_profile.get("full_name") if mentee_profile else mentee_id
        
        # Đếm số lượng sessions mà mentee đã tham gia với tutor này
        sessions_with_tutor = set()
        for tracking in trackings:
            sessions_with_tutor.add(tracking.get("session_id"))
        
        # Đếm số lượng ghi nhận
        progress_count = sum(1 for t in trackings if t.get("progress_type") == "progress")
        limitation_count = sum(1 for t in trackings if t.get("progress_type") == "limitation")
        
        # Tính điểm đánh giá trung bình từ mentee (nếu có)
        mentee_reviews = []
        for review in fake_reviews_db.values():
            if review.get("user_id") == mentee_id:
                if not tutor_id or review.get("tutor_id") == tutor_id:
                    mentee_reviews.append(review)
        
        average_rating = None
        if mentee_reviews:
            total_rating = sum(r.get("rating", 0) for r in mentee_reviews)
            average_rating = round(total_rating / len(mentee_reviews), 2)
        
        return {
            "mentee_id": mentee_id,
            "mentee_name": mentee_name,
            "total_sessions": len(sessions_with_tutor),
            "total_progress_records": progress_count,
            "total_limitation_records": limitation_count,
            "recent_trackings": trackings[:10],  # 10 ghi nhận gần đây nhất
            "average_rating": average_rating
        }
    
    def get_tutor_sessions_with_feedback(self, tutor_id: str) -> List[Dict]:
        """Lấy danh sách sessions của tutor kèm phản hồi từ mentee"""
        sessions = []
        
        # Lấy tất cả sessions của tutor
        for session in fake_sessions_db.values():
            if session.get("tutor") == tutor_id:
                # Lấy phản hồi từ mentee cho session này
                session_reviews = []
                for review in fake_reviews_db.values():
                    if review.get("session_id") == session.get("sessionID"):
                        user_profile = fake_profiles_db.get(review.get("user_id"))
                        review_with_user = {
                            **review,
                            "user_name": user_profile.get("full_name") if user_profile else review.get("user_id")
                        }
                        session_reviews.append(review_with_user)
                
                # Lấy ghi nhận tiến bộ cho session này
                session_trackings = get_session_progress_trackings(session.get("sessionID"))
                
                session_with_feedback = {
                    "sessionID": session.get("sessionID"),
                    "topic": session.get("topic"),
                    "startTime": session.get("startTime"),
                    "endTime": session.get("endTime"),
                    "mode": session.get("mode"),
                    "status": session.get("status"),
                    "participants": session.get("participants", []),
                    "reviews": session_reviews,
                    "progress_trackings": session_trackings
                }
                sessions.append(session_with_feedback)
        
        # Sắp xếp theo thời gian (mới nhất trước)
        sessions.sort(key=lambda x: x.get("startTime", ""), reverse=True)
        return sessions

