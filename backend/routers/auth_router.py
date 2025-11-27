from fastapi import APIRouter, HTTPException, status
from schemas.user import LoginRequest, TokenResponse, LogoutRequest
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
    selected_role = result["selected_role"]
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": selected_role,
        "username": user["username"],
        "full_name": user["full_name"],
        "roles": user["role"]
    }

@router.post("/logout")
def logout(request: LogoutRequest):
    success = auth_controller.logout(request.username)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Logout failed")
    return {"detail": "Logout successful"}