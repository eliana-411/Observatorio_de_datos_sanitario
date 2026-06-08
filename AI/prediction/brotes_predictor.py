# AI/prediction/brotes_predictor.py

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# ── Rutas ──────────────
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "brotes")

# ── Carga de artefactos ────────────
def load_artifacts():
    model  = joblib.load(os.path.join(MODEL_DIR, "brotes_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    with open(os.path.join(MODEL_DIR, "config.json"), "r") as f:
        config = json.load(f)

    # Cargar encoders
    encoders = {}
    for col in [
        "municipio_evento", "zona_evento", "metodo_predominante",
        "nivel_letalidad_predominante", "genero_predominante",
        "grupo_etario_predominante", "situacion_sentimental_predominante",
        "nombre_mes"
    ]:
        path = os.path.join(MODEL_DIR, f"encoder_{col}.pkl")
        if os.path.exists(path):
            encoders[col] = joblib.load(path)

    return model, scaler, config, encoders


# ── Obtener contexto histórico del municipio ──────────────────────────────────
def get_municipio_context(df_processed: pd.DataFrame, municipio: str) -> dict:
    df_m = df_processed[df_processed["municipio_evento"] == municipio]

    if len(df_m) == 0:
        raise ValueError(f"No hay datos históricos para {municipio}")

    df_m = df_m.sort_values("fecha").tail(3)

    context = {
        "lag_casos_1": float(df_m["casos"].iloc[-1]) if len(df_m) >= 1 else 0,
        "lag_casos_2": float(df_m["casos"].iloc[-2]) if len(df_m) >= 2 else 0,
        "lag_casos_3": float(df_m["casos"].iloc[-3]) if len(df_m) >= 3 else 0,
        "edad_promedio":                float(df_m["edad_promedio"].mean()),
        "estrato_promedio":             float(df_m["estrato_promedio"].mean()),
        "antecedentes_mental_promedio": float(df_m["antecedentes_mental_promedio"].mean()),
        "consumo_sustancias_promedio":  float(df_m["consumo_sustancias_promedio"].mean()),
        "tasa_mismo_municipio":         float(df_m["tasa_mismo_municipio"].mean()),
        "metodo_predominante":          df_m["metodo_predominante"].mode()[0],
        "nivel_letalidad_predominante": df_m["nivel_letalidad_predominante"].mode()[0],
        "genero_predominante":          df_m["genero_predominante"].mode()[0],
        "grupo_etario_predominante":    df_m["grupo_etario_predominante"].mode()[0],
        "situacion_sentimental_predominante": df_m["situacion_sentimental_predominante"].mode()[0],
        "zona_evento":                  df_m["zona_evento"].mode()[0],
        "municipio_evento":             municipio,
    }
    return context

# ── Perfil histórico del municipio ────────────────────────────────────────────
def get_perfil_historico(df_processed: pd.DataFrame, municipio: str) -> dict:
    """
    Calcula el perfil histórico real del municipio
    desde los datos procesados.
    """
    df_m = df_processed[df_processed["municipio_evento"] == municipio]

    if len(df_m) == 0:
        raise ValueError(f"No hay datos históricos para {municipio}")

    # Zona de mayor incidencia
    zona_incidencia = (
        df_m.groupby("zona_evento")["casos"]
        .sum()
        .reset_index()
        .sort_values("casos", ascending=False)
    )
    zona_mayor = zona_incidencia.iloc[0]["zona_evento"]
    total_casos = zona_incidencia["casos"].sum()

    zonas_detalle = {
        row["zona_evento"]: round(row["casos"] / total_casos * 100, 1)
        for _, row in zona_incidencia.iterrows()
    }

    # Género predominante
    genero_counts = df_m["genero_predominante"].value_counts()
    genero_predominante = genero_counts.index[0] if len(genero_counts) > 0 else "No disponible"
    porcentaje_genero = round(genero_counts.iloc[0] / genero_counts.sum() * 100, 1)

    # Grupo etario predominante
    etario_counts = df_m["grupo_etario_predominante"].value_counts()
    grupo_etario = etario_counts.index[0] if len(etario_counts) > 0 else "No disponible"
    porcentaje_etario = round(etario_counts.iloc[0] / etario_counts.sum() * 100, 1)

    # Método predominante
    metodo_counts = df_m["metodo_predominante"].value_counts()
    metodo = metodo_counts.index[0] if len(metodo_counts) > 0 else "No disponible"
    porcentaje_metodo = round(metodo_counts.iloc[0] / metodo_counts.sum() * 100, 1)

    # Situación sentimental predominante
    sentimental_counts = df_m["situacion_sentimental_predominante"].value_counts()
    situacion_sentimental = sentimental_counts.index[0] if len(sentimental_counts) > 0 else "No disponible"

    # Promedios contextuales
    pct_antecedentes    = round(df_m["antecedentes_mental_promedio"].mean() * 100, 1)
    pct_sustancias      = round(df_m["consumo_sustancias_promedio"].mean() * 100, 1)
    edad_promedio       = round(df_m["edad_promedio"].mean(), 1)
    estrato_promedio    = round(df_m["estrato_promedio"].mean(), 1)

    # Nivel de letalidad predominante
    letalidad_counts = df_m["nivel_letalidad_predominante"].value_counts()
    nivel_letalidad = letalidad_counts.index[0] if len(letalidad_counts) > 0 else "No disponible"

    # Tendencia últimos 3 meses
    df_reciente = df_m.sort_values("fecha").tail(3)
    tendencia = "estable"
    if len(df_reciente) >= 2:
        diff = df_reciente["casos"].iloc[-1] - df_reciente["casos"].iloc[0]
        if diff > df_reciente["casos"].mean() * 0.1:
            tendencia = "al alza"
        elif diff < -df_reciente["casos"].mean() * 0.1:
            tendencia = "a la baja"

    return {
        "zona_mayor_incidencia":        zona_mayor,
        "distribucion_por_zona":        zonas_detalle,
        "genero_predominante":          genero_predominante,
        "porcentaje_genero_predominante": porcentaje_genero,
        "grupo_etario_predominante":    grupo_etario,
        "porcentaje_grupo_etario":      porcentaje_etario,
        "metodo_predominante":          metodo,
        "porcentaje_metodo":            porcentaje_metodo,
        "situacion_sentimental_predominante": situacion_sentimental,
        "porcentaje_con_antecedentes_mentales": pct_antecedentes,
        "porcentaje_consumo_sustancias": pct_sustancias,
        "edad_promedio":                edad_promedio,
        "estrato_promedio":             estrato_promedio,
        "nivel_letalidad_predominante": nivel_letalidad,
        "tendencia_reciente":           tendencia,
    }

# ── Construir features para predicción ───────────────────────────────────────
def build_features(
    anio: int,
    mes: int,
    context: dict,
    encoders: dict,
    features: list
) -> pd.DataFrame:

    nombre_mes = datetime(anio, mes, 1).strftime("%B")
    trimestre  = (mes - 1) // 3 + 1

    row = {
        "mes":            mes,
        "trimestre":      trimestre,
        "es_fin_anio":    int(mes in [11, 12]),
        "es_inicio_anio": int(mes in [1, 2]),
        "nombre_mes_enc": encoders["nombre_mes"].transform([nombre_mes])[0]
                          if nombre_mes in encoders["nombre_mes"].classes_
                          else 0,
        "municipio_evento_enc": encoders["municipio_evento"].transform([context["municipio_evento"]])[0]
                                if context["municipio_evento"] in encoders["municipio_evento"].classes_
                                else 0,
        "zona_evento_enc": encoders["zona_evento"].transform([context["zona_evento"]])[0]
                           if context["zona_evento"] in encoders["zona_evento"].classes_
                           else 0,
        "lag_casos_1": context["lag_casos_1"],
        "lag_casos_2": context["lag_casos_2"],
        "lag_casos_3": context["lag_casos_3"],
        "metodo_predominante_enc": encoders["metodo_predominante"].transform([context["metodo_predominante"]])[0]
                                   if context["metodo_predominante"] in encoders["metodo_predominante"].classes_
                                   else 0,
        "nivel_letalidad_predominante_enc": encoders["nivel_letalidad_predominante"].transform([context["nivel_letalidad_predominante"]])[0]
                                            if context["nivel_letalidad_predominante"] in encoders["nivel_letalidad_predominante"].classes_
                                            else 0,
        "edad_promedio":                context["edad_promedio"],
        "estrato_promedio":             context["estrato_promedio"],
        "genero_predominante_enc": encoders["genero_predominante"].transform([context["genero_predominante"]])[0]
                                   if context["genero_predominante"] in encoders["genero_predominante"].classes_
                                   else 0,
        "grupo_etario_predominante_enc": encoders["grupo_etario_predominante"].transform([context["grupo_etario_predominante"]])[0]
                                         if context["grupo_etario_predominante"] in encoders["grupo_etario_predominante"].classes_
                                         else 0,
        "situacion_sentimental_predominante_enc": encoders["situacion_sentimental_predominante"].transform([context["situacion_sentimental_predominante"]])[0]
                                                  if context["situacion_sentimental_predominante"] in encoders["situacion_sentimental_predominante"].classes_
                                                  else 0,
        "antecedentes_mental_promedio": context["antecedentes_mental_promedio"],
        "consumo_sustancias_promedio":  context["consumo_sustancias_promedio"],
        "tasa_mismo_municipio":         context["tasa_mismo_municipio"],
    }

    df = pd.DataFrame([row])
    return df[[f for f in features if f in df.columns]]


# ── Predicción principal ──────────────────────────────────────────────────────
def predecir_brotes(
    municipio: str,
    anio: int,
    mes: int,
    meses_a_predecir: int = 1,
    variables_externas: dict = None
) -> dict:
    model, scaler, config, encoders = load_artifacts()
    features = config["features"]

    processed_path = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
    df_processed   = pd.read_csv(processed_path)
    df_processed["fecha"] = pd.to_datetime(df_processed["fecha"])

    context = get_municipio_context(df_processed, municipio)

    if variables_externas:
        context.update(variables_externas)

    resultados = []
    lag_1 = context["lag_casos_1"]
    lag_2 = context["lag_casos_2"]
    lag_3 = context["lag_casos_3"]

    for i in range(meses_a_predecir):
        mes_pred  = (mes + i - 1) % 12 + 1
        anio_pred = anio + (mes + i - 1) // 12

        context["lag_casos_1"] = lag_1
        context["lag_casos_2"] = lag_2
        context["lag_casos_3"] = lag_3

        X = build_features(anio_pred, mes_pred, context, encoders, features)
        X_scaled = scaler.transform(X)
        casos_pred = max(0, round(float(model.predict(X_scaled)[0])))

        df_m = df_processed[df_processed["municipio_evento"] == municipio]
        media_historica = df_m["casos"].mean()
        std_historica   = df_m["casos"].std()
        umbral_alerta   = media_historica + std_historica

        if casos_pred >= umbral_alerta * 1.5:
            nivel_alerta = "CRÍTICO"
        elif casos_pred >= umbral_alerta:
            nivel_alerta = "ALTO"
        elif casos_pred >= media_historica:
            nivel_alerta = "MODERADO"
        else:
            nivel_alerta = "NORMAL"

        resultados.append({
            "municipio":       municipio,
            "anio":            anio_pred,
            "mes":             mes_pred,
            "casos_predichos": casos_pred,
            "media_historica": round(media_historica, 1),
            "umbral_alerta":   round(umbral_alerta, 1),
            "nivel_alerta":    nivel_alerta,
        })

        lag_3 = lag_2
        lag_2 = lag_1
        lag_1 = float(casos_pred)

    perfil = get_perfil_historico(df_processed, municipio)

    return {
        "predicciones":    resultados,
        "perfil_historico": perfil
    }
