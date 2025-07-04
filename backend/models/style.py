from sqlalchemy import Column, Integer, String

from models.base import Base


class Style(Base):
    __tablename__ = "styles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # UUID của người dùng
    style = Column(String)  # "style"
    tone = Column(String)  # "tone"
    sentence_length = Column(String)  # "sentence_length"
    vocabulary = Column(String)  # "vocabulary"