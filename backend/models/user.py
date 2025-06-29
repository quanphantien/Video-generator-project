import uuid
from sqlalchemy import UUID, Column, String
from sqlalchemy import Column, String, ForeignKey

from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  
    username = Column(String, unique=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    videos = relationship("Video", back_populates="owner", cascade="all, delete")