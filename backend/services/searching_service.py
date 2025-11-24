from typing import List, Optional, Dict
from data.fake_tutors import fake_tutors_db
from schemas.searching import SearchCriteria, Tutor, SuggestedTutor

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
            if criteria.keyword and criteria.keyword.lower() not in t["full_name"].lower():
                continue
            if criteria.tags and not set(criteria.tags).intersection(set(t["tags"])):
                continue
            if criteria.min_rating and t["rating"] < criteria.min_rating:
                continue
            if criteria.major and criteria.major != t["major"]:
                continue
            result.append(Tutor(**t))
        return result

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
