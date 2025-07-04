
from sqlalchemy import ARRAY, Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.types import JSON
import uuid

from models.base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_url = Column(Text, nullable=False)
    image_urls = Column(ARRAY(String), nullable=False)   # ✅ ARRAY(String)
    audio_urls = Column(ARRAY(String), nullable=False)   # ✅ ARRAY(String)
    thumbnail_url = Column(Text, nullable=True)
    user_id = Column(String, nullable=False)
