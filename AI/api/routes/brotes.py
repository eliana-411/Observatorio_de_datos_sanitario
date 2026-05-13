from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from AI.prediction.brotes_predictor import predecir_brotes

router = APIRouter(prefix="/api/v1/predict", tags=["Brotes"])

class BrotesMes(BaseModel):
    municipio:       str
    anio:            int
    mes:             int
    casos_predichos: int
    media_historica: float
    umbral_alerta:   float
    nivel_alerta:    str
class PerfilHistorico(BaseModel):
    zona_mayor_incidencia:                  str
    distribucion_por_zona:                  dict
    genero_predominante:                    str
    porcentaje_genero_predominante:         float
    grupo_etario_predominante:              str
    porcentaje_grupo_etario:                float
    metodo_predominante:                    str
    porcentaje_metodo:                      float
    situacion_sentimental_predominante:     str
    porcentaje_con_antecedentes_mentales:   float
    porcentaje_consumo_sustancias:          float
    edad_promedio:                          float
    estrato_promedio:                       float
    nivel_letalidad_predominante:           str
    tendencia_reciente:                     str

class BrotesPayload(BaseModel):
    municipio:          Optional[str] = Field(default=None, example="Manizales")
    meses_a_predecir:   int = Field(default=3, ge=1, le=12)
    variables_externas: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "municipio": "Manizales",
                "meses_a_predecir": 3
            }
        }

class BrotesPrediction(BaseModel):
    status:           str
    municipio:        str
    predicciones:     list[BrotesMes]
    total_meses:      int
    perfil_historico: Optional[PerfilHistorico] = None

# ── Histórico por municipio 
class HistoricoMes(BaseModel):
    anio:            int
    mes:             int
    casos:           float
    media_historica: float
    umbral_alerta:   float

# ── Importancia de variables 
class VariableImportancia(BaseModel):
    variable:    str
    importancia: float
    porcentaje:  float

# ── Variación vs mes anterior 
class VariacionMunicipio(BaseModel):
    municipio:          str
    casos_mes_actual:   float
    casos_mes_anterior: float
    variacion_pct:      float
    desviacion_pct:     float
    tendencia:          str

