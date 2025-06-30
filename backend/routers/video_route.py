from fastapi import APIRouter, Depends, UploadFile, File
from dto.video_dto import VideoEditResponse, VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video

router = APIRouter()

@router.post("/generate", response_model=VideoResponse)
async def generate_video_endpoint(request: VideoRequest):
    return VideoResponse(video_url=generate_video(request))

@router.post("/edit", response_model=VideoResponse)
async def edit_video_endpoint(video_id: str, new_video_url : str ):
    return VideoEditResponse(video_url=edit_video(video_id , new_video_url))


