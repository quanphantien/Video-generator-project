

from pydantic import BaseModel


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
    
