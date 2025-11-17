from schemas.user import UserInDB
from typing import Optional

# Hardcoded user data
fake_users_db = {
    "a.nguyen": {
        "username": "a.nguyen",
        "full_name": "Nguyen Van A",
        "role": "Mentee",
        "password": "123456"
    },
    "b.levan": {
        "username": "b.levan",
        "full_name": "Bob Builder",
        "role": "Mentee",
        "password": "123456"
    }
}

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
