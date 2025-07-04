
from typing import Optional
from requests import Session
from dto.style_dto import StyleCreate
from models.style import Style


def addStyleService(request: StyleCreate, db: Session, user_id: str) -> str:
    new_style = Style(
        user_id=user_id,
        phong_cach=request.phong_cach,
        giong_dieu=request.giong_dieu,
        do_dai_cau=request.do_dai_cau,
        tu_vung=request.tu_vung
    )
    db.add(new_style)
    db.commit()
    db.refresh(new_style)
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