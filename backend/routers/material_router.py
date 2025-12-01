from fastapi import APIRouter, HTTPException, status, Body
from controllers.material_controller import MaterialController
from schemas.material import Material, MaterialSearchCriteria
from typing import List, Dict

router = APIRouter(prefix="/materials", tags=["materials"])
material_controller = MaterialController()

@router.get("/user/{user_id}", response_model=List[Material])
def get_user_materials(user_id: str):
    """Lấy tất cả học liệu của user"""
    return material_controller.get_user_materials(user_id)

@router.get("/user/{user_id}/detail/{material_id}")
def get_material_detail(user_id: str, material_id: str):
    """Lấy chi tiết học liệu"""
    result = material_controller.get_material_detail(material_id, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.get("message"))
    return result

@router.post("/user/{user_id}/search", response_model=List[Material])
def search_materials(user_id: str, criteria: MaterialSearchCriteria):
    """Tìm kiếm học liệu"""
    return material_controller.search_materials(user_id, criteria)

@router.get("/user/{user_id}/categories")
def get_categories(user_id: str):
    """Lấy danh sách categories"""
    return material_controller.get_categories(user_id)

@router.get("/user/{user_id}/subjects")
def get_subjects(user_id: str):
    """Lấy danh sách subjects"""
    return material_controller.get_subjects(user_id)

@router.post("/user/{user_id}/download/{material_id}")
def record_download(user_id: str, material_id: str):
    """Ghi nhận lượt tải xuống"""
    result = material_controller.record_download(material_id, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.get("message"))
    return result

