from fastapi import APIRouter, Depends, UploadFile, File
from database.session import SessionLocal
from dto.video_dto import VideoEditResponse, VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video, get_user_videos
from sqlalchemy.orm import Session

router = APIRouter()
router = APIRouter()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/generate", response_model=VideoResponse)
async def generate_video_endpoint(request: VideoRequest):
    return VideoResponse(video_url=generate_video(request)  ,name= request.video_name)

@router.post("/edit", response_model=VideoEditResponse)
async def edit_video_endpoint(video_id: str, new_video_url : str  , db: Session = Depends(get_db)):
    return VideoEditResponse(video_url=edit_video(video_id , new_video_url  ,db))


@router.get("", response_model=list[VideoResponse])
async def get_videos(db: Session = Depends(get_db) ):
    return get_user_videos(Session = Depends(db))