# AI/prediction/brotes_predictor.py

import os
import joblib
import mlflow.prophet
import pandas as pd
import numpy as np
from datetime import datetime

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR      = os.path.join(BASE_DIR, "models", "brotes")
SCALER_PATH    = os.path.join(MODEL_DIR, "scaler_regressors.pkl")
PROCESSED_PATH = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
FORECASTS_DIR  = os.path.join(MODEL_DIR, "forecasts")

REGRESSORS = [
    "pct_fin_semana",
    "pct_zona_rural",
    "pct_fuera_municipio",
    "edad_promedio",
    "estrato_promedio",
    "pct_femenino",
    "pct_adolescente",
    "pct_sin_pareja",
    "pct_relacion_conflictiva",
    "pct_intoxicacion",
    "pct_letalidad_alta",
    "pct_hospitalizado",
    "pct_requirio_hospitalizacion",
    "pct_en_tratamiento",
    "pct_derivacion",
    "pct_antecedente_sm",
    "pct_sustancias",
]

# ── Carga de artefactos ───────────────────────────────────────────────────────

def load_scaler():
    return joblib.load(SCALER_PATH)


def load_model_for_municipio(municipio: str):
    """
    Carga el modelo Prophet desde el forecast CSV pre-generado
    o desde MLflow si está disponible.
    Prioriza el CSV de forecast (más rápido para inferencia).
    """
    forecast_path = os.path.join(
        FORECASTS_DIR,
        f"forecast_{municipio.replace(' ', '_').lower()}.csv"
    )
    if os.path.exists(forecast_path):
        return pd.read_csv(forecast_path, parse_dates=["ds"])
    return None


def load_processed() -> pd.DataFrame:
    df = pd.read_csv(PROCESSED_PATH, parse_dates=["ds"])
    return df


# ── Contexto histórico del municipio ─────────────────────────────────────────

def get_municipio_context(df: pd.DataFrame, municipio: str) -> dict:
    """
    Obtiene los últimos valores conocidos de los regressores
    para usarlos como base en la predicción futura.
    """
    df_m = df[df["municipio"] == municipio].sort_values("ds")

    if len(df_m) == 0:
        raise ValueError(f"No hay datos históricos para '{municipio}'")

    ultimo = df_m.iloc[-1]
    return {reg: float(ultimo[reg]) for reg in REGRESSORS}


# ── Perfil histórico del municipio ────────────────────────────────────────────

def get_perfil_historico(df: pd.DataFrame, municipio: str) -> dict:
    df_m = df[df["municipio"] == municipio].sort_values("ds")

    if len(df_m) == 0:
        raise ValueError(f"No hay datos históricos para '{municipio}'")

    # Tendencia últimos 3 meses
    df_reciente = df_m.tail(3)
    tendencia = "estable"
    if len(df_reciente) >= 2:
        diff  = df_reciente["total_eventos"].iloc[-1] - df_reciente["total_eventos"].iloc[0]
        media = df_reciente["total_eventos"].mean()
        if media > 0:
            if diff > media * 0.10:
                tendencia = "al alza"
            elif diff < -media * 0.10:
                tendencia = "a la baja"

    total_eventos_hist = float(df_m["total_eventos"].mean())
    std_hist           = float(df_m["total_eventos"].std())

    # Revertir MinMaxScaler en los regressores para obtener valores interpretables
    scaler = load_scaler()
    medias_escaladas = df_m[REGRESSORS].mean().values.reshape(1, -1)
    medias_originales = scaler.inverse_transform(medias_escaladas)[0]
    orig = dict(zip(REGRESSORS, medias_originales))

    return {
        "total_eventos_promedio_mensual": round(total_eventos_hist, 1),
        "std_mensual":                    round(std_hist, 1),
        "pct_femenino_promedio":          round(orig["pct_femenino"], 1),
        "pct_adolescente_promedio":       round(orig["pct_adolescente"], 1),
        "pct_sin_pareja_promedio":        round(orig["pct_sin_pareja"], 1),
        "pct_intoxicacion_promedio":      round(orig["pct_intoxicacion"], 1),
        "pct_antecedente_sm_promedio":    round(orig["pct_antecedente_sm"], 1),
        "pct_sustancias_promedio":        round(orig["pct_sustancias"], 1),
        "edad_promedio":                  round(orig["edad_promedio"], 1),
        "estrato_promedio":               round(orig["estrato_promedio"], 1),
        "tendencia_reciente":             tendencia,
        "meses_con_datos":                len(df_m),
        "rango_fechas": {
            "desde": df_m["ds"].min().strftime("%Y-%m"),
            "hasta": df_m["ds"].max().strftime("%Y-%m"),
        }
    }


