from fastapi import APIRouter

from dto.image_dto import ImageRequest, ImageResponse
from services.media_service import generate_image


router = APIRouter()

@router.post("/generate", response_model=ImageResponse)
async def generate_script_endpoint(request: ImageRequest):
    """
    Endpoint to generate a script based on the provided request data.
    
    Args:
        request (ScriptRequest): The request data containing the necessary parameters for script generation.
    
    Returns:
        ScriptResponse: The generated script response.
    """
    return generate_image(request.prompt)