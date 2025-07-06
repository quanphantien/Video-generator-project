from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
import uuid
from config.config import settings
from database.session import SessionLocal
from dto.user import UserRegisterRequest, UserResponse
from models.video import Video
from models.user import User
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import json
import os

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(data: dict, expires_delta: timedelta) -> str:
    """
    Hàm chung để tạo JWT token, dùng được cho cả access và refresh token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_access_token(user: User) -> str:
    """
    Tạo access token JWT chứa id và email.
    """
    data = {
        "sub": str(user.id),
        "email": user.email,
        "type": "access"
    }
    return _create_token(data, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

def create_refresh_token(user: User) -> str:
    """
    Tạo refresh token JWT chứa id.
    """
    data = {
        "sub": str(user.id),
        "type": "refresh"
    }
    return _create_token(data, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))



def register_user(request: UserRegisterRequest, db: Session) -> User:
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        username = request.username,
        email=request.email,
        password=get_password_hash(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(username: str, password: str, db: Session ):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password):
        return None
    return user


# Thêm vào đầu file nếu chưa có
try:
    firebase_admin.get_app()
except ValueError:
    # Initialize Firebase Admin SDK
    json_path = os.path.join(os.path.dirname(__file__), "..", "convease-7c52b-firebase-adminsdk-fbsvc-3c889e8860.json")
    cred = credentials.Certificate(json_path)
    firebase_admin.initialize_app(cred)

def login_with_google(firebase_token: str, db: Session, email: str = None, name: str = None, photo: str = None):
    """
    Đăng nhập với Google Firebase token
    """
    try:
        # Verify Firebase token
        decoded_token = firebase_auth.verify_id_token(firebase_token)
        firebase_email = decoded_token.get('email')
        firebase_name = decoded_token.get('name', '')
        firebase_photo = decoded_token.get('picture', '')
        
        # Sử dụng email từ token Firebase làm chính
        final_email = firebase_email or email
        final_name = firebase_name or name or final_email.split('@')[0]
        final_photo = firebase_photo or photo
        
        if not final_email:
            raise HTTPException(status_code=400, detail="Email not found in token")
        
        # Tìm user existing
        user = db.query(User).filter(User.email == final_email).first()
        if not user:
            # Tự động đăng ký nếu chưa tồn tại
            user = User(
                id=str(uuid.uuid4()),
                username=final_name,
                email=final_email,
                password=get_password_hash(str(uuid.uuid4())),  # random password
                avatar_url=final_photo
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Cập nhật thông tin nếu có thay đổi
            if final_photo and user.avatar_url != final_photo:
                user.avatar_url = final_photo
            if final_name and user.username != final_name:
                user.username = final_name
            db.commit()
            db.refresh(user)
            
        return user
        
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google login failed: {str(e)}")

def get_user_by_id(db: Session, user_id: str) -> User:
    """Fetch a user from the database by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserResponse:
    token = credentials.credentials    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token (no sub)")
        else : 
            user = get_user_by_id(db, user_id)
            return UserResponse(
                avatar_url=user.avatar_url ,
                email= user.email , 
                username=user.username, 
                id = str(user.id)
            )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_refresh_token(token: str, db: Session) -> User:
    """
    Xác thực refresh token, kiểm tra type và tìm user tương ứng trong DB.
    Trả về đối tượng User nếu token hợp lệ.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing user ID in token"
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
