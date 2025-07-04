from fastapi import APIRouter, Depends, UploadFile, File
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.style_dto import StyleCreate
from dto.video_dto import SocialStatics
from services.statistics_service import get_all_statistic
from sqlalchemy.orm import Session

from services.style_service import addStyleService, getStyleByUserId

router = APIRouter()


@router.post("", response_model=StandardResponse[str])
async def addStyle(request: StyleCreate , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get all statistics successfully" ,
                data = addStyleService(style=request , userId = user_id , db = db))
@router.get("", response_model=StandardResponse[dict])
async def addStyle(request: StyleCreate , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get all statistics successfully" ,
                data = getStyleByUserId( userId = user_id , db = db))