# ── Predicción desde forecast pre-generado ────────────────────────────────────

def predecir_desde_forecast(
    forecast_df: pd.DataFrame,
    anio: int,
    mes: int,
    meses_a_predecir: int,
    media_historica: float,
    std_historica: float,
) -> list:
    """
    Extrae predicciones del CSV de forecast pre-generado por el entrenamiento.
    """
    resultados = []
    umbral_alerta = media_historica + std_historica

    for i in range(meses_a_predecir):
        mes_pred  = (mes + i - 1) % 12 + 1
        anio_pred = anio + (mes + i - 1) // 12
        ds_target = pd.Timestamp(f"{anio_pred}-{mes_pred:02d}-01")

        fila = forecast_df[forecast_df["ds"] == ds_target]

        if fila.empty:
            # Fecha fuera del horizonte pre-generado — usar último valor
            fila = forecast_df.tail(1)

        casos_pred  = max(0, round(float(fila["yhat"].iloc[0])))
        casos_lower = max(0, round(float(fila["yhat_lower"].iloc[0])))
        casos_upper = max(0, round(float(fila["yhat_upper"].iloc[0])))

        # Nivel de alerta
        if casos_pred >= umbral_alerta * 1.5:
            nivel_alerta = "CRÍTICO"
        elif casos_pred >= umbral_alerta:
            nivel_alerta = "ALTO"
        elif casos_pred >= media_historica:
            nivel_alerta = "MODERADO"
        else:
            nivel_alerta = "NORMAL"

        resultados.append({
            "municipio":       None,   # se rellena afuera
            "anio":            anio_pred,
            "mes":             mes_pred,
            "casos_predichos": casos_pred,
            "intervalo_inferior": casos_lower,
            "intervalo_superior": casos_upper,
            "media_historica": round(media_historica, 1),
            "umbral_alerta":   round(umbral_alerta, 1),
            "nivel_alerta":    nivel_alerta,
        })

    return resultados


# ── Predicción principal ──────────────────────────────────────────────────────

def predecir_brotes(
    municipio: str,
    anio: int,
    mes: int,
    meses_a_predecir: int = 1,
) -> dict:
    """
    Predice el número de eventos de autolesión para un municipio
    en los próximos N meses.

    Parámetros:
        municipio         : nombre del municipio (ej. 'Manizales')
        anio              : año de inicio de la predicción
        mes               : mes de inicio (1-12)
        meses_a_predecir  : cuántos meses hacia adelante predecir

    Retorna:
        dict con 'predicciones' y 'perfil_historico'
    """
    df_processed = load_processed()

    # Validar municipio
    municipios_disponibles = df_processed["municipio"].unique().tolist()
    if municipio not in municipios_disponibles:
        raise ValueError(
            f"Municipio '{municipio}' no encontrado. "
            f"Disponibles: {sorted(municipios_disponibles)}"
        )

    df_m = df_processed[df_processed["municipio"] == municipio]
    media_historica = float(df_m["total_eventos"].mean())
    std_historica   = float(df_m["total_eventos"].std())

    # Intentar usar forecast pre-generado
    forecast_df = load_model_for_municipio(municipio)

    if forecast_df is not None:
        resultados = predecir_desde_forecast(
            forecast_df, anio, mes, meses_a_predecir,
            media_historica, std_historica
        )
    else:
        raise FileNotFoundError(
            f"No se encontró forecast pre-generado para '{municipio}'. "
            f"Ejecuta 03_train_brotes.py primero."
        )

    # Agregar municipio a cada resultado
    for r in resultados:
        r["municipio"] = municipio

    perfil = get_perfil_historico(df_processed, municipio)

    return {
        "predicciones":     resultados,
        "perfil_historico": perfil,
    }


# ── Test rápido ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    resultado = predecir_brotes(
        municipio="Manizales",
        anio=2026,
        mes=1,
        meses_a_predecir=3,
    )

    print(json.dumps(resultado, indent=2, ensure_ascii=False, default=str))