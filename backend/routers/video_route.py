from fastapi import APIRouter, Depends, UploadFile, File
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.video_dto import VideoEditRequest, VideoEditResponse, VideoRequest, VideoResponse, VideoUploadRequest, VideoUploadResponse
from services.video_service import generate_video, edit_video, get_user_videos , delete_video, upload_video
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/generate", response_model=StandardResponse[VideoResponse])
async def generate_video_endpoint(request: VideoRequest , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Generate video succesfully  " ,
                data = generate_video(request=request ,  user_id= user_id , db= db))
@router.post("/edit", response_model=StandardResponse[VideoEditResponse])
async def edit_video_endpoint(video_id: str,  request : VideoEditRequest , db: Session = Depends(get_db)):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Edit video succesfully  " ,
                data = VideoEditResponse(success=True, new_video=edit_video(video_id , request  ,db)))

@router.post("/video-youtube", response_model=StandardResponse[VideoUploadResponse])
async def upload_video_endpoint(request : VideoUploadRequest , user_id: str = Depends(get_user_id_from_token),  db: Session = Depends(get_db)):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Upload video succesfully  " ,
                data = upload_video(request=request, db=db, user_id=user_id)
                )
@router.get("", response_model=StandardResponse[list[VideoResponse]])
async def get_videos(db: Session = Depends(get_db)  ,user_id = Depends(get_user_id_from_token)   ):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get video succesfully  " ,
                data = get_user_videos(db= db, user_id=user_id))
    
@router.delete("/{video_id}", response_model=StandardResponse[bool])
async def delete_video_endpoint(video_id: str, db: Session = Depends(get_db) , user_id = Depends(get_user_id_from_token)):
    success = delete_video(video_id=video_id,db= db , user_id= user_id)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Delete succesfully  " ,
                data = True)