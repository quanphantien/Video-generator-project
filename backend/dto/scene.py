


from pydantic import BaseModel


class Scene(BaseModel):
    text: str
    prompt: str
    tts: str