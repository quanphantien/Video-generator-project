from fastapi import APIRouter, Depends
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from dto.image_dto import ImageRequest, ImageResponse, Model
from dto.standard_response import StandardResponse
from services.media_service import generate_image, getModels


router = APIRouter()

@router.post("/generate", response_model=StandardResponse[ImageResponse])
async def generate_image_endpoint(request: ImageRequest):
    """
    Endpoint to generate a script based on the provided request data.
    
    Args:
        request (ScriptRequest): The request data containing the necessary parameters for script generation.
    
    Returns:
        ScriptResponse: The generated script response.
    """
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Generate image successfully" ,
                data = generate_image(request.prompt  ,request.modelCode))



@router.get("/models", response_model=StandardResponse[list[Model]])
async def getModelsEndpoints( _auth: str = Depends(get_user_id_from_token)  ):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get models successfully" ,   
                data = getModels())