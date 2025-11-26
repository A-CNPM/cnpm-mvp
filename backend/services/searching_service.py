from typing import List, Optional, Dict
from data.fake_tutors import fake_tutors_db
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
        for t in fake_tutors_db.values():
            tutor_name = t["full_name"].lower()
            tutor_major = t["major"].lower()
            tutor_tag = list(map(str.lower, t["tags"]))
            if criteria.keyword and not (criteria.keyword.lower() in tutor_name or
                                     criteria.keyword.lower() in tutor_major or
                                     criteria.keyword.lower() in tutor_tag):
                continue
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
