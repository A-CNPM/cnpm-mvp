from fastapi import APIRouter, HTTPException, status
from controllers.searching_controller import SearchingController
from schemas.searching import SearchCriteria, Tutor, SuggestedTutor
from typing import List, Dict

router = APIRouter(prefix="/searching", tags=["searching"])
searching_controller = SearchingController()

@router.post("/tutor", response_model=List[Tutor])
def search_tutor(criteria: SearchCriteria):
    return searching_controller.search_tutor(criteria)

@router.get("/tutor/{tutor_id}", response_model=Tutor)
def get_tutor_detail(tutor_id: str):
    tutor = searching_controller.get_tutor_detail(tutor_id)
    if not tutor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found")
    return tutor

@router.post("/select-tutor")
def select_tutor(tutor_id: str, mentee_id: str, data: Dict):
    success = searching_controller.select_tutor(tutor_id, mentee_id, data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tutor not found or invalid")
    return {"detail": "Select successful"}

@router.post("/suggested-tutor", response_model=List[SuggestedTutor])
def get_suggested_tutors(mentee_id: str, criteria: SearchCriteria):
    return searching_controller.get_suggested_tutors(mentee_id, criteria)
