from fastapi import APIRouter, HTTPException, status
from schemas.user import LoginRequest, TokenResponse
from controllers.auth_controller import AuthController

auth_controller = AuthController()
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    result = auth_controller.login(request.username, request.password, request.role)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = result["user"]
    access_token = result["access_token"]
    # Trả về thông tin user để FE điều hướng
    return {
        "access_token": access_token,
        "role": user["role"],
        "user": user
    }

@router.post("/logout")
def logout(user_id: str):
    success = auth_controller.logout(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Logout failed")
    return {"detail": "Logout successful"}

@router.post("/validate-token")
def validate_token(token: str):
    valid = auth_controller.validate_token(token)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")
    return {"detail": "Token valid"}
