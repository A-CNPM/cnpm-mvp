from fastapi import APIRouter, HTTPException, status
from controllers.profile_controller import ProfileController
from schemas.profile import Profile, UpdateProfileRequest
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
def update_profile(user_id: str, update_data: UpdateProfileRequest):
    """
    Cập nhật profile - chỉ cho phép cập nhật các trường bổ sung
    Không được cập nhật thông tin từ HCMUT_DATACORE
    """
    try:
        # Lấy user_id từ token hoặc request (mock: dùng user_id từ path)
        changed_by = user_id
        updated_profile = profile_controller.update_profile(user_id, update_data, changed_by)
        return updated_profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{user_id}/history")
def get_profile_history(user_id: str):
    """Lấy lịch sử thay đổi của profile"""
    history = profile_controller.get_profile_history(user_id)
    return {"history": history}

@router.post("/sync/{user_id}")
def sync_profile(user_id: str):
    """Đồng bộ thông tin từ HCMUT_DATACORE"""
    success = profile_controller.sync_from_datacore(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sync failed")
    return profile_controller.get_profile(user_id)
