from pydantic import BaseModel, Field
from typing import Any, Dict, Optional, List
from datetime import datetime


class AnomaliasPayload(BaseModel):
    """Datos de un caso individual para evaluar si es anomalía."""

    # Datos demográficos
    edad: int = Field(..., ge=0, le=120, example=25)
    genero: str = Field(..., example="Masculino")
    estrato: int = Field(..., ge=1, le=6, example=3)
    estado_civil: str = Field(..., example="Soltero/A")
    situacion_sentimental: str = Field(..., example="Soltero/A Sin Pareja")

    # Datos geográficos
    municipio_origen: str = Field(..., example="Manizales")
    municipio_evento: str = Field(..., example="Chinchiná")
    zona_evento: str = Field(..., example="Urbana")

    # Datos clínicos
    metodo: str = Field(..., example="Ahorcamiento")
    nivel_letalidad: str = Field(..., example="Alto")
    hospitalizado: bool = Field(..., example=False)
    resultado_atencion: str = Field(..., example="Alta Médica")

    # Datos contextuales
    antecedentes_salud_mental: str = Field(..., example="Sin Antecedentes")
    consumo_sustancias: str = Field(..., example="Alcohol")
    tiene_antecedente: bool = Field(..., example=False)

    # Opcionales (para enriquecer)
    grupo_poblacional: Optional[str] = Field(None, example="Juventud (18-28)")
    cantidad_intentos: Optional[int] = Field(None, ge=1, example=1)

    class Config:
        json_schema_extra = {
            "example": {
                "edad": 22,
                "genero": "Masculino",
                "estrato": 3,
                "estado_civil": "Soltero/A",
                "situacion_sentimental": "Soltero/A Sin Pareja",
                "municipio_origen": "Manizales",
                "municipio_evento": "Villamaría",
                "zona_evento": "Urbana",
                "metodo": "Ahorcamiento",
                "nivel_letalidad": "Alto",
                "hospitalizado": False,
                "resultado_atencion": "Alta Médica",
                "antecedentes_salud_mental": "Sin Antecedentes",
                "consumo_sustancias": "No Consume",
                "tiene_antecedente": False
            }
        }


class AnomaliaDetalle(BaseModel):
    """Detalle de una anomalía detectada."""
    tipo_anomalia: str = Field(..., example="Primeriza + letalidad alta")
    descripcion: str = Field(...,
                             example="Primera vez con método de alta letalidad: Ahorcamiento")
    severidad: str = Field(..., example="Alta")
    categoria: str = Field(..., example="Riesgo individual")


class AnomaliaResult(BaseModel):
    """Resultado de la predicción de anomalías."""
    status: str = Field(default="ok", example="ok")
    es_anomalia: bool = Field(..., example=True)
    puntuacion: Optional[float] = Field(None, example=-0.045)  # ← Opcional
    threshold: Optional[float] = Field(
        None, example=-0.01)   # ← Opcional también
    detalle: Optional[AnomaliaDetalle] = Field(
        None, description="Solo si es anomalía")
    mensaje: str = Field(..., example="Anomalía detectada")


class AnomaliaListada(BaseModel):
    """Una anomalía en la lista de resultados."""
    id_registro: int
    fecha: str
    municipio_evento: str
    tipo_anomalia: str
    descripcion_anomalia: str
    severidad: str
    categoria: str
    anomaly_score: float
    edad: int
    genero: str
    metodo: str


class AnomaliasListResponse(BaseModel):
    """Respuesta del listado de anomalías."""
    status: str
    total: int
    pagina: int
    anomalias: List[AnomaliaListada]


class AnomaliaDetalleResponse(BaseModel):
    """Respuesta del detalle de una anomalía con datos filtrados."""
    status: str
    id_registro: int
    tipo_anomalia: str
    descripcion: str
    severidad: str
    categoria: str
    anomaly_score: float
    datos_completos: Dict[str, Any]
