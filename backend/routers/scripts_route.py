import datetime
from fastapi import APIRouter, Depends

from dto.script_dto import ScriptRequest, ScriptResponse
from services.script_service import generate

router = APIRouter()

@router.post("/generate", response_model=ScriptResponse)
async def generate_script_endpoint(request: ScriptRequest):
    """
    Endpoint to generate a script based on the provided request data.
    
    Args:
        request (ScriptRequest): The request data containing the necessary parameters for script generation.
    
    Returns:
        ScriptResponse: The generated script response.
    """
    return generate(request)