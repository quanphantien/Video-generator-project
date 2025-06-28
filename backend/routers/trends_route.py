from typing import Optional
from fastapi import APIRouter, Depends, Query
from dto.trend_dto import TrendResponse
from services.trends_service import get_trends

router = APIRouter()


@router.get("", response_model=list[TrendResponse])
async def ai_generate_trends_endpoint(
    keyword: Optional[str] = Query(default=None, description="The keyword to generate trends for"),
    count: int = Query(default=5, ge=1, le=20, description="Number of trends to generate (1-20)")
):
    """
    Endpoint to generate trends using AI based on the provided keyword and count.

    Args:
        keyword (str): The keyword to generate trends for.
        count (int): Number of trends to generate.

    Returns:
        list[TrendResponse]: A list of generated trends.
    """
    return get_trends(keyword, count)