from schemas.user import UserInDB
from typing import Optional
from data.users import fake_users_db

def get_user(username: str):
    return fake_users_db.get(username)

def verify_password(plain_password: str, password: str) -> bool:
    return plain_password == password

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    return user
