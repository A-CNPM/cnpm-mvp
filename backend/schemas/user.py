from pydantic import BaseModel

class User(BaseModel):
    username: str
    full_name: str | None = None

class UserInDB(User):
    pass

class LoginRequest(BaseModel):
    full_name: str
    password: str
    role: str

class LogoutRequest(BaseModel):
    username: str

# class TokenResponse(BaseModel):
#     access_token: str
#     token_type: str = "bearer"
#     role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str