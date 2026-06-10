# AI/api/routes/brotes.py

import os
import json
import pandas as pd
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from prediction.brotes_predictor import predecir_brotes

router = APIRouter(prefix="/api/v1/predict", tags=["Brotes"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_PATH = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")


# ── Schemas ────────────────────────────────────────────────────────────────────

class BrotesMes(BaseModel):
    municipio:          str
    anio:               int
    mes:                int
    casos_predichos:    int
    intervalo_inferior: int
    intervalo_superior: int
    media_historica:    float
    umbral_alerta:      float
    nivel_alerta:       str
    variacion_vs_media: float  # % desviación predicho vs media histórica


class PerfilHistoricoBrotes(BaseModel):
    total_eventos_promedio_mensual: float
    std_mensual:                    float
    pct_femenino_promedio:          float
    pct_adolescente_promedio:       float
    pct_sin_pareja_promedio:        float
    pct_intoxicacion_promedio:      float
    pct_antecedente_sm_promedio:    float
    pct_sustancias_promedio:        float
    edad_promedio:                  float
    estrato_promedio:               float
    tendencia_reciente:             str
    meses_con_datos:                int
    rango_fechas:                   dict


class BrotesPayload(BaseModel):
    municipio:        str = Field(..., example="Manizales")
    meses_a_predecir: int = Field(default=1, ge=1, le=12)

    class Config:
        json_schema_extra = {
            "example": {"municipio": "Manizales", "meses_a_predecir": 3}
        }


class BrotesPrediction(BaseModel):
    status:              str
    municipio:           str
    predicciones:        List[BrotesMes]
    total_meses:         int
    variacion_vs_mes_anterior: Optional[float] = None  # % vs último mes real conocido
    perfil_historico:    Optional[PerfilHistoricoBrotes] = None


class HistoricoMes(BaseModel):
    anio:            int
    mes:             int
    casos:           float
    media_historica: float
    umbral_alerta:   float


class VariableImportancia(BaseModel):
    variable:    str
    importancia: float
    porcentaje:  float


class MatrizMunicipio(BaseModel):
    municipio:       str
    tendencia:       str
    casos_predichos: int
    desviacion_pct:  float
    nivel_alerta:    str
    media_historica: float
    umbral_alerta:   float


class AlertaCriticaItem(BaseModel):
    municipio:       str
    casos_predichos: int
    nivel_alerta:    str


class AlertasCriticas(BaseModel):
    total_en_alerta:      int
    nivel_maximo:         str
    municipios:           List[AlertaCriticaItem]
    ultima_actualizacion: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_municipios_disponibles() -> list[str]:
    df = pd.read_csv(PROCESSED_PATH)
    return sorted(df["municipio"].unique().tolist())


def _enrich_mes(r: dict) -> BrotesMes:
    media = r["media_historica"]
    pred  = r["casos_predichos"]
    variacion = round((pred - media) / media * 100, 1) if media > 0 else 0.0
    return BrotesMes(
        municipio=r["municipio"],
        anio=r["anio"],
        mes=r["mes"],
        casos_predichos=pred,
        intervalo_inferior=r["intervalo_inferior"],
        intervalo_superior=r["intervalo_superior"],
        media_historica=media,
        umbral_alerta=r["umbral_alerta"],
        nivel_alerta=r["nivel_alerta"],
        variacion_vs_media=variacion,
    )


def _variacion_vs_mes_anterior(municipio: str, casos_predichos: int) -> float:
    """Compara la predicción contra el último mes real registrado en el CSV."""
    try:
        df = pd.read_csv(PROCESSED_PATH)
        df_m = df[df["municipio"] == municipio].sort_values(["anio", "mes"])
        ultimo = float(df_m["total_eventos"].iloc[-1])
        if ultimo > 0:
            return round((casos_predichos - ultimo) / ultimo * 100, 1)
    except Exception:
        pass
    return 0.0


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/brotes", response_model=BrotesPrediction)
def predecir(payload: BrotesPayload):
    """
    Predice eventos de autolesión para un municipio en los próximos N meses.
    Incluye perfil histórico y variación vs último mes real.
    """
    try:
        hoy = datetime.now()
        resultado = predecir_brotes(
            municipio=payload.municipio,
            anio=hoy.year,
            mes=hoy.month,
            meses_a_predecir=payload.meses_a_predecir,
        )

        predicciones = [_enrich_mes(r) for r in resultado["predicciones"]]
        variacion = _variacion_vs_mes_anterior(
            payload.municipio, predicciones[0].casos_predichos
        )

        return BrotesPrediction(
            status="ok",
            municipio=payload.municipio,
            predicciones=predicciones,
            total_meses=len(predicciones),
            variacion_vs_mes_anterior=variacion,
            perfil_historico=resultado["perfil_historico"],
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.get("/brotes/municipios")
def get_municipios():
    """Lista todos los municipios disponibles."""
    try:
        return {"status": "ok", "municipios": _get_municipios_disponibles()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/todos", response_model=List[BrotesMes])
def predecir_todos():
    """
    Predice el próximo mes para todos los municipios.
    Usado para el mapa de riesgo regional y el banner de alertas.
    """
    try:
        municipios = _get_municipios_disponibles()
        hoy = datetime.now()
        resultados = []

        for municipio in municipios:
            try:
                resultado = predecir_brotes(
                    municipio=municipio,
                    anio=hoy.year,
                    mes=hoy.month,
                    meses_a_predecir=1,
                )
                resultados.append(_enrich_mes(resultado["predicciones"][0]))
            except Exception:
                continue

        return resultados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/alertas-criticas", response_model=AlertasCriticas)
def get_alertas_criticas():
    """
    Devuelve el conteo y lista de municipios en alerta ALTO o CRÍTICO.
    Usado para el banner superior del dashboard.
    """
    try:
        municipios = _get_municipios_disponibles()
        hoy = datetime.now()
        en_alerta = []
        nivel_maximo = "NORMAL"
        orden = {"CRÍTICO": 3, "ALTO": 2, "MODERADO": 1, "NORMAL": 0}

        for municipio in municipios:
            try:
                resultado = predecir_brotes(
                    municipio=municipio,
                    anio=hoy.year,
                    mes=hoy.month,
                    meses_a_predecir=1,
                )
                r = resultado["predicciones"][0]
                if r["nivel_alerta"] in ("ALTO", "CRÍTICO"):
                    en_alerta.append(AlertaCriticaItem(
                        municipio=municipio,
                        casos_predichos=r["casos_predichos"],
                        nivel_alerta=r["nivel_alerta"],
                    ))
                    if orden.get(r["nivel_alerta"], 0) > orden.get(nivel_maximo, 0):
                        nivel_maximo = r["nivel_alerta"]
            except Exception:
                continue

        en_alerta.sort(key=lambda x: x.casos_predichos, reverse=True)

        return AlertasCriticas(
            total_en_alerta=len(en_alerta),
            nivel_maximo=nivel_maximo,
            municipios=en_alerta,
            ultima_actualizacion=hoy.strftime("%Y-%m-%d %H:%M"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/matriz", response_model=List[MatrizMunicipio])
def get_matriz():
    """
    Devuelve la tabla de monitoreo por municipio con predicciones reales del modelo.
    Columnas: municipio, tendencia, casos_predichos, desviacion_pct, nivel_alerta.
    """
    try:
        municipios = _get_municipios_disponibles()
        hoy = datetime.now()
        resultados = []

        for municipio in municipios:
            try:
                resultado = predecir_brotes(
                    municipio=municipio,
                    anio=hoy.year,
                    mes=hoy.month,
                    meses_a_predecir=1,
                )
                r    = resultado["predicciones"][0]
                perf = resultado["perfil_historico"]
                media = r["media_historica"]
                pred  = r["casos_predichos"]
                desviacion = round((pred - media) / media * 100, 1) if media > 0 else 0.0

                resultados.append(MatrizMunicipio(
                    municipio=municipio,
                    tendencia=perf["tendencia_reciente"],
                    casos_predichos=pred,
                    desviacion_pct=desviacion,
                    nivel_alerta=r["nivel_alerta"],
                    media_historica=media,
                    umbral_alerta=r["umbral_alerta"],
                ))
            except Exception:
                continue

        resultados.sort(key=lambda x: x.casos_predichos, reverse=True)
        return resultados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/historico/{municipio}", response_model=List[HistoricoMes])
def get_historico(municipio: str):
    """
    Devuelve la serie histórica de eventos para un municipio.
    Usada para la gráfica histórico vs predicción.
    """
    try:
        df = pd.read_csv(PROCESSED_PATH, parse_dates=["ds"])
        df_m = df[df["municipio"] == municipio].sort_values(["anio", "mes"])

        if len(df_m) == 0:
            raise HTTPException(status_code=404, detail=f"Municipio '{municipio}' no encontrado")

        df_agg = (
            df_m.groupby(["anio", "mes"])["total_eventos"]
            .sum()
            .reset_index()
        )

        media  = float(df_agg["total_eventos"].mean())
        std    = float(df_agg["total_eventos"].std() or 0)
        umbral = media + std

        return [
            HistoricoMes(
                anio=int(row["anio"]),
                mes=int(row["mes"]),
                casos=float(row["total_eventos"]),
                media_historica=round(media, 1),
                umbral_alerta=round(umbral, 1),
            )
            for _, row in df_agg.iterrows()
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/model-info")
def get_model_info():
    """Devuelve las métricas del modelo Prophet (RMSE, MAE, R²)."""
    try:
        config_path = os.path.join(BASE_DIR, "models", "brotes", "config.json")
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        return {"status": "ok", "model_info": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/variables-importancia", response_model=List[VariableImportancia])
def get_variables_importancia():
    """
    Devuelve la importancia de variables del modelo ordenada de mayor a menor.
    Usada para el panel 'Variables de Impacto'.
    """
    try:
        config_path = os.path.join(BASE_DIR, "models", "brotes", "config.json")
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        importancia = config.get("feature_importance", [])
        if not importancia:
            raise HTTPException(status_code=404, detail="No hay datos de importancia en el config del modelo.")

        return importancia

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
