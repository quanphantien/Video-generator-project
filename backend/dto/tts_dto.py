

from typing import Optional
from pydantic import BaseModel


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "vi"

class TTSResponse(BaseModel):
    audio_url: str