from fastapi import APIRouter, Depends, HTTPException, status
from api.schemas.brotes_schema import BrotesPayload, BrotesPrediction
from api.middleware.auth import jwt_required
from prediction.brotes_predictor import BrotesPredictor

router = APIRouter()

try:
    brotes_predictor = BrotesPredictor()
except Exception as exc:
    brotes_predictor = None
    predictor_error = str(exc)

@router.post("/predict/brotes", response_model=BrotesPrediction, tags=["brotes"])
def predict_brotes(payload: BrotesPayload, token: str = Depends(jwt_required)):
    """Predice la evolución de casos de brotes para un municipio y periodo dado."""
    if brotes_predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Modelo de brotes no disponible: {predictor_error}",
        )

    output = brotes_predictor.predict(
        municipio=payload.municipio,
        fecha_inicio=payload.fecha_inicio,
        dias_a_predecir=payload.dias_a_predecir,
        variables_externas=payload.variables_externas,
    )
    return BrotesPrediction(**output)
