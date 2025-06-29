from fastapi import APIRouter, Depends, UploadFile, File
from dto.user import TokenResponse, UserRegisterRequest
from dto.video_dto import VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

from services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    login_with_google,
    get_current_user
)

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register_endpoint(request: UserRegisterRequest):
    user = register_user(request)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
async def login_endpoint(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login/google", response_model=TokenResponse)
async def login_google_endpoint(token: str):
    user = login_with_google(token)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return current_user