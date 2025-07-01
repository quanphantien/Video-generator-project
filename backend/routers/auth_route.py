from fastapi import APIRouter, Depends, UploadFile, File

from sqlalchemy.orm import Session
from database.session import SessionLocal

from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.user import RegisterResponse, TokenResponse, UserDto, UserRegisterRequest, UserResponse
from models.user import User
from services.video_service import generate_video, edit_video
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app_code import appCode
router = APIRouter()
from services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    login_with_google,
    get_current_user,
    verify_refresh_token
)
router = APIRouter()
@router.post("/register", response_model=StandardResponse[RegisterResponse])
async def register_endpoint(request: UserRegisterRequest  ,db: Session = Depends(get_db)):
    user = register_user(request , db)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return StandardResponse(
        code =  appCode.SUCCESS , 
        message = "Register Succesfully ",
        data =  RegisterResponse(accessToken=access_token, 
                                refreshToken=refresh_token , 
                                user = UserDto(
                                            email=user.email ,
                                            username= user.username)),
        error=None
                                     
                           )

@router.post("/login", response_model=StandardResponse[TokenResponse])
async def login_endpoint(form_data: OAuth2PasswordRequestForm = Depends()  ,db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password  ,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Login successfully " ,
                data = TokenResponse(accessToken=access_token, refreshToken=refresh_token))

@router.post("/login/google", response_model=StandardResponse[TokenResponse])
async def login_google_endpoint(token: str , db: Session = Depends(get_db)):
    user = login_with_google(token)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    print(access_token , refresh_token)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Login with google succesfully  " ,
                data = TokenResponse(accessToken=access_token, refreshToken=refresh_token))
    

@router.get("/me", response_model=StandardResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin người dùng hiện tại dựa trên JWT token.
    
    Args:
        current_user: Đối tượng User từ get_current_user dependency.
    
    Returns:
        UserResponse: Thông tin người dùng (id, email, username, avatar_url).
    """
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get info succesfully " ,
                data = current_user)


@router.post("/refresh", response_model=StandardResponse[TokenResponse])
def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.
    """
    user = verify_refresh_token(refresh_token, db)

    access_token = create_access_token(user)
    new_refresh_token = create_refresh_token(user)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Refresh Token Succesfully   " ,
                data = TokenResponse(accessToken=access_token, refreshToken=new_refresh_token))
     
