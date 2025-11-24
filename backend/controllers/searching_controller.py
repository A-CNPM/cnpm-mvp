from typing import List, Optional, Dict
from services.searching_service import SearchingService
from schemas.searching import SearchCriteria, Tutor, SuggestedTutor

class SearchingController:
    def __init__(self):
        self.service = SearchingService()

    def search_tutor(self, criteria: SearchCriteria) -> List[Tutor]:
        return self.service.search_tutor(criteria)

    def get_tutor_detail(self, tutor_id: str) -> Optional[Tutor]:
        return self.service.get_tutor_detail(tutor_id)

    def select_tutor(self, tutor_id: str, mentee_id: str, data: Dict) -> bool:
        return self.service.select_tutor(tutor_id, mentee_id, data)

    def get_suggested_tutors(self, mentee_id: str, criteria: SearchCriteria) -> List[SuggestedTutor]:
        return self.service.get_suggested_tutors(mentee_id, criteria)
