from typing import Optional, Dict, List
from data.reviews import fake_reviews_db
from data.fake_sessions import fake_sessions_db
from data.fake_tutors import fake_tutors_db
from data.profiles import fake_profiles_db
from schemas.review import ReviewRequest, Review
import uuid
from datetime import datetime

class ReviewService:
    
    def submit_review(self, data: ReviewRequest) -> Dict:
        """Gửi đánh giá cho buổi tư vấn"""
        # Kiểm tra session có tồn tại không
        session = fake_sessions_db.get(data.session_id)
        if not session:
            return {"success": False, "message": "Session not found"}
        
        # Kiểm tra user có tham gia session không
        if data.user_id not in session.get("participants", []):
            return {"success": False, "message": "Bạn chưa tham gia buổi tư vấn này"}
        
        # Kiểm tra session đã kết thúc chưa (chỉ cho phép đánh giá sau khi kết thúc)
        session_status = session.get("status", "")
        if session_status not in ["Hoàn thành", "Đã kết thúc"]:
            return {"success": False, "message": "Chỉ có thể đánh giá sau khi buổi tư vấn kết thúc"}
        
        # Kiểm tra đã đánh giá chưa
        for review in fake_reviews_db.values():
            if review["session_id"] == data.session_id and review["user_id"] == data.user_id:
                return {"success": False, "message": "Bạn đã đánh giá buổi tư vấn này rồi"}
        
        # Kiểm tra rating hợp lệ
        if data.rating < 1 or data.rating > 5:
            return {"success": False, "message": "Rating phải từ 1 đến 5"}
        
        # Lấy tutor_id từ session
        tutor_id = session.get("tutor")
        
        # Tạo review_id mới
        review_id = f"REV{str(uuid.uuid4())[:8].upper()}"
        
        # Tạo đánh giá
        review = {
            "review_id": review_id,
            "session_id": data.session_id,
            "user_id": data.user_id,
            "tutor_id": tutor_id,
            "rating": data.rating,
            "comment": data.comment,
            "created_at": datetime.now().isoformat()
        }
        
        fake_reviews_db[review_id] = review
        
        # Gửi thông báo
        self._send_review_notification(data.user_id, tutor_id, data.session_id)
        
        return {
            "success": True,
            "message": "Đánh giá đã được gửi thành công",
            "review": review
        }
    
    def _send_review_notification(self, user_id: str, tutor_id: str, session_id: str):
        """Gửi thông báo khi đánh giá buổi tư vấn"""
        from services.notification_service import NotificationService
        from schemas.notification import CreateNotification
        notification_service = NotificationService()
        
        tutor_profile = fake_profiles_db.get(tutor_id)
        tutor_name = tutor_profile.get("full_name") if tutor_profile else tutor_id
        
        notification_data = CreateNotification(
            user_id=user_id,
            type="review_submitted",
            title="Đã đánh giá buổi tư vấn",
            message=f"Bạn đã đánh giá buổi tư vấn với tutor {tutor_name}.",
            related_id=session_id,
            action_url="/mentee/review"
        )
        notification_service.create_notification(notification_data)
    
    def get_session_reviews(self, session_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một session"""
        reviews = []
        for review in fake_reviews_db.values():
            if review["session_id"] == session_id:
                # Thêm thông tin user
                user_profile = fake_profiles_db.get(review["user_id"])
                review_with_user = {
                    **review,
                    "user_name": user_profile.get("full_name") if user_profile else review["user_id"]
                }
                reviews.append(review_with_user)
        # Sắp xếp theo thời gian (mới nhất trước)
        reviews.sort(key=lambda x: x["created_at"], reverse=True)
        return reviews
    
    def get_user_reviews(self, user_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một user"""
        reviews = []
        for review in fake_reviews_db.values():
            if review["user_id"] == user_id:
                # Thêm thông tin session và tutor
                session = fake_sessions_db.get(review["session_id"])
                tutor_profile = fake_profiles_db.get(review["tutor_id"])
                tutor_info = fake_tutors_db.get(review["tutor_id"])
                
                review_with_details = {
                    **review,
                    "session_topic": session.get("topic") if session else "N/A",
                    "session_time": f"{session.get('startTime', '')} - {session.get('endTime', '')}" if session else "N/A",
                    "tutor_name": tutor_profile.get("full_name") if tutor_profile else (tutor_info.get("full_name") if tutor_info else review["tutor_id"])
                }
                reviews.append(review_with_details)
        # Sắp xếp theo thời gian (mới nhất trước)
        reviews.sort(key=lambda x: x["created_at"], reverse=True)
        return reviews
    
    def get_tutor_reviews(self, tutor_id: str) -> List[Dict]:
        """Lấy tất cả đánh giá của một tutor"""
        reviews = []
        for review in fake_reviews_db.values():
            if review["tutor_id"] == tutor_id:
                # Thêm thông tin session và user
                session = fake_sessions_db.get(review["session_id"])
                user_profile = fake_profiles_db.get(review["user_id"])
                
                review_with_details = {
                    **review,
                    "session_topic": session.get("topic") if session else "N/A",
                    "session_time": f"{session.get('startTime', '')} - {session.get('endTime', '')}" if session else "N/A",
                    "user_name": user_profile.get("full_name") if user_profile else review["user_id"]
                }
                reviews.append(review_with_details)
        # Sắp xếp theo thời gian (mới nhất trước)
        reviews.sort(key=lambda x: x["created_at"], reverse=True)
        return reviews
    
    def get_user_completed_sessions(self, user_id: str) -> List[Dict]:
        """Lấy danh sách các session đã hoàn thành mà user đã tham gia (chưa đánh giá)"""
        completed_sessions = []
        
        for session in fake_sessions_db.values():
            # Kiểm tra user có tham gia không
            if user_id not in session.get("participants", []):
                continue
            
            # Chỉ lấy session đã hoàn thành
            if session.get("status") not in ["Hoàn thành", "Đã kết thúc"]:
                continue
            
            # Kiểm tra đã đánh giá chưa
            already_reviewed = False
            for review in fake_reviews_db.values():
                if review["session_id"] == session.get("sessionID") and review["user_id"] == user_id:
                    already_reviewed = True
                    break
            
            if not already_reviewed:
                # Thêm thông tin tutor
                tutor_id = session.get("tutor")
                tutor_profile = fake_profiles_db.get(tutor_id)
                tutor_info = fake_tutors_db.get(tutor_id)
                
                session_with_tutor = {
                    "sessionID": session.get("sessionID"),
                    "topic": session.get("topic"),
                    "startTime": session.get("startTime"),
                    "endTime": session.get("endTime"),
                    "tutor_id": tutor_id,
                    "tutor_name": tutor_profile.get("full_name") if tutor_profile else (tutor_info.get("full_name") if tutor_info else tutor_id),
                    "mode": session.get("mode"),
                    "status": session.get("status")
                }
                completed_sessions.append(session_with_tutor)
        
        # Sắp xếp theo thời gian (mới nhất trước)
        completed_sessions.sort(key=lambda x: x.get("startTime", ""), reverse=True)
        return completed_sessions
    
    def get_tutor_average_rating(self, tutor_id: str) -> float:
        """Tính điểm đánh giá trung bình của tutor"""
        reviews = self.get_tutor_reviews(tutor_id)
        if not reviews:
            return 0.0
        total_rating = sum(review["rating"] for review in reviews)
        return round(total_rating / len(reviews), 2)

