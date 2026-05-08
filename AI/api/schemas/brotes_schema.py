from pydantic import BaseModel, Field
from typing import List, Optional

class BrotesPayload(BaseModel):
    municipio: str = Field(..., example="Bogotá")
    fecha_inicio: str = Field(..., example="2026-05-08")
    dias_a_predecir: int = Field(..., ge=1, le=30, example=14)
    variables_externas: Optional[dict] = Field(None, description="Datos adicionales opcionales para la predicción")

class BrotesPrediction(BaseModel):
    municipio: str
    fechas: List[str]
    casos_estimados: List[float]
    modelo: str
    version: str
