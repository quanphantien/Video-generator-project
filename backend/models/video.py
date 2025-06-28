from pydantic import BaseModel
from typing import Optional


class VideoRequest(BaseModel):
    script: str
    audio_url: str
    background_url: Optional[str] = None
    subtitles: Optional[str] = None

class VideoResponse(BaseModel):
    video_id: str
    video_url: str
    created_at: str