from fastapi import APIRouter, Depends
from models.video import TrendResponse
from services.trends_service import get_trends
from services.gemini import generate_content

router = APIRouter()

@router.get("/get", response_model=list[TrendResponse])
async def get_trends_endpoint(keyword: str = None):
    # Gợi ý xu hướng dựa trên từ khóa hoặc API trend
    pass
@router.get("/ai-generate", response_model=list[TrendResponse])
async def ai_generate_trends_endpoint(keyword: str = None):
    """
    Endpoint to generate trends using AI based on the provided keyword.
    
    Args:
        keyword (str): The keyword to generate trends for.
    
    Returns:
        list[TrendResponse]: A list of generated trends.
    """
    result = None
    if not keyword:
        result = generate_content("Các chủ đề xu hướng hiện tại")
    else:
        result = generate_content("Các chủ đề xu hướng hiện tại về "+keyword)
    return [TrendResponse(keyword=result, popularity=0)]