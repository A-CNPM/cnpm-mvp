from typing import List, Optional, Dict
from data.fake_tutors import fake_tutors_db
from data.profiles import fake_profiles_db
from schemas.searching import *
from data.fake_sessions import fake_sessions_db
from schemas.session import Session

class AIMatching:
    @staticmethod
    def handle_suggested_tutor(mentee_id: str, criteria: SearchCriteria) -> List[SuggestedTutor]:
        # Giả lập: trả về tutor có tags trùng với criteria, xếp hạng theo rating
        tutors = []
        for t in fake_tutors_db.values():
            score = t["rating"]
            if criteria.tags and not set(criteria.tags).intersection(set(t["tags"])):
                continue
            tutors.append(SuggestedTutor(tutorID=t["tutorID"], score=score))
        tutors.sort(key=lambda x: -x.score)
        return tutors

class SearchingService:
    def search_tutor(self, criteria: SearchCriteria) -> List[Tutor]:
        result = []
        
        # Kiểm tra xem có bất kỳ tiêu chí nào không
        has_any_criteria = any([
            criteria.keyword,
            criteria.khoa,
            criteria.chuyen_mon,
            criteria.mon_hoc,
            criteria.min_rating,
            criteria.available_time
        ])
        
        for tutor_id, t in fake_tutors_db.items():
            # Lấy profile của tutor để kiểm tra khoa, chuyên môn, lịch rảnh
            tutor_profile = fake_profiles_db.get(tutor_id)
            
            # Nếu không có tiêu chí nào, trả về tất cả tutors
            if not has_any_criteria:
                result.append(Tutor(**t))
                continue
            
            # 1. Lọc theo keyword (tên, tutorID, email, major, tags) - CHỈ áp dụng nếu có keyword
            if criteria.keyword:
                keyword = criteria.keyword.lower()
                tutor_name = t["full_name"].lower()
                tutor_id_lower = t.get("tutorID", "").lower()
                tutor_email = t.get("email", "").lower()
                tutor_major = t["major"].lower()
                tutor_tag = list(map(str.lower, t.get("tags", [])))
                # Tìm trong tên, tutorID, email, major, tags
                if not (keyword in tutor_name or 
                       keyword in tutor_id_lower or 
                       keyword in tutor_email or 
                       keyword in tutor_major or 
                       any(keyword in tag for tag in tutor_tag)):
                    continue
            
            # 2. Lọc theo khoa - CHỈ áp dụng nếu có tiêu chí khoa
            if criteria.khoa:
                if not tutor_profile:
                    continue  # Không có profile thì bỏ qua
                if criteria.khoa.lower() not in tutor_profile.get("khoa", "").lower():
                    continue
            
            # 3. Lọc theo chuyên môn - CHỈ áp dụng nếu có tiêu chí chuyên môn
            if criteria.chuyen_mon:
                if not tutor_profile:
                    continue  # Không có profile thì bỏ qua
                if criteria.chuyen_mon.lower() not in tutor_profile.get("chuyen_mon", "").lower():
                    continue
            
            # 4. Lọc theo môn học (tags) - tìm kiếm partial match - CHỈ áp dụng nếu có tiêu chí môn học
            if criteria.mon_hoc:
                mon_hoc = criteria.mon_hoc.lower()
                tutor_tags = [tag.lower() for tag in t.get("tags", [])]
                # Kiểm tra xem mon_hoc có trong bất kỳ tag nào không (partial match)
                if not any(mon_hoc in tag for tag in tutor_tags):
                    continue
            
            # 5. Lọc theo rating - CHỈ áp dụng nếu có tiêu chí rating
            if criteria.min_rating is not None:
                if t.get("rating", 0) < criteria.min_rating:
                    continue
            
            # 6. Lọc theo thời gian rảnh (kiểm tra lịch rảnh trong profile hoặc available slots) - CHỈ áp dụng nếu có tiêu chí thời gian
            if criteria.available_time:
                available = False
                # Kiểm tra trong profile lich_ranh
                if tutor_profile:
                    lich_ranh = tutor_profile.get("lich_ranh", [])
                    for schedule in lich_ranh:
                        if criteria.available_time.lower() in schedule.get("time", "").lower():
                            available = True
                            break
                # Nếu không tìm thấy trong profile, kiểm tra available slots (từ available_slots service)
                # Note: Để đơn giản, nếu không có trong profile thì bỏ qua filter này
                # Có thể mở rộng sau để kiểm tra available slots thực tế
                if not available:
                    continue
            
            # Nếu vượt qua tất cả các bộ lọc, thêm vào kết quả
            result.append(Tutor(**t))
        return result
    
    def search_session(self, criteria: SessionSearchCriteria) -> List[Session]:
        results = []
        for s in fake_sessions_db.values():
            # 1. Lọc theo Keyword (Topic hoặc Content)
            if criteria.keyword:
                keyword = criteria.keyword.lower()
                topic = s.get("topic", "").lower()
                content = s.get("content", "").lower()
                tutor_id = s.get("tutor")
                tutor_info = fake_tutors_db.get(tutor_id)
                invalid_tutor = not tutor_info or criteria.keyword.lower() not in tutor_info["full_name"].lower()
                if keyword not in topic and keyword not in content and invalid_tutor and invalid_tutor:
                    continue
            
            # 2. Lọc theo Mode (Online/Offline)
            if criteria.mode and s.get("mode") != criteria.mode:
                continue

            # 3. Lọc theo Status
            if criteria.status and s.get("status") != criteria.status:
                continue

            if criteria.tutor_name:
                # Lấy ID tutor của buổi session này
                session_tutor_id = s.get("tutor") 
                
                # Tra cứu thông tin Tutor trong DB Tutor
                tutor_info = fake_tutors_db.get(session_tutor_id)
                
                # Nếu không tìm thấy tutor hoặc tên không khớp -> Bỏ qua
                if not tutor_info:
                    continue
                
                # So sánh tên (chuyển về chữ thường để so sánh chính xác)
                if criteria.tutor_name.lower() not in tutor_info["full_name"].lower():
                    continue
                
            results.append(Session(**s))
            
        return results

    def get_tutor_detail(self, tutor_id: str) -> Optional[Tutor]:
        t = fake_tutors_db.get(tutor_id)
        if t:
            return Tutor(**t)
        return None

    def select_tutor(self, tutor_id: str, mentee_id: str, data: Dict) -> bool:
        # Giả lập: chỉ trả về True nếu tutor tồn tại
        return tutor_id in fake_tutors_db

    def get_suggested_tutors(self, mentee_id: str, criteria: SearchCriteria) -> List[SuggestedTutor]:
        return AIMatching.handle_suggested_tutor(mentee_id, criteria)
