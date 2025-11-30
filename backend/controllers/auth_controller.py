from typing import Optional
from services.auth_service import get_user, verify_password
from core.security import create_access_token
from data.tutors_auth import get_tutor_by_email, get_tutor_by_username, is_tutor_verified

class AuthController:
    def login(self, username: str, password: str, role: str) -> Optional[dict]:
        # Xử lý đăng nhập cho Tutor
        if role == "Tutor":
            return self._login_tutor(username, password)
        
        # Xử lý đăng nhập cho Mentee (logic cũ)
        user = get_user(username)
        if not user:
            return None
        if not verify_password(password, user["password"]):
            return None
        
        # Kiểm tra role: hỗ trợ nhiều role (list) hoặc role đơn
        user_role = user.get("role")
        if isinstance(user_role, list):
            # Nếu user có nhiều role, kiểm tra role được chọn có trong list không
            if role not in user_role:
                return None
        else:
            # Nếu user chỉ có 1 role, kiểm tra trực tiếp
            if user_role != role:
                return None
        
        # Tạo token và trả về user
        access_token = create_access_token({"sub": user["username"], "role": role})
        return {"user": user, "access_token": access_token}
    
    def _login_tutor(self, email: str, password: str) -> Optional[dict]:
        """
        Xử lý đăng nhập cho Tutor với HCMUT_SSO
        - Tutor phải đăng nhập bằng email trường (@hcmut.edu.vn hoặc @hcmut.vn)
        - Phải được xác thực qua HCMUT_SSO
        - Phải có trong danh sách Tutor đã được xác thực (đồng bộ từ HCMUT_DATACORE)
        """
        # Kiểm tra email có đúng format không
        if not (email.endswith("@hcmut.edu.vn") or email.endswith("@hcmut.vn")):
            raise ValueError("Tutor phải đăng nhập bằng email trường (@hcmut.edu.vn hoặc @hcmut.vn)")
        
        # Giả lập xác thực HCMUT_SSO
        # Trong thực tế sẽ gọi: HCMUT_SSO.accountValidation(email, password)
        sso_verified = self._verify_hcmut_sso(email, password)
        if not sso_verified:
            raise ValueError("Xác thực HCMUT_SSO thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.")
        
        # Kiểm tra Tutor đã được xác thực trong hệ thống chưa (đồng bộ từ HCMUT_DATACORE)
        tutor_auth = get_tutor_by_email(email)
        if not tutor_auth or not tutor_auth.get("is_verified", False):
            raise ValueError("Bạn chưa được xác thực là Tutor. Vui lòng liên hệ quản trị viên để được cấp quyền.")
        
        # Lấy thông tin user từ database
        username = tutor_auth.get("username")
        user = get_user(username)
        if not user:
            # Nếu chưa có trong users_db, tạo mới từ tutor_auth
            user = {
                "username": username,
                "full_name": tutor_auth.get("full_name"),
                "role": "Tutor",
                "password": password,  # Lưu tạm, thực tế không lưu password
                "tutor_type": tutor_auth.get("tutor_type"),
                "email": email
            }
        else:
            # Cập nhật thông tin từ tutor_auth
            user["tutor_type"] = tutor_auth.get("tutor_type")
            user["email"] = email
        
        # Kiểm tra user có cả vai trò Mentee không
        user_role = user.get("role")
        if isinstance(user_role, list) and "Mentee" in user_role:
            # User có cả Mentee và Tutor role
            user["has_multiple_roles"] = True
        elif user_role == "Tutor" and tutor_auth.get("has_mentee_role", False):
            # Cập nhật role thành list nếu có cả Mentee
            user["role"] = ["Mentee", "Tutor"]
            user["has_multiple_roles"] = True
        
        # Tạo token với role Tutor
        access_token = create_access_token({"sub": user["username"], "role": "Tutor"})
        return {"user": user, "access_token": access_token}
    
    def _verify_hcmut_sso(self, email: str, password: str) -> bool:
        """
        Giả lập xác thực HCMUT_SSO
        Trong thực tế sẽ gọi: HCMUT_SSO.accountValidation(email, password)
        """
        # Giả lập: Kiểm tra email có trong danh sách Tutor đã được xác thực
        tutor_auth = get_tutor_by_email(email)
        if not tutor_auth:
            return False
        
        # Giả lập: Kiểm tra password (trong thực tế sẽ gọi HCMUT_SSO)
        # Ở đây giả lập bằng cách kiểm tra với users_db
        username = tutor_auth.get("username")
        user = get_user(username)
        if user and verify_password(password, user.get("password", "")):
            return True
        
        # Nếu không tìm thấy trong users_db, giả lập password mặc định
        # Trong thực tế, HCMUT_SSO sẽ xác thực trực tiếp
        return password == "123456"  # Password mặc định cho demo

    def logout(self, user_id: str) -> bool:
        # Giả lập xóa session/token
        # Thực tế sẽ xóa khỏi DB hoặc cache, ở đây chỉ trả về True
        return True

    def validate_token(self, token: str) -> bool:
        # Giả lập kiểm tra token với HCMUT_SSO
        # Thực tế sẽ decode và kiểm tra, ở đây chỉ trả về True nếu decode thành công
        from jose import jwt, JWTError
        from core.security import SECRET_KEY, ALGORITHM
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return True
        except JWTError:
            return False
