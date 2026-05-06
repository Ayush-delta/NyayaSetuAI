from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from services.auth_service import authenticate_user, create_access_token, create_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    username: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    username: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    print(f"LOGIN ATTEMPT: username='{request.username}', password='{request.password}'")
    user = authenticate_user(request.username, request.password)
    print(f"AUTHENTICATION RESULT: {user is not None}")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "full_name": user["full_name"]
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "full_name": user["full_name"],
        "username": user["username"]
    }

@router.post("/signup", response_model=LoginResponse)
async def signup(request: SignupRequest):
    user = create_user(request.username, request.password, request.full_name, role="officer")
    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "full_name": user["full_name"]
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "full_name": user["full_name"],
        "username": user["username"]
    }

@router.get("/me")
async def get_me(token: str):
    from services.auth_service import decode_token
    payload = decode_token(token)
    return {
        "username": payload.get("sub"),
        "role": payload.get("role"),
        "full_name": payload.get("full_name")
    }