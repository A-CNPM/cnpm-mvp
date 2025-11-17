from fastapi import APIRouter, Depends, HTTPException, status
from schemas.user import LoginRequest, TokenResponse
from services.auth_service import authenticate_user
from core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return TokenResponse(access_token=access_token, role=user["role"])
