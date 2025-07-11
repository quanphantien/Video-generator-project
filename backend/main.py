import traceback
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dependencies.auth_config import get_user_id_from_token
from dto.standard_response import StandardResponse
from routers import image_route, scripts_route, trends_route, tts_route, video_route , auth_route , statistic_route , style_route , project_route, audio_route
from services import go_trends
from fastapi import FastAPI, status


app = FastAPI(title="AI Short Video Creator API")
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(
            code=exc.status_code,
            message=str(exc.detail),
            data=None,
            error=str(exc.detail)
        ).model_dump()
    )
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log chi tiết lỗi (tùy chọn)
    print("🔥 Unhandled Exception:", traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_ERROR",
            "message": str(exc)  # Hoặc format theo `AppResponse.fail(...)`
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=StandardResponse(
            code=422,
            message="Validation error",
            data=None,
            error=str(exc)
        ).model_dump()
    )
app.include_router(auth_route.router, prefix="/auth", tags=["Authentication"])
app.include_router(trends_route.router, prefix="/trends", tags=["Trends"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(scripts_route.router, prefix="/script", tags=["Script"] ,  dependencies=[Depends(get_user_id_from_token)])
app.include_router(tts_route.router, prefix="/tts", tags=["TTS"] , dependencies=[Depends(get_user_id_from_token)])
app.include_router(image_route.router, prefix="/image", tags=["Image"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(video_route.router, prefix="/video", tags=["Video"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(go_trends.router, prefix="/go-trends", tags=["Go Trends"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(statistic_route.router, prefix="/statistics", tags=["Statistics"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(style_route.router, prefix="/style", tags=["Persionalization Style"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(project_route.router, prefix="/projects", tags=["User Projects"], dependencies=[Depends(get_user_id_from_token)])
app.include_router(audio_route.router, prefix="/audio", tags=["Audio"], dependencies=[Depends(get_user_id_from_token)])


@app.get("/")
async def root():
    return {"message": "Welcome to AI Short Video Creator API"}