@router.post("/brotes", response_model=BrotesPrediction)
def predecir(payload: BrotesPayload):
    try:
        hoy = datetime.now()

        # Si no se pasa municipio, predecir todos
        if not payload.municipio:
            import pandas as pd
            import os
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
            df = pd.read_csv(processed_path)
            municipios = sorted(df["municipio_evento"].unique().tolist())

            todas_predicciones = []
            for municipio in municipios:
                try:
                    resultado = predecir_brotes(
                        municipio=municipio,
                        anio=hoy.year,
                        mes=hoy.month,
                        meses_a_predecir=payload.meses_a_predecir
                    )
                    todas_predicciones.extend(resultado["predicciones"])
                except Exception:
                    continue

            return BrotesPrediction(
                status="ok",
                municipio="Todos",
                predicciones=todas_predicciones,
                total_meses=len(todas_predicciones),
                perfil_historico=None
            )

        # Si se pasa municipio específico
        resultado = predecir_brotes(
            municipio=payload.municipio,
            anio=hoy.year,
            mes=hoy.month,
            meses_a_predecir=payload.meses_a_predecir,
            variables_externas=payload.variables_externas
        )

        return BrotesPrediction(
            status="ok",
            municipio=payload.municipio,
            predicciones=resultado["predicciones"],
            total_meses=len(resultado["predicciones"]),
            perfil_historico=resultado["perfil_historico"]
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
@router.get("/brotes/todos", response_model=list[BrotesMes])
def predecir_todos():
    """
    Predice el mes actual para todos los municipios.
    Usado para la matriz de monitoreo del dashboard.
    """
    try:
        import pandas as pd
        import os

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
        df = pd.read_csv(processed_path)
        municipios = df["municipio_evento"].unique().tolist()

        hoy = datetime.now()
        resultados = []

        for municipio in sorted(municipios):
            try:
                resultado = predecir_brotes(
                    municipio=municipio,
                    anio=hoy.year,
                    mes=hoy.month,
                    meses_a_predecir=1
                )
                resultados.append(resultado["predicciones"][0])
            except Exception:
                continue

        return resultados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/brotes/municipios")
def get_municipios():
    import pandas as pd
    import os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
    try:
        df = pd.read_csv(processed_path)
        municipios = df["municipio_evento"].unique().tolist()
        return {"status": "ok", "municipios": sorted(municipios)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/brotes/model-info")
def get_model_info():
    import json, os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    config_path = os.path.join(BASE_DIR, "models", "brotes", "config.json")
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        return {"status": "ok", "model_info": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/brotes/historico/{municipio}", response_model=list[HistoricoMes])
def get_historico(municipio: str):
    """
    Devuelve la serie temporal histórica de casos
    para un municipio — usado para el gráfico histórico vs predicción.
    """
    try:
        import pandas as pd
        import os
        import numpy as np

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
        df = pd.read_csv(processed_path)
        df["fecha"] = pd.to_datetime(df["fecha"])

        df_m = df[df["municipio_evento"] == municipio].copy()

        if len(df_m) == 0:
            raise HTTPException(status_code=404, detail=f"Municipio '{municipio}' no encontrado")

        # Agrupar por anio+mes sumando todas las zonas
        df_agg = (
            df_m.groupby(["anio", "mes"])["casos"]
            .sum()
            .reset_index()
            .sort_values(["anio", "mes"])
        )

        media_historica = float(df_agg["casos"].mean())
        std_historica   = float(df_agg["casos"].std())
        umbral_alerta   = media_historica + std_historica

        resultado = []
        for _, row in df_agg.iterrows():
            resultado.append(HistoricoMes(
                anio=int(row["anio"]),
                mes=int(row["mes"]),
                casos=float(row["casos"]),
                media_historica=round(media_historica, 1),
                umbral_alerta=round(umbral_alerta, 1)
            ))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/brotes/variables-importancia", response_model=list[VariableImportancia])
def get_variables_importancia():
    """
    Devuelve la importancia de cada variable del modelo
    ordenada de mayor a menor — usado para el gráfico de barras.
    """
    try:
        import joblib
        import os
        import json
        import numpy as np

        BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        MODEL_DIR   = os.path.join(BASE_DIR, "models", "brotes")
        model_path  = os.path.join(MODEL_DIR, "brotes_model.pkl")
        config_path = os.path.join(MODEL_DIR, "config.json")

        model  = joblib.load(model_path)
        with open(config_path, "r") as f:
            config = json.load(f)

        features     = config["features"]
        importancias = model.feature_importances_

        # Nombres más legibles para el dashboard
        nombres_legibles = {
            "zona_evento_enc":                        "Zona Geográfica",
            "consumo_sustancias_promedio":            "Consumo Sustancias",
            "antecedentes_mental_promedio":           "Historial Clínico",
            "estrato_promedio":                       "Factor Socioeconómico",
            "edad_promedio":                          "Edad Promedio",
            "municipio_evento_enc":                   "Municipio",
            "situacion_sentimental_predominante_enc": "Situación Sentimental",
            "mes":                                    "Mes del Año",
            "nombre_mes_enc":                         "Mes (Encoded)",
            "trimestre":                              "Trimestre",
            "lag_casos_1":                            "Casos Mes Anterior",
            "lag_casos_2":                            "Casos 2 Meses Atrás",
            "lag_casos_3":                            "Casos 3 Meses Atrás",
            "metodo_predominante_enc":                "Método Predominante",
            "nivel_letalidad_predominante_enc":       "Nivel Letalidad",
            "genero_predominante_enc":                "Género Predominante",
            "grupo_etario_predominante_enc":          "Grupo Etario",
            "tasa_mismo_municipio":                   "Tasa Mismo Municipio",
            "es_fin_anio":                            "Fin de Año",
            "es_inicio_anio":                         "Inicio de Año",
        }

        resultado = []
        for feature, importancia in zip(features, importancias):
            resultado.append({
                "variable":    nombres_legibles.get(feature, feature),
                "importancia": round(float(importancia), 4),
                "porcentaje":  round(float(importancia) * 100, 2)
            })

        # Ordenar de mayor a menor
        resultado = sorted(resultado, key=lambda x: x["importancia"], reverse=True)

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/brotes/variacion", response_model=list[VariacionMunicipio])
def get_variacion():
    """
    Devuelve la variación de casos vs mes anterior
    para todos los municipios — usado en la tabla del dashboard.
    """
    try:
        import pandas as pd
        import os

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
        df = pd.read_csv(processed_path)

        resultado = []
        for municipio in sorted(df["municipio_evento"].unique()):
            df_m = df[df["municipio_evento"] == municipio].copy()
            df_m = df_m.sort_values(["anio", "mes"])

            # Agrupar por mes
            df_agg = df_m.groupby(["anio", "mes"])["casos"].sum().reset_index()

            if len(df_agg) < 2:
                continue

            casos_actual   = float(df_agg.iloc[-1]["casos"])
            casos_anterior = float(df_agg.iloc[-2]["casos"])
            media          = float(df_agg["casos"].mean())

            # Variación vs mes anterior
            if casos_anterior > 0:
                variacion_pct = round((casos_actual - casos_anterior) / casos_anterior * 100, 1)
            else:
                variacion_pct = 0.0

            # Desviación vs media histórica
            if media > 0:
                desviacion_pct = round((casos_actual - media) / media * 100, 1)
            else:
                desviacion_pct = 0.0

            # Tendencia
            if variacion_pct > 5:
                tendencia = "Alza"
            elif variacion_pct < -5:
                tendencia = "Baja"
            else:
                tendencia = "Estable"

            resultado.append(VariacionMunicipio(
                municipio=municipio,
                casos_mes_actual=casos_actual,
                casos_mes_anterior=casos_anterior,
                variacion_pct=variacion_pct,
                desviacion_pct=desviacion_pct,
                tendencia=tendencia
            ))

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))