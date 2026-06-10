# AI/api/routes/demanda.py

import os
import json
import joblib
import pandas as pd
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from prediction.demanda_predictor import predecir_demanda

router = APIRouter(prefix="/api/v1/predict", tags=["Demanda"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RMSE = 5.47
CI_FACTOR = 1.96
MARGEN_CI = round(CI_FACTOR * RMSE)  # ±11


# ── Schemas ────────────────────────────────────────────────────────────────────

class DemandaMes(BaseModel):
    municipio:                   str
    anio:                        int
    mes:                         int
    hospitalizaciones_predichas: int
    intervalo_inferior:          int
    intervalo_superior:          int
    media_historica:             float
    umbral_alerta:               float
    nivel_alerta:                str
    variacion_pct:               float


class PerfilHistoricoDemanda(BaseModel):
    media_historica:              float
    std_historica:                float
    umbral_alerta:                float
    tasa_hospitalizacion_media:   float
    mes_critico:                  int
    tendencia_reciente:           str
    genero_predominante:          str
    grupo_etario_predominante:    str
    metodo_predominante:          str
    antecedentes_mental_promedio: float
    consumo_sustancias_promedio:  float


class DemandaPayload(BaseModel):
    municipio:        str = Field(..., example="Manizales")
    meses_a_predecir: int = Field(default=1, ge=1, le=12)

    class Config:
        json_schema_extra = {
            "example": {
                "municipio": "Manizales",
                "meses_a_predecir": 3,
            }
        }


class DemandaPrediction(BaseModel):
    status:           str
    municipio:        str
    predicciones:     List[DemandaMes]
    total_meses:      int
    perfil_historico: Optional[PerfilHistoricoDemanda] = None


class HistoricoMesDemanda(BaseModel):
    anio:              int
    mes:               int
    hospitalizaciones: float
    media_historica:   float
    umbral_alerta:     float


class Top5Municipio(BaseModel):
    posicion:                    int
    municipio:                   str
    hospitalizaciones_predichas: int
    nivel_alerta:                str
    media_historica:             float


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_municipios_disponibles() -> list[str]:
    enc_path = os.path.join(BASE_DIR, "models", "demanda", "mensual", "encoder_municipio_evento.pkl")
    encoder = joblib.load(enc_path)
    return sorted(encoder.classes_.tolist())


def _build_demanda_mes(r: dict) -> DemandaMes:
    pred   = r["hospitalizaciones_predichas"]
    media  = r["media_historica"]
    variacion = round((pred - media) / media * 100, 1) if media > 0 else 0.0
    return DemandaMes(
        municipio=r["municipio"],
        anio=r["anio"],
        mes=r["mes"],
        hospitalizaciones_predichas=pred,
        intervalo_inferior=max(0, pred - MARGEN_CI),
        intervalo_superior=pred + MARGEN_CI,
        media_historica=media,
        umbral_alerta=r["umbral_alerta"],
        nivel_alerta=r["nivel_alerta"],
        variacion_pct=variacion,
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/demanda", response_model=DemandaPrediction)
def predecir(payload: DemandaPayload):
    """
    Predice hospitalizaciones mensuales para un municipio.
    Devuelve N meses de forecast + perfil histórico del municipio.
    """
    try:
        hoy = datetime.now()
        resultado = predecir_demanda(
            municipio=payload.municipio,
            anio=hoy.year,
            mes=hoy.month,
            meses_a_predecir=payload.meses_a_predecir,
        )

        predicciones = [_build_demanda_mes(r) for r in resultado["predicciones"]]

        return DemandaPrediction(
            status="ok",
            municipio=payload.municipio,
            predicciones=predicciones,
            total_meses=len(predicciones),
            perfil_historico=resultado["perfil_historico"],
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.get("/demanda/municipios")
def get_municipios():
    """
    Lista todos los municipios disponibles en el modelo de demanda.
    """
    try:
        municipios = _get_municipios_disponibles()
        return {"status": "ok", "municipios": municipios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demanda/top5", response_model=List[Top5Municipio])
def get_top5():
    """
    Devuelve los 5 municipios con mayor demanda proyectada para el próximo mes,
    en cualquier nivel de alerta.
    """
    try:
        municipios = _get_municipios_disponibles()
        hoy = datetime.now()
        candidatos = []

        for municipio in municipios:
            try:
                resultado = predecir_demanda(
                    municipio=municipio,
                    anio=hoy.year,
                    mes=hoy.month,
                    meses_a_predecir=1,
                )
                candidatos.append(resultado["predicciones"][0])
            except Exception:
                continue

        candidatos.sort(key=lambda x: x["hospitalizaciones_predichas"], reverse=True)

        return [
            Top5Municipio(
                posicion=i + 1,
                municipio=r["municipio"],
                hospitalizaciones_predichas=r["hospitalizaciones_predichas"],
                nivel_alerta=r["nivel_alerta"],
                media_historica=r["media_historica"],
            )
            for i, r in enumerate(candidatos[:5])
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demanda/historico/{municipio}", response_model=List[HistoricoMesDemanda])
def get_historico(municipio: str):
    """
    Devuelve la serie histórica de hospitalizaciones de un municipio.
    Usada para la línea gris del gráfico de forecast.
    """
    try:
        csv_path = os.path.join(BASE_DIR, "data", "processed", "demanda_mensual_processed.csv")
        df = pd.read_csv(csv_path, parse_dates=["fecha"])

        df_m = df[df["municipio_evento"] == municipio].sort_values("fecha")
        if len(df_m) == 0:
            raise HTTPException(status_code=404, detail=f"Municipio '{municipio}' no encontrado")

        media  = float(df_m["hospitalizaciones"].mean())
        std    = float(df_m["hospitalizaciones"].std() or 0)
        umbral = media + std

        return [
            HistoricoMesDemanda(
                anio=int(row["fecha"].year),
                mes=int(row["fecha"].month),
                hospitalizaciones=float(row["hospitalizaciones"]),
                media_historica=round(media, 1),
                umbral_alerta=round(umbral, 1),
            )
            for _, row in df_m.iterrows()
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demanda/model-info")
def get_model_info():
    """
    Devuelve las métricas del modelo (R², RMSE, MAE, F1, precisión de brotes).
    """
    try:
        config_path = os.path.join(BASE_DIR, "models", "demanda", "mensual", "config.json")
        with open(config_path, "r") as f:
            config = json.load(f)
        return {"status": "ok", "model_info": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
