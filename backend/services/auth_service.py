import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 480))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In production this comes from PostgreSQL users table
# For now hardcoded from .env
USERS_DB = {
    os.getenv("ADMIN_USERNAME", "admin"): {
        "username": os.getenv("ADMIN_USERNAME", "admin"),
        "hashed_password": pwd_context.hash(os.getenv("ADMIN_PASSWORD", "admin123")),
        "role": "admin",
        "full_name": "System Administrator"
    },
    os.getenv("OFFICER_USERNAME", "officer"): {
        "username": os.getenv("OFFICER_USERNAME", "officer"),
        "hashed_password": pwd_context.hash(os.getenv("OFFICER_PASSWORD", "officer123")),
        "role": "officer",
        "full_name": "Government Officer"
    }
}

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = USERS_DB.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_user(username: str, password: str, full_name: str, role: str = "officer"):
    if username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already registered")
    USERS_DB[username] = {
        "username": username,
        "hashed_password": pwd_context.hash(password),
        "role": role,
        "full_name": full_name
    }
    return USERS_DB[username]

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )