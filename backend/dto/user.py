from pydantic import BaseModel


class UserRegisterRequest(BaseModel):
    username : str 
    email : str 
    password : str 
    retype_password : str 
    
class TokenResponse(BaseModel) : 
    accessToken : str 
    refreshToken : str 

class UserDto(BaseModel) : 
    username : str
    email : str


class RegisterResponse(BaseModel) : 
    accessToken : str 
    refreshToken : str 
    user : UserDto


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    avatar_url: str | None = None

    class Config:
        orm_mode = True 