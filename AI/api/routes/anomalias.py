from fastapi import APIRouter, Depends, HTTPException, Query, status
import numpy as np
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import pandas as pd
from pathlib import Path
import os
import json

from prediction.anomalia_detector import AnomaliaDetector
from api.schemas.anomalias_schema import (
    AnomaliasPayload,
    AnomaliaResult,
    AnomaliaDetalle,
    AnomaliaListada,
    AnomaliasListResponse,
    AnomaliaDetalleResponse
)


router = APIRouter(prefix="/api/v1/detect", tags=["Anomalias"])

_detector_error: str = ""
try:
    detector = AnomaliaDetector()
except Exception as _exc:
    detector = None
    _detector_error = str(_exc)


# ============ POST - PREDICCIÓN INDIVIDUAL ============
@router.post("/anomalias", response_model=AnomaliaResult, status_code=status.HTTP_200_OK)
def detectar_anomalia(payload: AnomaliasPayload):
    """
    Evalúa si un caso individual es una anomalía.
    Recibe los datos originales del caso y devuelve si es anomalía + tipo.
    """
    try:
        medidas = payload.model_dump()
        resultado = detector.detect(medidas)

        return AnomaliaResult(
            status="ok",
            es_anomalia=resultado["es_anomalia"],
            puntuacion=resultado["puntuacion"],
            threshold=resultado["threshold"],
            detalle=AnomaliaDetalle(
                **resultado["detalle"]) if resultado["detalle"] else None,
            mensaje=resultado["mensaje"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error en detección: {str(e)}")


# ============ RUTAS ESTÁTICAS PRIMERO (sin parámetros de path) ============

@router.get("/anomalias/tipos/distribucion")
def distribucion_tipos():
    """
    Devuelve la distribución de anomalías por tipo.
    Usado para el gráfico de torta del dashboard.
    """
    try:
        BASE_DIR = Path(__file__).parent.parent.parent
        metrics_path = BASE_DIR / "data" / "metrics" / \
            "anomalies_clasificacion_latest.json"

        with open(metrics_path, "r") as f:
            metrics = json.load(f)

        return {
            "status": "ok",
            "total_anomalias": metrics.get("total", 0),
            "distribucion": metrics.get("por_tipo", {}),
            "por_severidad": metrics.get("por_severidad", {})
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anomalias/model/info")
def get_model_info():
    try:
        BASE_DIR = Path(__file__).parent.parent.parent
        config_path = BASE_DIR / "models" / "anomalias" / "config.json"

        with open(config_path, "r") as f:
            config = json.load(f)

        reliability = config.get("reliability", {})
        cv = config.get("cross_validation", {})
        test = config.get("test_evaluation", {})

        return {
            "status": "ok",
            "model_info": {
                "tipo": config.get("model_type", "IsolationForest"),
                "version": config.get("version", "2.1"),
                "entrenado": config.get("trained_at", ""),
                "contamination": config.get("isolation_forest_params", {}).get("contamination"),
                "n_estimators": config.get("isolation_forest_params", {}).get("n_estimators"),
                "n_features": config.get("n_features", 0),
                "total_anomalias": config.get("metrics", {}).get("n_anomalies", 0),
                "pct_anomalias": config.get("metrics", {}).get("pct_anomalies", 0),
            },
            "performance": {
                "threshold": config.get("metrics", {}).get("threshold"),
                "score_min": config.get("metrics", {}).get("score_min"),
                "score_max": config.get("metrics", {}).get("score_max"),
                "score_mean": config.get("metrics", {}).get("score_mean"),
            },
            "confiabilidad": {
                "reliability_score": reliability.get("reliability"),
                "reliability_pct": reliability.get("reliability_pct"),
                "separability": reliability.get("separability"),
                "stability_cv": reliability.get("stability"),
                "coverage": reliability.get("coverage"),
                "mean_normal_score": reliability.get("mean_normal_score"),
                "mean_anomaly_score": reliability.get("mean_anomaly_score"),
            },
            "validacion_cruzada": {
                "folds": cv.get("folds", []),
                "stability": cv.get("stability"),
                "mean_pct_anomalies": cv.get("mean_pct_anomalies"),
                "std_pct_anomalies": cv.get("std_pct_anomalies"),
            },
            "test": {
                "n_test": test.get("n_test"),
                "n_anomalies": test.get("n_anomalies"),
                "pct_anomalies": test.get("pct_anomalies"),
                "mean_normal_score": test.get("mean_normal_score"),
                "mean_anomaly_score": test.get("mean_anomaly_score"),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ RUTA BASE (lista con filtros) ============

@router.get("/anomalias", response_model=AnomaliasListResponse, status_code=status.HTTP_200_OK)
def listar_anomalias(
    tipo: Optional[str] = Query(
        None, description="Filtrar por tipo de anomalía"),
    severidad: Optional[str] = Query(None, description="Alta, Media"),
    categoria: Optional[str] = Query(None, description="Categoría"),
    limite: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    Devuelve las anomalías detectadas en el último entrenamiento.
    Permite filtrar por tipo, severidad, etc.
    """
    try:
        BASE_DIR = Path(__file__).parent.parent.parent
        results_dir = BASE_DIR / "data" / "results"

        archivos = sorted(results_dir.glob("anomalies_clasificadas_*.csv"))
        if not archivos:
            raise HTTPException(
                status_code=404, detail="No hay anomalías clasificadas")

        ultimo_csv = archivos[-1]
        df = pd.read_csv(ultimo_csv)

        if tipo:
            df = df[df['tipo_anomalia'] == tipo]
        if severidad:
            df = df[df['severidad'] == severidad]
        if categoria:
            df = df[df['categoria'] == categoria]

        total = len(df)
        df = df.iloc[offset:offset + limite]

        anomalias = []
        for _, row in df.iterrows():
            anomalias.append(AnomaliaListada(
                id_registro=int(row.get('id_registro', 0)),
                fecha=str(row.get('fecha', '')),
                municipio_evento=str(row.get('municipio_evento', '')),
                tipo_anomalia=str(row.get('tipo_anomalia', '')),
                descripcion_anomalia=str(row.get('descripcion_anomalia', '')),
                severidad=str(row.get('severidad', '')),
                categoria=str(row.get('categoria', '')),
                anomaly_score=float(row.get('anomaly_score', 0)),
                edad=int(row.get('edad', 0)),
                genero=str(row.get('genero', '')),
                metodo=str(row.get('metodo', ''))
            ))

        return AnomaliasListResponse(
            status="ok",
            total=total,
            pagina=(offset // limite) + 1,
            anomalias=anomalias
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ RUTA DINÁMICA AL FINAL (con parámetro de path) ============

@router.get("/anomalias/{id_registro}", response_model=AnomaliaDetalleResponse)
def detalle_anomalia(id_registro: int):
    """
    Devuelve el detalle completo de una anomalía específica.
    """
    try:
        BASE_DIR = Path(__file__).parent.parent.parent
        results_dir = BASE_DIR / "data" / "results"

        archivos = sorted(results_dir.glob("anomalies_clasificadas_*.csv"))
        if not archivos:
            raise HTTPException(status_code=404, detail="No hay anomalías clasificadas")

        ultimo_csv = archivos[-1]
        df = pd.read_csv(ultimo_csv)

        caso = df[df['id_registro'] == id_registro]
        if caso.empty:
            raise HTTPException(status_code=404, detail=f"Anomalía {id_registro} no encontrada")

        row = caso.iloc[0]

        # Campos originales relevantes (no one-hot)
        campos_originales = [
            'id_registro', 'anio', 'mes', 'trimestre', 'edad', 'estrato',
            'genero', 'metodo', 'nivel_letalidad', 'hospitalizado',
            'municipio_origen', 'municipio_evento', 'zona_evento',
            'estado_civil', 'situacion_sentimental',
            'antecedentes_salud_mental', 'consumo_sustancias',
            'tiene_antecedente', 'mismo_municipio', 'cantidad_intentos',
            'fecha', 'grupo_poblacional', 'requirio_hospitalizacion',
            'resultado_atencion', 'consume_sustancias_flag'
        ]
        
        # Datos completos filtrados (solo campos que existen en el CSV)
        datos_completos = {}
        for campo in campos_originales:
            if campo in row.index:
                val = row[campo]
                # Convertir tipos para JSON
                if pd.isna(val):
                    datos_completos[campo] = None
                elif isinstance(val, (np.int64, np.int32)):
                    datos_completos[campo] = int(val)
                elif isinstance(val, (np.float64, np.float32)):
                    datos_completos[campo] = float(val)
                elif isinstance(val, bool):
                    datos_completos[campo] = bool(val)
                else:
                    datos_completos[campo] = str(val)

        return AnomaliaDetalleResponse(
            status="ok",
            id_registro=id_registro,
            tipo_anomalia=str(row.get('tipo_anomalia', '')),
            descripcion=str(row.get('descripcion_anomalia', '')),
            severidad=str(row.get('severidad', '')),
            categoria=str(row.get('categoria', '')),
            anomaly_score=float(row.get('anomaly_score', 0)),
            datos_completos=datos_completos
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))