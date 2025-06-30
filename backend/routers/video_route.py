from fastapi import APIRouter, Depends, UploadFile, File
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.video_dto import VideoEditRequest, VideoEditResponse, VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video, get_user_videos , delete_video
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/generate", response_model=VideoResponse)
async def generate_video_endpoint(request: VideoRequest , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return generate_video(request=request ,  user_id= user_id , db= db); 
@router.post("/edit", response_model=VideoEditResponse)
async def edit_video_endpoint(video_id: str,  request : VideoEditRequest , db: Session = Depends(get_db)):
    return VideoEditResponse(success=True, new_video=edit_video(video_id , request  ,db))
@router.get("", response_model=list[VideoResponse])
async def get_videos(db: Session = Depends(get_db)  ,user_id = Depends(get_user_id_from_token)   ):
    return get_user_videos(db= db, user_id=user_id)
@router.delete("/{video_id}", response_model=dict)
async def delete_video_endpoint(video_id: str, db: Session = Depends(get_db) , user_id = Depends(get_user_id_from_token)):
    success = delete_video(video_id=video_id,db= db , user_id= user_id)
    return {"success": success}