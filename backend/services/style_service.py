
from typing import Optional
from requests import Session
from dto.style_dto import StyleCreate
from models.style import Style


def addStyleService(request: StyleCreate, db: Session, user_id: str) -> str:
    # Kiểm tra xem user đã có style chưa
    existing_style = db.query(Style).filter(Style.user_id == user_id).first()

    if existing_style:
        # Cập nhật nếu đã tồn tại
        existing_style.style = request.style
        existing_style.tone = request.tone
        existing_style.sentence_length = request.sentence_length
        existing_style.vocabulary = request.vocabulary
    else:
        # Tạo mới nếu chưa có
        new_style = Style(
            user_id=user_id,
            style=request.style,
            tone=request.tone,
            sentence_length=request.sentence_length,
            vocabulary=request.vocabulary
        )
        db.add(new_style)

    db.commit()
    return "Success"


def getStyleByUserId(db: Session, user_id: str) -> Optional[dict]:
    style = db.query(Style).filter(Style.user_id == user_id).first()
    if style:
        return {
            "id": style.id,
            "user_id": style.user_id,
            "style": style.style,
            "tone": style.tone,
            "sentence_length": style.sentence_length,
            "vocabulary": style.vocabulary
        }
    return None