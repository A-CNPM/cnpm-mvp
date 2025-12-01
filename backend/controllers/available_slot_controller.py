from typing import List, Dict, Optional
from services.available_slot_service import AvailableSlotService
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

class AvailableSlotController:
    def __init__(self):
        self.service = AvailableSlotService()
    
    def create_slot(self, data: CreateAvailableSlot) -> Dict:
        """Tutor tạo lịch rảnh mới"""
        return self.service.create_slot(data)
    
    def get_tutor_slots(self, tutor_id: str, status: Optional[str] = None) -> List[Dict]:
        """Lấy tất cả lịch rảnh của tutor"""
        return self.service.get_tutor_slots(tutor_id, status)
    
    def register_slot(self, data: RegisterSlotRequest) -> Dict:
        """Sinh viên đăng ký lịch rảnh"""
        return self.service.register_slot(data)
    
    def cancel_slot_registration(self, slot_id: str, user_id: str) -> Dict:
        """Sinh viên hủy đăng ký lịch rảnh"""
        return self.service.cancel_slot_registration(slot_id, user_id)
    
    def change_slot(self, data: ChangeSlotRequest) -> Dict:
        """Sinh viên thay đổi lịch đã đăng ký"""
        return self.service.change_slot(data)
    
    def delete_slot(self, slot_id: str, tutor_id: str) -> Dict:
        """Tutor xóa lịch rảnh"""
        return self.service.delete_slot(slot_id, tutor_id)
    
    def close_slot(self, data: CloseSlotRequest) -> Dict:
        """Đóng đăng ký lịch rảnh và chuyển thành session"""
        return self.service.close_slot(data)
    
    def get_user_registered_slots(self, user_id: str) -> List[Dict]:
        """Lấy tất cả lịch rảnh mà user đã đăng ký"""
        return self.service.get_user_registered_slots(user_id)
    
    def update_slot(self, data: UpdateAvailableSlot) -> Dict:
        """Tutor cập nhật lịch rảnh"""
        return self.service.update_slot(data)
    
    def confirm_slot(self, data: ConfirmSlotRequest) -> Dict:
        """Tutor xác nhận slot (chuyển thành session)"""
        return self.service.confirm_slot(data)
    
    def cancel_slot(self, data: CancelSlotRequest) -> Dict:
        """Tutor hủy slot"""
        return self.service.cancel_slot(data)
    
    def propose_reschedule(self, data: ProposeRescheduleRequest) -> Dict:
        """Tutor đề xuất đổi lịch"""
        return self.service.propose_reschedule(data)
    
    def respond_to_change(self, data: ChangeResponseRequest) -> Dict:
        """Sinh viên phản hồi thay đổi"""
        return self.service.respond_to_change(data)
    
    def respond_to_reschedule(self, reschedule_request_id: str, user_id: str, response: str) -> Dict:
        """Sinh viên phản hồi đề xuất đổi lịch"""
        return self.service.respond_to_reschedule(reschedule_request_id, user_id, response)

