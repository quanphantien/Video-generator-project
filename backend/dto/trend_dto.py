from pydantic import BaseModel


class TrendResponse(BaseModel):
    keyword: str
    popularity: int