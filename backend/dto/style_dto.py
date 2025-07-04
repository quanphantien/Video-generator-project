from pydantic import BaseModel


class StyleCreate(BaseModel):
    phong_cach: str  # Phong cách (cổ điển, hiện đại, hài hước, v.v.)
    giong_dieu: str  # Giọng điệu (u sầu, vui vẻ, nghiêm túc)
    do_dai_cau: str  # Độ dài câu (ngắn, trung bình, dài)
    tu_vung: str  # Từ vựng (trang trọng, thông thường, giản dị)

    class Config:
        schema_extra = {
            "example": {
                "phong_cach": "cổ điển",
                "giong_dieu": "u sầu",
                "do_dai_cau": "ngắn",
                "tu_vung": "trang trọng"
            }
        }