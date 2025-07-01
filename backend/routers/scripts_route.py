import datetime
from fastapi import APIRouter, Depends

from app_code import AppCode
from dto.script_dto import ScriptRequest, ScriptResponse
from dto.standard_response import StandardResponse
from services.script_service import generate

router = APIRouter()

@router.post("/generate", response_model=StandardResponse[ScriptResponse])
async def generate_script_endpoint(request: ScriptRequest):
    """
    Endpoint to generate a script based on the provided request data.
    
    Args:
        request (ScriptRequest): The request data containing the necessary parameters for script generation.
    
    Returns:
        ScriptResponse: The generated script response.
    """
    return  StandardResponse(
                code = AppCode.SUCCESS , 
                message = "Generate Script successfully" ,
                data = generate(request))
