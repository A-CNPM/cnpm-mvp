from fastapi import APIRouter, HTTPException, status
from schemas.user import LoginRequest, TokenResponse, LogoutRequest
from controllers.auth_controller import AuthController

auth_controller = AuthController()
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    try:
        # Lấy role từ request (Pydantic model)
        role = request.role
        result = auth_controller.login(request.username, request.password, role)
        if not result:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        user = result["user"]
        access_token = result["access_token"]
        
        # Xử lý role: nếu là list thì lấy role được chọn, nếu không thì lấy role đơn
        user_role = user.get("role")
        if isinstance(user_role, list):
            # Lấy role được chọn từ request
            selected_role = role if role in user_role else user_role[0]
        else:
            selected_role = user_role
        
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "role": selected_role,  # Trả về role được chọn
            "username": user["username"],
            "full_name": user.get("full_name", "")
        }
        
        # Thêm thông tin tutor_type nếu là Tutor
        if selected_role == "Tutor" and user.get("tutor_type"):
            response_data["tutor_type"] = user.get("tutor_type")
        
        return response_data
    except ValueError as e:
        # Lỗi từ validation (email format, SSO verification, etc.)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        # Log lỗi để debug
        import traceback
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e) or "Invalid credentials")

@router.post("/logout")
def logout(request: LogoutRequest):
    success = auth_controller.logout(request.username)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Logout failed")
    return {"detail": "Logout successful"}