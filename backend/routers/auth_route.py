from fastapi import APIRouter, Depends, UploadFile, File

from sqlalchemy.orm import Session
from database.session import SessionLocal

from dto.user import RegisterResponse, TokenResponse, UserDto, UserRegisterRequest, UserResponse
from models.user import User
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
    get_current_user,
    verify_refresh_token
)
router = APIRouter()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/register", response_model=RegisterResponse)
async def register_endpoint(request: UserRegisterRequest  ,db: Session = Depends(get_db)):
    user = register_user(request , db)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return RegisterResponse(accessToken=access_token, 
                            refreshToken=refresh_token , 
                            userDto = UserDto(
                                email=user.email , username= user.username
                            ))

@router.post("/login", response_model=TokenResponse)
async def login_endpoint(form_data: OAuth2PasswordRequestForm = Depends()  ,db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password  ,db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenResponse(accessToken=access_token, refreshToken=refresh_token)

@router.post("/login/google", response_model=TokenResponse)
async def login_google_endpoint(token: str , db: Session = Depends(get_db)):
    user = login_with_google(token)
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    print(access_token , refresh_token)
    return TokenResponse(accessToken=access_token, refreshToken=refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin người dùng hiện tại dựa trên JWT token.
    
    Args:
        current_user: Đối tượng User từ get_current_user dependency.
    
    Returns:
        UserResponse: Thông tin người dùng (id, email, username, avatar_url).
    """
    return current_user

@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.
    """
    user = verify_refresh_token(refresh_token, db)

    access_token = create_access_token(user)
    new_refresh_token = create_refresh_token(user)

    return TokenResponse(accessToken=access_token, refreshToken=new_refresh_token)
