# AI/prediction/demanda_predictor.py

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "demanda", "mensual")

# ── Carga de artefactos ───────────────────────────────────────────────────────
def load_artifacts():
    model  = joblib.load(os.path.join(MODEL_DIR, "demanda_mensual_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    with open(os.path.join(MODEL_DIR, "config.json"), "r") as f:
        config = json.load(f)

    encoders = {}
    for col in [
        "municipio_evento", "zona_predominante", "metodo_predominante",
        "nivel_letalidad_predominante", "genero_predominante",
        "grupo_etario_predominante"
    ]:
        path = os.path.join(MODEL_DIR, f"encoder_{col}.pkl")
        if os.path.exists(path):
            encoders[col] = joblib.load(path)

    return model, scaler, config, encoders


# ── Contexto histórico del municipio ─────────────────────────────────────────
def get_municipio_context(df: pd.DataFrame, municipio: str) -> dict:
    df_m = df[df["municipio_evento"] == municipio].copy()

    if len(df_m) == 0:
        raise ValueError(f"No hay datos históricos para '{municipio}'")

    df_m = df_m.sort_values("fecha")

    # Últimos valores para lags
    hosp_values = df_m["hospitalizaciones"].values

    context = {
        "lag_hosp_1":  float(hosp_values[-1])  if len(hosp_values) >= 1  else 0,
        "lag_hosp_2":  float(hosp_values[-2])  if len(hosp_values) >= 2  else 0,
        "lag_hosp_3":  float(hosp_values[-3])  if len(hosp_values) >= 3  else 0,
        "lag_hosp_6":  float(hosp_values[-6])  if len(hosp_values) >= 6  else 0,
        "lag_hosp_12": float(hosp_values[-12]) if len(hosp_values) >= 12 else 0,
        "rolling_mean_4": float(pd.Series(hosp_values).tail(4).mean()),
        "rolling_std_4":  float(pd.Series(hosp_values).tail(4).std() or 0),
        "tendencia_local": float(hosp_values[-1] - hosp_values[-3]) if len(hosp_values) >= 3 else 0,
        "municipio_target_enc": float(df_m["hospitalizaciones"].mean()),
        "total_eventos":        float(df_m["total_eventos"].mean()) if "total_eventos" in df_m.columns else 0,
        "edad_promedio":        float(df_m["edad_promedio"].mean()),
        "estrato_promedio":     float(df_m["estrato_promedio"].mean()),
        "antecedentes_mental_promedio": float(df_m["antecedentes_mental_promedio"].mean()),
        "consumo_sustancias_promedio":  float(df_m["consumo_sustancias_promedio"].mean()),
        "zona_predominante":            df_m["zona_predominante"].mode()[0],
        "metodo_predominante":          df_m["metodo_predominante"].mode()[0],
        "nivel_letalidad_predominante": df_m["nivel_letalidad_predominante"].mode()[0],
        "genero_predominante":          df_m["genero_predominante"].mode()[0],
        "grupo_etario_predominante":    df_m["grupo_etario_predominante"].mode()[0],
        "municipio_evento":             municipio,
    }
    return context


# ── Construir features ────────────────────────────────────────────────────────
def build_features(
    anio: int,
    mes: int,
    context: dict,
    encoders: dict,
    features: list,
    lag_1: float,
    lag_2: float,
    lag_3: float,
    lag_6: float,
    lag_12: float,
) -> pd.DataFrame:

    trimestre = (mes - 1) // 3 + 1

    def encode(col, value):
        if col in encoders and value in encoders[col].classes_:
            return int(encoders[col].transform([value])[0])
        return 0

    rolling_vals = [lag_1, lag_2, lag_3, lag_4 := lag_2]
    rolling_mean = float(np.mean(rolling_vals))
    rolling_std  = float(np.std(rolling_vals) or 0)
    tendencia    = lag_1 - lag_3

    row = {
        "mes":            mes,
        "trimestre":      trimestre,
        "es_fin_anio":    int(mes in [11, 12]),
        "es_inicio_anio": int(mes in [1, 2]),
        "municipio_evento_enc":             encode("municipio_evento",             context["municipio_evento"]),
        "zona_predominante_enc":            encode("zona_predominante",            context["zona_predominante"]),
        "metodo_predominante_enc":          encode("metodo_predominante",          context["metodo_predominante"]),
        "nivel_letalidad_predominante_enc": encode("nivel_letalidad_predominante", context["nivel_letalidad_predominante"]),
        "genero_predominante_enc":          encode("genero_predominante",          context["genero_predominante"]),
        "grupo_etario_predominante_enc":    encode("grupo_etario_predominante",    context["grupo_etario_predominante"]),
        "lag_hosp_1":           lag_1,
        "lag_hosp_2":           lag_2,
        "lag_hosp_3":           lag_3,
        "lag_hosp_6":           lag_6,
        "lag_hosp_12":          lag_12,
        "rolling_mean_4":       rolling_mean,
        "rolling_std_4":        rolling_std,
        "tendencia_local":      tendencia,
        "municipio_target_enc": context["municipio_target_enc"],
        "total_eventos":        context["total_eventos"],
        "edad_promedio":        context["edad_promedio"],
        "estrato_promedio":     context["estrato_promedio"],
        "antecedentes_mental_promedio": context["antecedentes_mental_promedio"],
        "consumo_sustancias_promedio":  context["consumo_sustancias_promedio"],
    }

    df = pd.DataFrame([row])
    return df[[f for f in features if f in df.columns]]


# ── Perfil histórico ──────────────────────────────────────────────────────────
def get_perfil_historico(df: pd.DataFrame, municipio: str) -> dict:
    df_m = df[df["municipio_evento"] == municipio].copy()

    media      = float(df_m["hospitalizaciones"].mean())
    std        = float(df_m["hospitalizaciones"].std() or 0)
    umbral     = media + std
    tasa_media = float(df_m["tasa_hospitalizacion"].mean()) if "tasa_hospitalizacion" in df_m.columns else 0

    # Mes con más hospitalizaciones
    if "mes" in df_m.columns:
        mes_critico = int(df_m.groupby("mes")["hospitalizaciones"].mean().idxmax())
    else:
        mes_critico = 0

    # Tendencia últimos 3 meses
    df_reciente = df_m.sort_values("fecha").tail(3)
    diff = df_reciente["hospitalizaciones"].iloc[-1] - df_reciente["hospitalizaciones"].iloc[0]
    if diff > media * 0.1:
        tendencia = "al alza"
    elif diff < -media * 0.1:
        tendencia = "a la baja"
    else:
        tendencia = "estable"

    return {
        "media_historica":          round(media, 1),
        "std_historica":            round(std, 1),
        "umbral_alerta":            round(umbral, 1),
        "tasa_hospitalizacion_media": round(tasa_media * 100, 1),
        "mes_critico":              mes_critico,
        "tendencia_reciente":       tendencia,
        "genero_predominante":      df_m["genero_predominante"].mode()[0] if "genero_predominante" in df_m.columns else "N/A",
        "grupo_etario_predominante": df_m["grupo_etario_predominante"].mode()[0] if "grupo_etario_predominante" in df_m.columns else "N/A",
        "metodo_predominante":      df_m["metodo_predominante"].mode()[0] if "metodo_predominante" in df_m.columns else "N/A",
        "antecedentes_mental_promedio": round(float(df_m["antecedentes_mental_promedio"].mean()) * 100, 1),
        "consumo_sustancias_promedio":  round(float(df_m["consumo_sustancias_promedio"].mean()) * 100, 1),
    }


# ── Predicción principal ──────────────────────────────────────────────────────
def predecir_demanda(
    municipio: str,
    anio: int,
    mes: int,
    meses_a_predecir: int = 1,
    variables_externas: dict = None
) -> dict:

    model, scaler, config, encoders = load_artifacts()
    features = config["features"]

    processed_path = os.path.join(BASE_DIR, "data", "processed", "demanda_mensual_processed.csv")
    df = pd.read_csv(processed_path)
    df["fecha"] = pd.to_datetime(df["fecha"])

    context = get_municipio_context(df, municipio)
    if variables_externas:
        context.update(variables_externas)

    # Inicializar lags
    hosp_vals  = df[df["municipio_evento"] == municipio].sort_values("fecha")["hospitalizaciones"].values
    lag_1  = float(hosp_vals[-1])  if len(hosp_vals) >= 1  else 0
    lag_2  = float(hosp_vals[-2])  if len(hosp_vals) >= 2  else 0
    lag_3  = float(hosp_vals[-3])  if len(hosp_vals) >= 3  else 0
    lag_6  = float(hosp_vals[-6])  if len(hosp_vals) >= 6  else 0
    lag_12 = float(hosp_vals[-12]) if len(hosp_vals) >= 12 else 0

    resultados = []

    for i in range(meses_a_predecir):
        mes_pred  = (mes + i - 1) % 12 + 1
        anio_pred = anio + (mes + i - 1) // 12

        X = build_features(
            anio_pred, mes_pred, context, encoders, features,
            lag_1, lag_2, lag_3, lag_6, lag_12
        )
        X_scaled   = scaler.transform(X)
        hosp_pred  = max(0, round(float(model.predict(X_scaled)[0])))

        # Nivel de alerta
        media   = context["municipio_target_enc"]
        std     = float(pd.Series(hosp_vals).std() or 0)
        umbral  = media + std

        if hosp_pred >= umbral * 1.5:
            nivel_alerta = "CRÍTICO"
        elif hosp_pred >= umbral:
            nivel_alerta = "ALTO"
        elif hosp_pred >= media:
            nivel_alerta = "MODERADO"
        else:
            nivel_alerta = "NORMAL"

        resultados.append({
            "municipio":              municipio,
            "anio":                   anio_pred,
            "mes":                    mes_pred,
            "hospitalizaciones_predichas": hosp_pred,
            "media_historica":        round(media, 1),
            "umbral_alerta":          round(umbral, 1),
            "nivel_alerta":           nivel_alerta,
        })

        # Actualizar lags
        lag_12 = lag_6
        lag_6  = lag_3
        lag_3  = lag_2
        lag_2  = lag_1
        lag_1  = float(hosp_pred)

    perfil = get_perfil_historico(df, municipio)

    return {
        "predicciones":    resultados,
        "perfil_historico": perfil
    }


# ── Test rápido ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    resultado = predecir_demanda(
        municipio="Manizales",
        anio=2026,
        mes=5,
        meses_a_predecir=3
    )

    print("\n📊 Predicciones de demanda hospitalaria:")
    for r in resultado["predicciones"]:
        print(f"  {r['anio']}-{r['mes']:02d} | {r['municipio']} | "
              f"Hospitalizaciones: {r['hospitalizaciones_predichas']} | "
              f"Alerta: {r['nivel_alerta']}")

    print("\n📋 Perfil histórico:")
    for k, v in resultado["perfil_historico"].items():
        print(f"  {k}: {v}")