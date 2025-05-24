from fastapi import APIRouter, Depends
from models.video import TTSRequest, TTSResponse
from services.tts_service import generate_tts

router = APIRouter()

@router.post("/generate", response_model=TTSResponse)
async def generate_tts_endpoint(request: TTSRequest):
    pass