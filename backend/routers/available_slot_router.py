from fastapi import APIRouter, HTTPException, status, Query
from controllers.available_slot_controller import AvailableSlotController
from schemas.available_slot import (
    CreateAvailableSlot,
    RegisterSlotRequest,
    ChangeSlotRequest,
    CloseSlotRequest,
    UpdateAvailableSlot,
    ConfirmSlotRequest,
    CancelSlotRequest,
    ProposeRescheduleRequest,
    ChangeResponseRequest
)
from typing import List, Optional

router = APIRouter(prefix="/available-slot", tags=["available-slot"])
controller = AvailableSlotController()

@router.post("/create")
def create_slot(data: CreateAvailableSlot):
    """Tutor tạo lịch rảnh mới"""
    result = controller.create_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/tutor/{tutor_id}")
def get_tutor_slots(tutor_id: str, status: Optional[str] = Query(None, description="Lọc theo trạng thái")):
    """Lấy tất cả lịch rảnh của tutor"""
    return controller.get_tutor_slots(tutor_id, status)

@router.post("/register")
def register_slot(data: RegisterSlotRequest):
    """Sinh viên đăng ký lịch rảnh"""
    result = controller.register_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/{slot_id}/cancel")
def cancel_slot_registration(slot_id: str, user_id: str = Query(..., description="ID của user")):
    """Sinh viên hủy đăng ký lịch rảnh"""
    result = controller.cancel_slot_registration(slot_id, user_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/change")
def change_slot(data: ChangeSlotRequest):
    """Sinh viên thay đổi lịch đã đăng ký"""
    result = controller.change_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.delete("/{slot_id}")
def delete_slot(slot_id: str, tutor_id: str = Query(..., description="ID của tutor")):
    """Tutor xóa lịch rảnh"""
    result = controller.delete_slot(slot_id, tutor_id)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/close")
def close_slot(data: CloseSlotRequest):
    """Đóng đăng ký lịch rảnh và chuyển thành session"""
    result = controller.close_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.get("/user/{user_id}/registered")
def get_user_registered_slots(user_id: str):
    """Lấy tất cả lịch rảnh mà user đã đăng ký"""
    return controller.get_user_registered_slots(user_id)

@router.put("/update")
def update_slot(data: UpdateAvailableSlot):
    """Tutor cập nhật lịch rảnh"""
    result = controller.update_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/confirm")
def confirm_slot(data: ConfirmSlotRequest):
    """Tutor xác nhận slot (chuyển thành session)"""
    result = controller.confirm_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/cancel")
def cancel_slot(data: CancelSlotRequest):
    """Tutor hủy slot"""
    result = controller.cancel_slot(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/propose-reschedule")
def propose_reschedule(data: ProposeRescheduleRequest):
    """Tutor đề xuất đổi lịch"""
    result = controller.propose_reschedule(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/respond-change")
def respond_to_change(data: ChangeResponseRequest):
    """Sinh viên phản hồi thay đổi"""
    result = controller.respond_to_change(data)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

@router.post("/respond-reschedule")
def respond_to_reschedule(reschedule_request_id: str = Query(..., description="ID của reschedule request"), 
                          user_id: str = Query(..., description="ID của user"),
                          response: str = Query(..., description="accept hoặc reject")):
    """Sinh viên phản hồi đề xuất đổi lịch"""
    result = controller.respond_to_reschedule(reschedule_request_id, user_id, response)
    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
    return result

