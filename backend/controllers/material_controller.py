from services.material_service import MaterialService
from schemas.material import MaterialSearchCriteria
from typing import List, Dict

class MaterialController:
    def __init__(self):
        self.material_service = MaterialService()
    
    def get_user_materials(self, user_id: str) -> List[Dict]:
        """Lấy tất cả học liệu của user"""
        return self.material_service.get_user_materials(user_id)
    
    def get_material_detail(self, material_id: str, user_id: str) -> Dict:
        """Lấy chi tiết học liệu"""
        material = self.material_service.get_material_detail(material_id, user_id)
        if not material:
            return {"success": False, "message": "Material not found or access denied"}
        return {"success": True, "material": material}
    
    def search_materials(self, user_id: str, criteria: MaterialSearchCriteria) -> List[Dict]:
        """Tìm kiếm học liệu"""
        return self.material_service.search_materials(
            user_id,
            keyword=criteria.keyword or "",
            category=criteria.category or "",
            subject=criteria.subject or "",
            material_type=criteria.material_type or ""
        )
    
    def get_categories(self, user_id: str) -> Dict:
        """Lấy danh sách categories"""
        categories = self.material_service.get_categories(user_id)
        return {"categories": categories}
    
    def get_subjects(self, user_id: str) -> Dict:
        """Lấy danh sách subjects"""
        subjects = self.material_service.get_subjects(user_id)
        return {"subjects": subjects}
    
    def record_download(self, material_id: str, user_id: str) -> Dict:
        """Ghi nhận lượt tải xuống"""
        success = self.material_service.record_download(material_id, user_id)
        if success:
            return {"success": True, "message": "Download recorded"}
        return {"success": False, "message": "Material not found"}

