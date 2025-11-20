
from fastapi import APIRouter, HTTPException, status
from controllers.profile_controller import ProfileController
from schemas.profile import Profile
from typing import Dict

router = APIRouter(prefix="/profile", tags=["profile"])
profile_controller = ProfileController()

@router.get("/{user_id}", response_model=Profile)
def get_profile(user_id: str):
    profile = profile_controller.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile

@router.put("/{user_id}")
def update_profile(user_id: str, updated_data: Dict):
    # Validate đầu vào nếu cần
    success = profile_controller.update_profile(user_id, updated_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Update failed")
    # Trả về profile mới cho FE
    return profile_controller.get_profile(user_id)

@router.post("/sync/{user_id}")
def sync_profile(user_id: str):
    success = profile_controller.sync_from_datacore(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sync failed")
    return profile_controller.get_profile(user_id)
