
from pydantic import BaseModel
from typing import List, Optional

class ProjectDTO(BaseModel):
    id: str
    video_url: str
    image_urls: List[str]
    audio_urls: List[str]
    thumbnail: Optional[str] = None
    user_id: str

    class Config:
        from_attributes = True 
