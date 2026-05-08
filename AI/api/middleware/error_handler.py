from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from utils.logger import get_logger

logger = get_logger()


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(FastAPIHTTPException)
    async def http_exception_handler(request, exc):
        logger.error("HTTP error %s: %s", exc.status_code, exc.detail)
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        logger.exception("Unhandled server error: %s", exc)
        return JSONResponse(
            {"detail": "Error interno del servidor"},
            status_code=500,
        )
