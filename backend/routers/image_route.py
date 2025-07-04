from fastapi import APIRouter
from app_code import appCode
from dto.image_dto import ImageRequest, ImageResponse
from dto.standard_response import StandardResponse
from services.media_service import generate_image


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
                data = generate_image(request.prompt))
