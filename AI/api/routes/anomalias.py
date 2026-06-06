from fastapi import APIRouter, Depends, HTTPException, status
from api.schemas.anomalias_schema import AnomaliasPayload, AnomaliaResult
from api.middleware.auth import jwt_required
from prediction.anomalia_detector import AnomaliaDetector
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/detect", tags=["Anomalias"])


class IncrementoMunicipio(BaseModel):
    municipio: str
    promedio_historico: float
    intentos_actuales: int
    incremento_porcentaje: float
    nivel_alerta: str


class IncrementosMunicipioResponse(BaseModel):
    total_municipios: int
    municipios_con_anomalia: int
    series: list[IncrementoMunicipio]

@router.get("/incremento_municipio", response_model=IncrementosMunicipioResponse)
def detectar_incremento_municipio(
    user=Depends(jwt_required)
):
    try:
        detector = AnomaliaDetector()
        resultados = detector.detectar_incremento_municipio()
        return IncrementosMunicipioResponse(
            total_municipios=resultados["total_municipios"],
            municipios_con_anomalia=resultados["municipios_con_anomalia"],
            series=[
                IncrementoMunicipio(
                    municipio=serie["municipio"],
                    promedio_historico=serie["promedio_historico"],
                    intentos_actuales=serie["intentos_actuales"],
                    incremento_porcentaje=serie["incremento_porcentaje"],
                    nivel_alerta=serie["nivel_alerta"]
                ) for serie in resultados["series"]
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))