from pydantic import BaseModel


class UserRegisterRequest(BaseModel):
    username : str 
    email : str 
    password : str 
    retype_password : str 
    
class TokenResponse(BaseModel) : 
    accessToken : str 
    refreshToken : str 