from pydantic import BaseModel, Field
from typing import Optional

class AnomaliasPayload(BaseModel):
    entidad: str = Field(..., example="Hospital A")
    fecha: str = Field(..., example="2026-05-08")
    medidas: dict = Field(..., description="Valores históricos o actuales a evaluar")

class AnomaliaResult(BaseModel):
    entidad: str
    fecha: str
    es_anomalia: bool
    puntuacion: float
    detalles: Optional[dict] = None
