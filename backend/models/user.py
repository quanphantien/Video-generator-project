from pydantic import BaseModel

class User(BaseModel):
    email: str
    password: str  # Mật khẩu sẽ được mã hóa