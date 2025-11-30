from typing import Optional, Dict, List
from data.materials import fake_materials_db, session_materials_mapping
from data.fake_sessions import fake_sessions_db
from data.profiles import fake_profiles_db

class MaterialService:
    
    def get_user_materials(self, user_id: str) -> List[Dict]:
        """Lấy tất cả học liệu mà user có quyền truy cập (từ các session đã tham gia)"""
        materials = []
        material_ids_set = set()
        
        # Lấy tất cả sessions mà user đã tham gia
        for session in fake_sessions_db.values():
            if user_id in session.get("participants", []):
                session_id = session.get("sessionID")
                # Lấy học liệu từ session này
                material_ids = session_materials_mapping.get(session_id, [])
                for material_id in material_ids:
                    if material_id not in material_ids_set:
                        material_ids_set.add(material_id)
                        material = fake_materials_db.get(material_id)
                        if material:
                            # Thêm thông tin session liên quan
                            material_with_session = material.copy()
                            material_with_session["related_session"] = {
                                "session_id": session_id,
                                "topic": session.get("topic", "Buổi tư vấn"),
                                "tutor": session.get("tutor", ""),
                                "start_time": session.get("startTime", ""),
                                "end_time": session.get("endTime", "")
                            }
                            # Thêm tên tutor
                            tutor_profile = fake_profiles_db.get(session.get("tutor", ""))
                            if tutor_profile:
                                material_with_session["tutor_name"] = tutor_profile.get("full_name", session.get("tutor", ""))
                            else:
                                material_with_session["tutor_name"] = session.get("tutor", "")
                            
                            materials.append(material_with_session)
        
        # Sắp xếp theo thời gian upload (mới nhất trước)
        materials.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        
        return materials
    
    def get_material_detail(self, material_id: str, user_id: str) -> Optional[Dict]:
        """Lấy chi tiết học liệu (kiểm tra quyền truy cập)"""
        material = fake_materials_db.get(material_id)
        if not material:
            return None
        
        # Kiểm tra user có quyền truy cập không (đã tham gia session có học liệu này)
        has_access = False
        for session in fake_sessions_db.values():
            if user_id in session.get("participants", []):
                session_id = session.get("sessionID")
                material_ids = session_materials_mapping.get(session_id, [])
                if material_id in material_ids:
                    has_access = True
                    break
        
        if not has_access:
            return None
        
        # Thêm thông tin session liên quan
        material_detail = material.copy()
        related_sessions = []
        for session in fake_sessions_db.values():
            if user_id in session.get("participants", []):
                session_id = session.get("sessionID")
                material_ids = session_materials_mapping.get(session_id, [])
                if material_id in material_ids:
                    tutor_profile = fake_profiles_db.get(session.get("tutor", ""))
                    related_sessions.append({
                        "session_id": session_id,
                        "topic": session.get("topic", "Buổi tư vấn"),
                        "tutor": session.get("tutor", ""),
                        "tutor_name": tutor_profile.get("full_name", session.get("tutor", "")) if tutor_profile else session.get("tutor", ""),
                        "start_time": session.get("startTime", ""),
                        "end_time": session.get("endTime", "")
                    })
        
        material_detail["related_sessions"] = related_sessions
        return material_detail
    
    def search_materials(self, user_id: str, keyword: str = "", category: str = "", subject: str = "", material_type: str = "") -> List[Dict]:
        """Tìm kiếm học liệu với các bộ lọc"""
        all_materials = self.get_user_materials(user_id)
        
        filtered = all_materials
        
        # Lọc theo keyword
        if keyword:
            keyword_lower = keyword.lower()
            filtered = [m for m in filtered if 
                       keyword_lower in m.get("title", "").lower() or 
                       keyword_lower in m.get("description", "").lower() or
                       any(keyword_lower in tag.lower() for tag in m.get("tags", []))]
        
        # Lọc theo category
        if category:
            filtered = [m for m in filtered if m.get("category", "") == category]
        
        # Lọc theo subject
        if subject:
            filtered = [m for m in filtered if m.get("subject", "") == subject]
        
        # Lọc theo type
        if material_type:
            filtered = [m for m in filtered if m.get("type", "") == material_type]
        
        return filtered
    
    def get_categories(self, user_id: str) -> List[str]:
        """Lấy danh sách các category từ học liệu của user"""
        materials = self.get_user_materials(user_id)
        categories = set()
        for material in materials:
            category = material.get("category")
            if category:
                categories.add(category)
        return sorted(list(categories))
    
    def get_subjects(self, user_id: str) -> List[str]:
        """Lấy danh sách các subject từ học liệu của user"""
        materials = self.get_user_materials(user_id)
        subjects = set()
        for material in materials:
            subject = material.get("subject")
            if subject:
                subjects.add(subject)
        return sorted(list(subjects))
    
    def record_download(self, material_id: str, user_id: str) -> bool:
        """Ghi nhận lượt tải xuống"""
        material = fake_materials_db.get(material_id)
        if not material:
            return False
        
        # Tăng download count
        material["download_count"] = material.get("download_count", 0) + 1
        return True

