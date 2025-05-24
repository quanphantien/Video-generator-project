from fastapi import APIRouter, Depends
from models.video import TrendResponse
from services.trends_service import get_trends

router = APIRouter()

@router.get("/get", response_model=list[TrendResponse])
async def get_trends_endpoint(keyword: str = None):
    # Gợi ý xu hướng dựa trên từ khóa hoặc API trend
    pass