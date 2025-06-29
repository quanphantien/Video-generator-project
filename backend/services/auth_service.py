from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from database.database import get_db_session  # giả sử bạn có session
from sqlalchemy.orm import Session
import uuid

from dto.user import UserRegisterRequest
from models.user import User

# Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user: User):
    data = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user: User):
    data = {
        "sub": str(user.id),
        "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def register_user(request: UserRegisterRequest, db: Session = Depends(get_db_session)) -> User:
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        email=request.email,
        password=get_password_hash(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(email: str, password: str, db: Session = Depends(get_db_session)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        return None
    return user


def login_with_google(token: str, db: Session = Depends(get_db_session)):
    """
    Dummy function – Replace with Google token verification.
    """
    # Giả lập email từ token
    email = "googleuser@example.com"  # thực tế bạn sẽ decode từ token Google

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Tự động đăng ký nếu chưa tồn tại
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password=get_password_hash(str(uuid.uuid4()))  # random password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# def get_current_user(token: str = Depends(...)):  # bạn nên dùng OAuth2PasswordBearer
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("sub")
#         # Lấy user từ DB, tùy bạn đã cấu hình Depends(get_db_session)
#         ...
#         return user
#     except Exception:
#         raise HTTPException(status_code=401, detail="Invalid token")
