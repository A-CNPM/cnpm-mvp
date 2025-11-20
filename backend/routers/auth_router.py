from fastapi import APIRouter, HTTPException, status
from schemas.user import LoginRequest, TokenResponse
from controllers.auth_controller import AuthController

auth_controller = AuthController()
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    result = auth_controller.login(request.username, request.password, getattr(request, "role", None))
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = result["user"]
    access_token = result["access_token"]
    return TokenResponse(access_token=access_token, role=user["role"])

@router.post("/logout")
def logout(username: str):
    success = auth_controller.logout(username)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Logout failed")
    return {"detail": "Logout successful"}
