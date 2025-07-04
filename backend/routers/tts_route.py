from fastapi import APIRouter, Depends
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from dto.standard_response import StandardResponse
from dto.tts_dto import TTSRequest, TTSResponse, Voice
from services.media_service import  generate_tts,  getVoices

router = APIRouter()
@router.post("/generate", response_model=StandardResponse[TTSResponse])
async def generate_tts_endpoint(
                        request: TTSRequest  ,
                        _auth: str = Depends(get_user_id_from_token)  ):
    audio_url = generate_tts(request.text, request.voice)  
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get audio successfully" ,
                data = TTSResponse(audio_url=audio_url)  )


@router.get("/voices", response_model=StandardResponse[list[Voice]])
async def getVoicesEndpoints( _auth: str = Depends(get_user_id_from_token)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get voices successfully" ,
                data = getVoices())