from fastapi import APIRouter, Depends
from models.video import TTSRequest, TTSResponse
from services.tts_service import generate_tts

router = APIRouter()

# Gửi yêu cầu POST đến /generate với JSON body như sau:
# {
#     "text": "Bạn đã đọc 'Vợ nhặt' của Kim Lân chưa?",
#     "voice": "vi"
# }
## Trả về JSON với URL của file âm thanh đã được tạo:
# {
#     "audio_url": "https://res.cloudinary.com/your-cloud-name/video/upload/tts/tts_xxxx.mp3"
# }



@router.post("/generate", response_model=TTSResponse)
async def generate_tts_endpoint(request: TTSRequest):
    audio_url = generate_tts(request.text, request.voice)  
    return TTSResponse(audio_url=audio_url)  