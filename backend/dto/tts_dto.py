

from typing import Optional
from pydantic import BaseModel
from config.constants import voices


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = voices['VN_VOICE_MALE']

class TTSResponse(BaseModel):
    audio_url: str


class Voice(BaseModel) : 
    language : str 
    gender : str 
    name : str 
