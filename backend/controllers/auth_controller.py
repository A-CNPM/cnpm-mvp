from typing import Optional
from services.auth_service import get_user, verify_password
from core.security import create_access_token

class AuthController:
    def login(self, username: str, password: str, role: str) -> Optional[dict]:
        user = get_user(username)
        if not user or user.get("role") != role:
            return None
        if not verify_password(password, user["password"]):
            return None
        # Giả lập xác thực HCMUT_SSO.accountValidation()
        # Nếu thành công, tạo token và trả về user
        access_token = create_access_token({"sub": user["username"], "role": user["role"]})
        return {"user": user, "access_token": access_token}

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
