

import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VideoRequest(BaseModel):
    script: str
    video_name : str 
    audio_url: list[str]
    images_url : list[str]
    min_duration_per_picture : float 

class VideoResponse(BaseModel):
    video_id : str 
    video_url: str
    name : str 

class VideoEditRequest(BaseModel) : 
    title : str 
    url : str
    

class VideoEditResponse(BaseModel) : 
    success : bool 
    new_video : VideoResponse

class SummaryVideoStatistics(BaseModel) : 
    total_views: int
    total_likes: int 
    total_count: int
class VideoStatistics(BaseModel):
    video_id: str
    video_youtube_id : str
    title: str
    publishedAt: datetime = Field(default=None) 
    viewCount: int
    likeCount: Optional[int] = None
    commentCount: Optional[int] = None

    class Config:
        arbitrary_types_allowed = True 
class SocialStatics(BaseModel): 
    platform : str 
    statistics : list[VideoStatistics] 
    summary : SummaryVideoStatistics





