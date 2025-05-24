from pydantic import BaseModel
from typing import Optional

class TrendResponse(BaseModel):
    keyword: str
    popularity: int

class ScriptRequest(BaseModel):
    keyword: str
    length: Optional[int] = 100  # Độ dài kịch bản (từ)

class ScriptResponse(BaseModel):
    script: str

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "vi-VN-Wavenet-A"

class TTSResponse(BaseModel):
    audio_url: str

class VideoRequest(BaseModel):
    script: str
    audio_url: str
    background_url: Optional[str] = None
    subtitles: Optional[str] = None

class VideoResponse(BaseModel):
    video_id: str
    video_url: str
    created_at: str