from fastapi import APIRouter, Depends
from dto.video_dto import VideoResponse
from services.video_service import get_user_videos, delete_video

router = APIRouter()

@router.get("/list", response_model=list[VideoResponse])
async def list_videos_endpoint(user_id: str):
    # Lấy danh sách video của người dùng
    pass

@router.delete("/{video_id}")
async def delete_video_endpoint(video_id: str):
    # Xóa video
    pass