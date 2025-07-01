from fastapi import APIRouter, Depends, UploadFile, File
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.video_dto import SocialStatics
from services.statistics_service import get_all_statistic
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/summary", response_model=StandardResponse[SocialStatics])
async def get_all_statictis(user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get all statistics successfully" ,
                data = get_all_statistic(user_id= user_id , db= db))

