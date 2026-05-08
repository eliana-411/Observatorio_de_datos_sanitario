from fastapi import APIRouter, Depends, HTTPException, status
from api.schemas.demanda_schema import DemandaPayload, DemandaForecast
from api.middleware.auth import jwt_required
from prediction.demanda_predictor import DemandaPredictor

router = APIRouter()

try:
    demanda_predictor = DemandaPredictor()
except Exception as exc:
    demanda_predictor = None
    predictor_error = str(exc)

@router.post("/predict/demanda", response_model=DemandaForecast, tags=["demanda"])
def predict_demanda(payload: DemandaPayload, token: str = Depends(jwt_required)):
    """Genera un pronóstico de demanda hospitalaria para el servicio solicitado."""
    if demanda_predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Modelo de demanda no disponible: {predictor_error}",
        )

    output = demanda_predictor.forecast(
        servicio=payload.servicio,
        fecha_inicio=payload.fecha_inicio,
        horizonte=payload.horizonte,
        variables_externas=payload.variables_externas,
    )
    return DemandaForecast(**output)
