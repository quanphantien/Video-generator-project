from fastapi import APIRouter, Depends
from models.video import ScriptRequest, ScriptResponse
from services.script_service import generate_script

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
    script = await generate_script(request)
    return ScriptResponse(script=script)

@router.get("/test")
async def test_script_generation():
    """
    Test endpoint to generate a script with default parameters.
    
    Returns:
        ScriptResponse: A sample script response for testing purposes.
    """
    script = generate_script("fsdfg",10)
    return {"script": script}