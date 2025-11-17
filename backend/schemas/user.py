from pydantic import BaseModel

class User(BaseModel):
    username: str
    full_name: str | None = None

class UserInDB(User):
    pass

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
