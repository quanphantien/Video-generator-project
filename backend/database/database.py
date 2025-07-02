from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.config import settings

import uuid
from sqlalchemy.orm import Session
from models.user import User
from models.video import Video



def create_user(db: Session, email: str, username: str, password: str, avatar_url: str = None) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        username=username,
        password=password,
        avatar_url=avatar_url
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session):
    return db.query(User).all()


def delete_user(db: Session, user_id: uuid.UUID):
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()


# ==================== VIDEO CRUD ====================

def create_video(db: Session, title: str, url: str, thumbnail_url: str, user_id: uuid.UUID, previous_version_url: str = None) -> Video:
    video = Video(
        id=uuid.uuid4(),
        title=title,
        url=url,
        thumnail_url=thumbnail_url,
        previous_version_url=previous_version_url,
        user_id=user_id
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def get_video_by_id(db: Session, video_id: uuid.UUID) -> Video:
    return db.query(Video).filter(Video.id == video_id).first()


def get_videos_by_user(db: Session, user_id: uuid.UUID):
    return db.query(Video).filter(Video.user_id == user_id).all()


def get_all_videos(db: Session):
    return db.query(Video).all()


def delete_video(db: Session, video_id: uuid.UUID):
    video = get_video_by_id(db, video_id)
    if video:
        db.delete(video)
        db.commit()
