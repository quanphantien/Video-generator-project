import datetime
from fastapi import APIRouter, Depends
from requests import Session

from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from dependencies.db import get_db
from dto.project_dto import ProjectDTO
from dto.standard_response import StandardResponse
from services.project_service import getAllProjects

router = APIRouter()

@router.get("", response_model=StandardResponse[list[ProjectDTO]])
async def getAll(user_id: str = Depends(get_user_id_from_token) , 
                                   db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get all projects successfully" ,
                data = getAllProjects(user_id , db ))
