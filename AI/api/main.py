from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.responses import JSONResponse

from api.routes import health, brotes, demanda, anomalias, training
from api.middleware.logging import request_logger
from api.middleware.error_handler import register_exception_handlers
from utils.config import settings
from utils.logger import get_logger

logger = get_logger()

app = FastAPI(
    title="AI Observatorio de Datos Sanitarios",
    description="Microservicio de predicción y detección de anomalías para el Observatorio.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.middleware("http")(request_logger)
register_exception_handlers(app)

app.include_router(health.router, prefix="/api/v1")
app.include_router(brotes.router, prefix="/api/v1")
app.include_router(demanda.router, prefix="/api/v1")
app.include_router(anomalias.router, prefix="/api/v1")
app.include_router(training.router, prefix="/api/v1")

@app.on_event("startup")
def startup_event() -> None:
    logger.info("Iniciando AI microservicio en modo %s", settings.APP_ENV)

@app.on_event("shutdown")
def shutdown_event() -> None:
    logger.info("Cerrando AI microservicio")

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc):
    logger.warning("Request validation error: %s", exc)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.model.__name__ if hasattr(exc, 'model') else None},
    )
