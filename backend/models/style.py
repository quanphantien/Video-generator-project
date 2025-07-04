from sqlalchemy import Column, Integer, String

from models.base import Base


class Style(Base):
    __tablename__ = "styles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # UUID của người dùng
    phong_cach = Column(String)  # "style"
    giong_dieu = Column(String)  # "tone"
    do_dai_cau = Column(String)  # "sentence_length"
    tu_vung = Column(String)  # "vocabulary"