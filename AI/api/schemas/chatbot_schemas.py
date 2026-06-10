# AI/api/schemas/chatbot_schemas.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MensajeHistorial(BaseModel):
    rol: str = Field(..., description="'usuario' o 'asistente'")
    contenido: str


class ConsultaRequest(BaseModel):
    pregunta: str = Field(..., min_length=3, max_length=1000)
    historial: list[MensajeHistorial] = Field(
        default=[],
        description="Últimos turnos de la conversación (máx 10)"
    )


class ConsultaResponse(BaseModel):
    id_consulta: str
    respuesta: str
    fuentes: list[str]
    mensaje_crisis: bool = False
    fecha: datetime = Field(default_factory=datetime.now)


class FeedbackRequest(BaseModel):
    id_consulta: str
    util: bool
    comentario: Optional[str] = None


class FeedbackResponse(BaseModel):
    mensaje: str
    id_consulta: str


class ResumenEjecutivoRequest(BaseModel):
    municipio: str
    periodo: str = Field(..., description="Ej: '2024-Q4' o '2025-01'")
    nivel_alerta: Optional[str] = None
    casos_predichos: Optional[int] = None
    variacion_porcentual: Optional[float] = None


class ResumenEjecutivoResponse(BaseModel):
    municipio: str
    periodo: str
    resumen: str
    fecha: datetime = Field(default_factory=datetime.now)