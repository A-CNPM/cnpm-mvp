from typing import Optional
from services.auth_service import get_user, verify_password
from core.security import create_access_token
from data.tutors_auth import get_tutor_by_email, get_tutor_by_username, is_tutor_verified

class AuthController:
    def login(self, email_or_username: str, password: str, role: str) -> Optional[dict]:
        """
        Xử lý đăng nhập cho tất cả roles với HCMUT_SSO
        - Tất cả users (Mentee, Tutor, Admin) đều phải đăng nhập bằng email trường
        - Hỗ trợ cả username (tự động chuyển thành email) và email đầy đủ
        - Phải được xác thực qua HCMUT_SSO
        """
        # Nếu không có @, coi như username và tự động thêm @hcmut.edu.vn
        if "@" not in email_or_username:
            email = f"{email_or_username}@hcmut.edu.vn"
        else:
            email = email_or_username
            # Kiểm tra email có đúng format không
            if not (email.endswith("@hcmut.edu.vn") or email.endswith("@hcmut.vn")):
                raise ValueError("Tất cả người dùng phải đăng nhập bằng email trường (@hcmut.edu.vn hoặc @hcmut.vn)")
        
        # Giả lập xác thực HCMUT_SSO
        sso_verified = self._verify_hcmut_sso(email, password)
        if not sso_verified:
            raise ValueError("Xác thực HCMUT_SSO thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.")
        
        # Xử lý đăng nhập cho từng role
        if role == "Tutor":
            return self._login_tutor(email, password)
        elif role == "Mentee":
            return self._login_mentee(email, password)
        else:
            # Các role khác (Admin được xử lý riêng)
            raise ValueError(f"Role {role} không được hỗ trợ trong auth controller")
    
    def _login_mentee(self, email: str, password: str) -> Optional[dict]:
        """
        Xử lý đăng nhập cho Mentee với HCMUT_SSO
        - Mentee phải đăng nhập bằng email trường
        - Phải được xác thực qua HCMUT_SSO
        """
        # Tìm user theo email
        user = self._get_user_by_email(email)
        if not user:
            raise ValueError("Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại.")
        
        # Kiểm tra role: hỗ trợ nhiều role (list) hoặc role đơn
        user_role = user.get("role")
        if isinstance(user_role, list):
            # Nếu user có nhiều role, kiểm tra Mentee có trong list không
            if "Mentee" not in user_role:
                raise ValueError("Tài khoản này không có quyền Mentee")
        else:
            # Nếu user chỉ có 1 role, kiểm tra trực tiếp
            if user_role != "Mentee":
                raise ValueError("Tài khoản này không có quyền Mentee")
        
        # Tạo token và trả về user
        access_token = create_access_token({"sub": user["username"], "role": "Mentee"})
        return {"user": user, "access_token": access_token}
    
    def _login_tutor(self, email: str, password: str) -> Optional[dict]:
        """
        Xử lý đăng nhập cho Tutor với HCMUT_SSO
        - Tutor phải đăng nhập bằng email trường
        - Phải được xác thực qua HCMUT_SSO
        - Phải có trong danh sách Tutor đã được xác thực (đồng bộ từ HCMUT_DATACORE)
        """
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
                "email": email.lower()
            }
        else:
            # Cập nhật thông tin từ tutor_auth
            user["tutor_type"] = tutor_auth.get("tutor_type")
            user["email"] = email.lower()
        
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
        Giả lập xác thực HCMUT_SSO cho tất cả users
        Trong thực tế sẽ gọi: HCMUT_SSO.accountValidation(email, password)
        """
        # Tìm user theo email (có thể là Mentee, Tutor, hoặc Admin)
        user = self._get_user_by_email(email)
        if not user:
            return False
        
        # Giả lập: Kiểm tra password (trong thực tế sẽ gọi HCMUT_SSO)
        # Ở đây giả lập bằng cách kiểm tra với users_db
        if user and verify_password(password, user.get("password", "")):
            return True
        
        # Nếu không tìm thấy password trong users_db, giả lập password mặc định
        # Trong thực tế, HCMUT_SSO sẽ xác thực trực tiếp
        return password == "123456"  # Password mặc định cho demo
    
    def _get_user_by_email(self, email: str):
        """
        Tìm user theo email hoặc username (hỗ trợ tất cả roles)
        Hỗ trợ cả email đầy đủ (username@hcmut.edu.vn) và username
        """
        from data.users import fake_users_db
        from data.profiles import fake_profiles_db
        
        # Tìm trong users_db theo email đầy đủ
        for user in fake_users_db.values():
            if user.get("email", "").lower() == email.lower():
                return user
        
        # Nếu email có dạng username@hcmut.edu.vn, tách lấy username
        if "@" in email:
            email_username = email.split("@")[0].lower()
        else:
            email_username = email.lower()
        
        # Tìm trong users_db theo username (key của dict)
        user_by_username = fake_users_db.get(email_username)
        if user_by_username:
            # Thêm email vào user nếu chưa có
            if not user_by_username.get("email"):
                # Nếu email có @, dùng email đó; nếu không, tạo email từ username
                if "@" in email:
                    user_by_username["email"] = email.lower()
                else:
                    user_by_username["email"] = f"{email_username}@hcmut.edu.vn"
            return user_by_username
        
        # Tìm trong profiles_db theo email
        for profile in fake_profiles_db.values():
            profile_email = profile.get("email", "").lower()
            if profile_email == email.lower() or (profile_email and email_username in profile_email):
                user_id = profile.get("userID")
                if user_id:
                    user = fake_users_db.get(user_id)
                    if user:
                        # Thêm email vào user nếu chưa có
                        if not user.get("email"):
                            if "@" in email:
                                user["email"] = email.lower()
                            else:
                                user["email"] = f"{email_username}@hcmut.edu.vn"
                        return user
        
        # Tìm trong tutors_auth_db theo email
        tutor_auth = get_tutor_by_email(email)
        if tutor_auth:
            username = tutor_auth.get("username")
            user = get_user(username)
            if user:
                # Thêm email vào user nếu chưa có
                if not user.get("email"):
                    if "@" in email:
                        user["email"] = email.lower()
                    else:
                        user["email"] = f"{email_username}@hcmut.edu.vn"
                return user
        
        # Tìm trong tutors_auth_db theo username
        tutor_auth_by_username = get_tutor_by_username(email_username)
        if tutor_auth_by_username:
            username = tutor_auth_by_username.get("username")
            user = get_user(username)
            if user:
                # Thêm email vào user nếu chưa có
                if not user.get("email"):
                    if "@" in email:
                        user["email"] = email.lower()
                    else:
                        user["email"] = f"{email_username}@hcmut.edu.vn"
                return user
        
        return None

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
