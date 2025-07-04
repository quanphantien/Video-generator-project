

from typing import Optional
from pydantic import BaseModel

class ImageRequest(BaseModel):
    prompt: str
    modelCode : Optional[str] = "GE"
class ImageResponse(BaseModel):
    image_url: str


class Model(BaseModel) : 
    name : str 
    code : str 
    thumbnailUrl : str 