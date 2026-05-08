from pydantic import BaseModel, Field
from typing import List, Optional

class DemandaPayload(BaseModel):
    servicio: str = Field(..., example="UCI")
    fecha_inicio: str = Field(..., example="2026-05-08")
    horizonte: int = Field(..., ge=1, le=30, example=7)
    variables_externas: Optional[dict] = Field(None, description="Factores de demanda como clima o vacaciones")

class DemandaForecast(BaseModel):
    servicio: str
    fechas: List[str]
    demanda_estimadas: List[float]
    modelo: str
    version: str
