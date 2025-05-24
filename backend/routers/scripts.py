from fastapi import APIRouter, Depends
from models.video import ScriptRequest, ScriptResponse
from services.script_service import generate_script

router = APIRouter()

@router.post("/generate", response_model=ScriptResponse)
async def generate_script_endpoint(request: ScriptRequest):
    pass