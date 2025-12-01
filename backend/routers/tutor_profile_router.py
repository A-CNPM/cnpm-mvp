"""
Router cho Tutor Professional Profile API
"""
from fastapi import APIRouter, HTTPException, status
from schemas.tutor_profile import TutorProfessionalProfile, UpdateTutorProfileRequest, TutorProfileResponse
from controllers.tutor_profile_controller import TutorProfileController

tutor_profile_controller = TutorProfileController()
router = APIRouter(prefix="/tutor/profile", tags=["tutor-profile"])


@router.get("/{tutor_id}", response_model=TutorProfileResponse)
def get_tutor_profile(tutor_id: str):
    """Lấy thông tin hồ sơ chuyên môn của Tutor"""
    try:
        profile = tutor_profile_controller.get_profile(tutor_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy hồ sơ Tutor"
            )
        return {
            "success": True,
            "message": "Lấy thông tin hồ sơ thành công",
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{tutor_id}")
def update_tutor_profile(tutor_id: str, update_data: UpdateTutorProfileRequest):
    """
    Cập nhật hồ sơ chuyên môn - chỉ cho phép cập nhật các trường bổ sung
    Không được cập nhật thông tin từ HCMUT_DATACORE
    """
    try:
        # Lấy tutor_id từ token hoặc request (mock: dùng tutor_id từ path)
        changed_by = tutor_id
        updated_profile = tutor_profile_controller.update_profile(tutor_id, update_data, changed_by)
        return {
            "success": True,
            "message": "Cập nhật hồ sơ thành công",
            "profile": updated_profile
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{tutor_id}/history")
def get_tutor_profile_history(tutor_id: str):
    """Lấy lịch sử thay đổi của hồ sơ"""
    try:
        history = tutor_profile_controller.get_profile_history(tutor_id)
        return {
            "success": True,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{tutor_id}/sync")
def sync_tutor_profile_from_datacore(tutor_id: str):
    """Đồng bộ thông tin từ HCMUT_DATACORE"""
    try:
        profile = tutor_profile_controller.sync_from_datacore(tutor_id)
        return {
            "success": True,
            "message": "Đồng bộ thông tin từ HCMUT_DATACORE thành công",
            "profile": profile
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{tutor_id}/approve")
def approve_tutor_profile(tutor_id: str, approved_by: str = "admin"):
    """Phê duyệt hồ sơ Tutor (chỉ cho sinh viên)"""
    try:
        profile = tutor_profile_controller.approve_profile(tutor_id, approved_by)
        return {
            "success": True,
            "message": "Phê duyệt hồ sơ thành công",
            "profile": profile
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

