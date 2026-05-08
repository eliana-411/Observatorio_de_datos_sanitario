from fastapi import APIRouter, Depends, HTTPException, status
from api.schemas.anomalias_schema import AnomaliasPayload, AnomaliaResult
from api.middleware.auth import jwt_required
from prediction.anomalia_detector import AnomaliaDetector

router = APIRouter()

try:
    anomalias_detector = AnomaliaDetector()
except Exception as exc:
    anomalias_detector = None
    detector_error = str(exc)

@router.post("/detect/anomalias", response_model=AnomaliaResult, tags=["anomalias"])
def detect_anomalias(payload: AnomaliasPayload, token: str = Depends(jwt_required)):
    """Detecta anomalías en una entidad usando medidas actuales e históricas."""
    if anomalias_detector is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Modelo de anomalías no disponible: {detector_error}",
        )

    result = anomalias_detector.detect(payload.medidas)
    return AnomaliaResult(
        entidad=payload.entidad,
        fecha=payload.fecha,
        es_anomalia=result["es_anomalia"],
        puntuacion=result["puntuacion"],
        detalles=result["detalles"],
    )
