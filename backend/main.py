from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import trends, scripts, tts, video, user_video
import config
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
app.include_router(trends.router, prefix="/trends", tags=["Trends"])
app.include_router(scripts.router, prefix="/script", tags=["Script"])
app.include_router(tts.router, prefix="/tts", tags=["TTS"])
app.include_router(video.router, prefix="/video", tags=["Video"])
app.include_router(user_video.router, prefix="/videos", tags=["User Videos"])
app.include_router(go_trends.router, prefix="/go-trends", tags=["Go Trends"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Short Video Creator API"}


