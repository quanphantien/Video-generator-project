

from typing import List
from pydantic import BaseModel

from dto.scene import Scene


class ScriptRequest(BaseModel):
    language: str
    prompt: str
    num_scenes: int



class ScriptResponse(BaseModel):
   #  id: int
    language: str
    prompt: str
    num_scenes: int
    scenes: List[Scene]
