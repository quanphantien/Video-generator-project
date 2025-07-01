from typing import Optional
from fastapi import APIRouter, Depends, Query
from app_code import AppCode
from dependencies.auth_config import get_user_id_from_token
from dto.standard_response import StandardResponse
from dto.trend_dto import TrendResponse
from services.trends_service import get_trends

router = APIRouter()
@router.get("", response_model=StandardResponse[list[TrendResponse]])
async def ai_generate_trends_endpoint(
    keyword: Optional[str] = Query(default=None, description="The keyword to generate trends for"),
    count: int = Query(default=5, ge=1, le=20, description="Number of trends to generate (1-20)"),
    _auth: str = Depends(get_user_id_from_token)  
):
    """
    Endpoint to generate trends using AI based on the provided keyword and count.

    Returns:
        list[TrendResponse]: A list of generated trends.
    """
    return StandardResponse(
                code = AppCode.SUCCESS , 
                message = "Get trends Successfully " ,
                data = get_trends(keyword, count))

