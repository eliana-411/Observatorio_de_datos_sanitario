from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["health"])
def health_check():
    """Devuelve el estado de salud del servicio."""
    return {
        "status": "ok",
        "service": "ai-observatorio",
        "message": "Microservicio AI en línea",
    }
