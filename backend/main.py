from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dependencies.auth_config import get_user_id_from_token
from routers import image_route, scripts_route, trends_route, tts_route, video_route , auth_route
from services import go_trends

app = FastAPI(title="AI Short Video Creator API")
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Bao gồm các router
app.include_router(auth_route.router, prefix="/auth", tags=["Authentication"])
app.include_router(trends_route.router, prefix="/trends", tags=["Trends"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(scripts_route.router, prefix="/script", tags=["Script"] ,  dependencies=[Depends(get_user_id_from_token)])
app.include_router(tts_route.router, prefix="/tts", tags=["TTS"] , dependencies=[Depends(get_user_id_from_token)])
app.include_router(image_route.router, prefix="/image", tags=["Image"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(video_route.router, prefix="/video", tags=["Video"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(go_trends.router, prefix="/go-trends", tags=["Go Trends"], dependencies=[Depends(get_user_id_from_token)])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Short Video Creator API"}


