"""
Service cho Admin
"""
from typing import Optional, Dict, List
from data.admin_auth import get_admin_by_email, is_admin_verified
from data.tutor_registrations import fake_tutor_registrations_db, fake_registration_history_db
from data.users import fake_users_db
from data.profiles import fake_profiles_db
from data.tutor_profiles import fake_tutor_profiles_db
from data.tutors_auth import fake_tutors_auth_db
from data.fake_sessions import fake_sessions_db
from data.reviews import fake_reviews_db
from schemas.admin import TutorApprovalRequest, UserSearchCriteria
from datetime import datetime
import uuid

class AdminService:
    
    def verify_admin_login(self, email_or_username: str, password: str) -> Optional[Dict]:
        """Xác thực đăng nhập Admin - hỗ trợ cả username và email"""
        from data.admin_auth import get_admin_by_username
        
        # Nếu không có @, coi như username và tự động thêm @hcmut.edu.vn
        if "@" not in email_or_username:
            email = f"{email_or_username}@hcmut.edu.vn"
        else:
            email = email_or_username
            # Kiểm tra email có đúng format không
            if not (email.endswith("@hcmut.edu.vn") or email.endswith("@hcmut.vn")):
                raise ValueError("Admin phải đăng nhập bằng email trường (@hcmut.edu.vn hoặc @hcmut.vn)")
        
        # Tìm admin theo email
        admin_auth = get_admin_by_email(email)
        
        # Nếu không tìm thấy theo email, thử tìm theo username
        if not admin_auth:
            if "@" in email_or_username:
                email_username = email_or_username.split("@")[0].lower()
            else:
                email_username = email_or_username.lower()
            admin_auth = get_admin_by_username(email_username)
        
        if not admin_auth or not admin_auth.get("is_verified", False):
            raise ValueError("Bạn chưa được xác thực là Admin. Vui lòng liên hệ quản trị viên.")
        
        # Giả lập kiểm tra password (trong thực tế sẽ gọi HCMUT_SSO)
        # Ở đây giả lập bằng cách kiểm tra với users_db hoặc default password
        username = admin_auth.get("username")
        user = fake_users_db.get(username)
        if user and user.get("password") != password:
            # Kiểm tra với default password
            if password != "123456":
                raise ValueError("Sai mật khẩu")
        
        return admin_auth
    
    def get_pending_tutor_registrations(self, admin_khoa: str = None, admin_bo_mon: str = None) -> List[Dict]:
        """Lấy danh sách hồ sơ đăng ký Tutor đang chờ duyệt"""
        pending = []
        for reg in fake_tutor_registrations_db.values():
            if reg.get("status") in ["Chờ duyệt", "Yêu cầu bổ sung"]:
                # Lấy thông tin user
                user_id = reg.get("user_id")
                user_profile = fake_profiles_db.get(user_id)
                
                # Lọc theo khoa/bộ môn của admin
                if admin_khoa and user_profile:
                    if user_profile.get("khoa") != admin_khoa:
                        continue
                if admin_bo_mon and user_profile:
                    # Kiểm tra bộ môn (có thể từ tutor_profile)
                    tutor_profile = fake_tutor_profiles_db.get(user_id)
                    if tutor_profile and tutor_profile.get("bo_mon") != admin_bo_mon:
                        continue
                
                # Thêm thông tin user vào registration
                enriched_reg = {
                    **reg,
                    "user_name": user_profile.get("full_name") if user_profile else user_id,
                    "user_email": user_profile.get("email") if user_profile else f"{user_id}@hcmut.edu.vn",
                    "khoa": user_profile.get("khoa") if user_profile else "N/A"
                }
                pending.append(enriched_reg)
        
        # Sắp xếp theo thời gian submit (mới nhất trước)
        pending.sort(key=lambda x: x.get("submitted_at", ""), reverse=True)
        return pending
    
    def approve_tutor_registration(self, request: TutorApprovalRequest) -> Dict:
        """Phê duyệt/từ chối/yêu cầu bổ sung hồ sơ Tutor"""
        registration = fake_tutor_registrations_db.get(request.registration_id)
        if not registration:
            return {"success": False, "message": "Không tìm thấy hồ sơ đăng ký"}
        
        user_id = registration.get("user_id")
        
        if request.action == "approve":
            # Phê duyệt: Cấp quyền Tutor
            user = fake_users_db.get(user_id)
            if user:
                # Cập nhật role
                if user.get("role") == "Mentee":
                    user["role"] = ["Mentee", "Tutor"]
                elif isinstance(user.get("role"), list):
                    if "Tutor" not in user["role"]:
                        user["role"].append("Tutor")
                else:
                    user["role"] = ["Mentee", "Tutor"]
                
                # Lấy email từ profile hoặc tạo từ username
                user_profile = fake_profiles_db.get(user_id)
                email = None
                if user_profile and user_profile.get("email"):
                    email = user_profile.get("email")
                elif user.get("email"):
                    email = user.get("email")
                else:
                    # Tạo email từ username (giả lập)
                    email = f"{user_id}@hcmut.edu.vn"
                    user["email"] = email
                
                # Thêm vào tutors_auth_db để có thể đăng nhập với role Tutor
                if email and email not in fake_tutors_auth_db:
                    fake_tutors_auth_db[email.lower()] = {
                        "username": user_id,
                        "email": email.lower(),
                        "full_name": user.get("full_name") or user_profile.get("full_name") if user_profile else user_id,
                        "tutor_type": "Sinh viên năm trên",  # Mặc định cho sinh viên được phê duyệt
                        "is_verified": True,
                        "verified_by": "Admin",
                        "synced_from": "TSS",
                        "has_mentee_role": True  # Có cả vai trò Mentee
                    }
            
            # Cập nhật tutor_profile nếu có
            tutor_profile = fake_tutor_profiles_db.get(user_id)
            if tutor_profile:
                tutor_profile["approval_status"] = "approved"
                tutor_profile["approved_at"] = datetime.now().isoformat()
                tutor_profile["approved_by"] = request.admin_id
                tutor_profile["is_editable"] = True
            
            registration["status"] = "Đã phê duyệt"
            message = "Hồ sơ đã được phê duyệt. Tutor đã được cấp quyền. Bạn có thể đăng nhập với cả 2 vai trò Mentee và Tutor."
            
        elif request.action == "reject":
            if not request.reason:
                return {"success": False, "message": "Lý do từ chối là bắt buộc"}
            registration["status"] = "Từ chối"
            message = f"Hồ sơ đã bị từ chối. Lý do: {request.reason}"
            
        elif request.action == "request_more_info":
            if not request.reason:
                return {"success": False, "message": "Lý do yêu cầu bổ sung là bắt buộc"}
            registration["status"] = "Yêu cầu bổ sung"
            message = f"Hồ sơ cần bổ sung thông tin. Lý do: {request.reason}"
        else:
            return {"success": False, "message": "Hành động không hợp lệ"}
        
        registration["updated_at"] = datetime.now().isoformat()
        
        # Ghi lịch sử
        history_id = f"HIST{str(uuid.uuid4())[:8].upper()}"
        fake_registration_history_db[history_id] = {
            "history_id": history_id,
            "registration_id": request.registration_id,
            "action": request.action,
            "reviewed_by": request.admin_id,
            "reason": request.reason,
            "timestamp": datetime.now().isoformat()
        }
        
        return {"success": True, "message": message, "registration": registration}
    
    def search_users(self, criteria: UserSearchCriteria, admin_khoa: str = None, admin_bo_mon: str = None) -> List[Dict]:
        """Tìm kiếm và lọc danh sách users"""
        results = []
        
        for user_id, user in fake_users_db.items():
            profile = fake_profiles_db.get(user_id)
            tutor_profile = fake_tutor_profiles_db.get(user_id)
            
            # Lọc theo khoa/bộ môn của admin
            if admin_khoa and profile:
                if profile.get("khoa") != admin_khoa:
                    continue
            if admin_bo_mon and tutor_profile:
                if tutor_profile.get("bo_mon") != admin_bo_mon:
                    continue
            
            # Lọc theo role
            if criteria.role:
                user_role = user.get("role")
                if isinstance(user_role, list):
                    if criteria.role not in user_role:
                        continue
                elif user_role != criteria.role:
                    continue
            
            # Lọc theo keyword
            if criteria.keyword:
                keyword = criteria.keyword.lower()
                if keyword not in user.get("full_name", "").lower() and \
                   keyword not in user_id.lower() and \
                   keyword not in (profile.get("email", "") if profile else "").lower():
                    continue
            
            # Lọc theo khoa
            if criteria.khoa and profile:
                if criteria.khoa.lower() not in profile.get("khoa", "").lower():
                    continue
            
            # Lọc theo bộ môn
            if criteria.bo_mon and tutor_profile:
                if criteria.bo_mon.lower() not in (tutor_profile.get("bo_mon") or "").lower():
                    continue
            
            # Lọc theo status (cho tutor)
            if criteria.status and criteria.role == "Tutor":
                if tutor_profile:
                    if tutor_profile.get("approval_status") != criteria.status:
                        continue
                else:
                    continue
            
            # Thêm thông tin profile
            enriched_user = {
                "user_id": user_id,
                "username": user_id,
                "full_name": user.get("full_name"),
                "role": user.get("role"),
                "email": profile.get("email") if profile else f"{user_id}@hcmut.edu.vn",
                "khoa": profile.get("khoa") if profile else "N/A",
                "bo_mon": tutor_profile.get("bo_mon") if tutor_profile else None,
                "approval_status": tutor_profile.get("approval_status") if tutor_profile else None,
                "tutor_type": tutor_profile.get("tutor_type") if tutor_profile else None
            }
            results.append(enriched_user)
        
        return results
    
    def get_activity_report(self, admin_khoa: str = None, admin_bo_mon: str = None) -> Dict:
        """Lấy báo cáo hoạt động chương trình"""
        all_sessions = list(fake_sessions_db.values())
        
        # Lọc theo khoa/bộ môn
        filtered_sessions = []
        for session in all_sessions:
            tutor_id = session.get("tutor")
            tutor_profile = fake_tutor_profiles_db.get(tutor_id)
            
            if admin_khoa and tutor_profile:
                if tutor_profile.get("khoa") != admin_khoa:
                    continue
            if admin_bo_mon and tutor_profile:
                if tutor_profile.get("bo_mon") != admin_bo_mon:
                    continue
            
            filtered_sessions.append(session)
        
        # Tính toán thống kê
        total_sessions = len(filtered_sessions)
        completed = len([s for s in filtered_sessions if s.get("status") in ["Hoàn thành", "Đã kết thúc"]])
        cancelled = len([s for s in filtered_sessions if s.get("status") in ["Bị hủy", "Đã hủy"]])
        rescheduled = len([s for s in filtered_sessions if "Đổi lịch" in s.get("status", "")])
        
        # Tính số lượng participants
        total_participants = sum(len(s.get("participants", [])) for s in filtered_sessions)
        
        # Tính participation rate
        unique_participants = set()
        for session in filtered_sessions:
            unique_participants.update(session.get("participants", []))
        participation_rate = len(unique_participants) / len(fake_users_db) * 100 if fake_users_db else 0
        
        # Sessions by month (giả lập)
        sessions_by_month = [
            {"month": "01/2025", "count": total_sessions // 3},
            {"month": "02/2025", "count": total_sessions // 3},
            {"month": "03/2025", "count": total_sessions - (total_sessions // 3) * 2}
        ]
        
        # Sessions by tutor
        sessions_by_tutor = {}
        for session in filtered_sessions:
            tutor_id = session.get("tutor")
            if tutor_id:
                sessions_by_tutor[tutor_id] = sessions_by_tutor.get(tutor_id, 0) + 1
        
        sessions_by_tutor_list = [
            {"tutor_id": tid, "tutor_name": fake_tutor_profiles_db.get(tid, {}).get("full_name", tid), "count": count}
            for tid, count in sessions_by_tutor.items()
        ]
        sessions_by_tutor_list.sort(key=lambda x: x["count"], reverse=True)
        
        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed,
            "cancelled_sessions": cancelled,
            "rescheduled_sessions": rescheduled,
            "total_participants": total_participants,
            "participation_rate": round(participation_rate, 2),
            "sessions_by_month": sessions_by_month,
            "sessions_by_tutor": sessions_by_tutor_list[:10]  # Top 10
        }
    
    def get_quality_report(self, admin_khoa: str = None, admin_bo_mon: str = None) -> Dict:
        """Lấy báo cáo chất lượng buổi tư vấn"""
        all_reviews = list(fake_reviews_db.values())
        
        # Lọc theo khoa/bộ môn
        filtered_reviews = []
        for review in all_reviews:
            session_id = review.get("session_id")
            session = fake_sessions_db.get(session_id)
            if not session:
                continue
            
            tutor_id = session.get("tutor")
            tutor_profile = fake_tutor_profiles_db.get(tutor_id)
            
            if admin_khoa and tutor_profile:
                if tutor_profile.get("khoa") != admin_khoa:
                    continue
            if admin_bo_mon and tutor_profile:
                if tutor_profile.get("bo_mon") != admin_bo_mon:
                    continue
            
            filtered_reviews.append(review)
        
        # Tính toán thống kê
        total_reviews = len(filtered_reviews)
        if total_reviews == 0:
            return {
                "total_reviews": 0,
                "average_rating": 0,
                "rating_distribution": {},
                "reviews_by_tutor": [],
                "recent_reviews": [],
                "common_feedback": []
            }
        
        # Tính average rating
        ratings = [r.get("rating", 0) for r in filtered_reviews]
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Rating distribution
        rating_distribution = {}
        for rating in ratings:
            rating_str = str(int(rating))
            rating_distribution[rating_str] = rating_distribution.get(rating_str, 0) + 1
        
        # Reviews by tutor
        reviews_by_tutor = {}
        for review in filtered_reviews:
            session_id = review.get("session_id")
            session = fake_sessions_db.get(session_id)
            if session:
                tutor_id = session.get("tutor")
                if tutor_id:
                    if tutor_id not in reviews_by_tutor:
                        reviews_by_tutor[tutor_id] = {"count": 0, "total_rating": 0}
                    reviews_by_tutor[tutor_id]["count"] += 1
                    reviews_by_tutor[tutor_id]["total_rating"] += review.get("rating", 0)
        
        reviews_by_tutor_list = [
            {
                "tutor_id": tid,
                "tutor_name": fake_tutor_profiles_db.get(tid, {}).get("full_name", tid),
                "count": data["count"],
                "average_rating": round(data["total_rating"] / data["count"], 2)
            }
            for tid, data in reviews_by_tutor.items()
        ]
        reviews_by_tutor_list.sort(key=lambda x: x["average_rating"], reverse=True)
        
        # Recent reviews (tối đa 10)
        recent_reviews = sorted(filtered_reviews, key=lambda x: x.get("created_at", ""), reverse=True)[:10]
        recent_reviews_enriched = []
        for review in recent_reviews:
            session_id = review.get("session_id")
            session = fake_sessions_db.get(session_id)
            tutor_id = session.get("tutor") if session else None
            recent_reviews_enriched.append({
                **review,
                "tutor_name": fake_tutor_profiles_db.get(tutor_id, {}).get("full_name", tutor_id) if tutor_id else "N/A",
                "session_topic": session.get("topic") if session else "N/A"
            })
        
        # Common feedback (giả lập)
        common_feedback = [
            "Giảng viên nhiệt tình, giải thích rõ ràng",
            "Nội dung buổi học hữu ích",
            "Cần cải thiện thời gian",
            "Tài liệu đầy đủ"
        ]
        
        return {
            "total_reviews": total_reviews,
            "average_rating": round(average_rating, 2),
            "rating_distribution": rating_distribution,
            "reviews_by_tutor": reviews_by_tutor_list[:10],  # Top 10
            "recent_reviews": recent_reviews_enriched,
            "common_feedback": common_feedback
        }

