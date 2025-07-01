from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from dto.standard_response import StandardResponse
from main import app

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(
            code=exc.status_code,
            message=exc.detail,
            data=None,
            error=exc.detail
        ).model_dump()
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
