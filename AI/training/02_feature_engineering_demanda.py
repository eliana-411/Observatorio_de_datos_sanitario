# AI/training/02_feature_engineering_demanda.py

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_MENSUAL    = os.path.join(BASE_DIR, "data", "raw",       "demanda_mensual.csv")
PROCESSED_DIR  = os.path.join(BASE_DIR, "data", "processed")
ENCODERS_DIR_M = os.path.join(BASE_DIR, "models", "demanda", "mensual")
ENCODERS_DIR_S = os.path.join(BASE_DIR, "models", "demanda", "semanal")

# ── Columnas categóricas a codificar ──────────────────────────────────────────
CATEGORICAL_COLS = [
    "municipio_evento",
    "zona_predominante",
    "metodo_predominante",
    "nivel_letalidad_predominante",
    "genero_predominante",
    "grupo_etario_predominante",
]

# ─────────────────────────────────────────────────────────────────────────────
# 1. Carga
# ─────────────────────────────────────────────────────────────────────────────

def load_raw(path: str, label: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"[load:{label}] Filas: {len(df)} | Columnas: {list(df.columns)}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 2. Construcción de fecha
# ─────────────────────────────────────────────────────────────────────────────

def build_fecha_mensual(df: pd.DataFrame) -> pd.DataFrame:
    """Construye fecha como primer día del mes: 2020-01-01"""
    df["fecha"] = pd.to_datetime(
        df["anio"].astype(str) + "-" +
        df["mes"].astype(str).str.zfill(2) + "-01"
    )
    print(f"[fecha:mensual] Rango: {df['fecha'].min()} → {df['fecha'].max()}")
    return df



# ─────────────────────────────────────────────────────────────────────────────
# 3. Renombrar target
# ─────────────────────────────────────────────────────────────────────────────

def rename_target(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns={"total_hospitalizaciones": "hospitalizaciones"})
    print(
        f"[target] hospitalizaciones — "
        f"min: {df['hospitalizaciones'].min()} | "
        f"max: {df['hospitalizaciones'].max()} | "
        f"media: {df['hospitalizaciones'].mean():.2f}"
    )
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 4. Encoding de categóricas
# ─────────────────────────────────────────────────────────────────────────────

def encode_categoricals(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    encoders = {}
    for col in CATEGORICAL_COLS:
        if col not in df.columns:
            print(f"[warning] Columna '{col}' no encontrada, se omite.")
            continue
        le = LabelEncoder()
        df[col] = df[col].fillna("Desconocido")
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"[encoding] {col} → {len(le.classes_)} categorías")
    return df, encoders

def add_relative_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Hospitalizaciones relativas al promedio histórico del municipio.
    Captura si este período está por encima o debajo de lo normal.
    """
    media = df.groupby("municipio_evento")["hospitalizaciones"].transform("mean")
    std   = df.groupby("municipio_evento")["hospitalizaciones"].transform("std").fillna(1)
    df["hosp_zscore"] = (df["hospitalizaciones"] - media) / std
    df["hosp_relativa"] = df["hospitalizaciones"] / media.replace(0, 1)
    print("[relative] hosp_zscore y hosp_relativa creados.")
    return df

# ─────────────────────────────────────────────────────────────────────────────
# 5. Lags por municipio
# ─────────────────────────────────────────────────────────────────────────────

def add_lag_features(df: pd.DataFrame, lags: list[int]) -> pd.DataFrame:
    """
    Genera lags del target agrupados por municipio.
    - Modelo mensual  → lags [1, 2, 3]
    - Modelo semanal  → lags [1, 4, 8]
    """
    df = df.sort_values(["municipio_evento", "fecha"]).reset_index(drop=True)

    for lag in lags:
        col_name = f"lag_hosp_{lag}"
        df[col_name] = df.groupby("municipio_evento")["hospitalizaciones"].shift(lag)
        print(f"[lag] {col_name} — nulos generados: {df[col_name].isna().sum()}")

    # Eliminar filas sin lags (primeros períodos de cada municipio)
    lag_cols = [f"lag_hosp_{lag}" for lag in lags]
    before = len(df)
    df = df.dropna(subset=lag_cols)
    print(f"[lag] Filas eliminadas por NaN: {before - len(df)} | Filas finales: {len(df)}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 6. Rolling statistics por municipio
# ─────────────────────────────────────────────────────────────────────────────

def add_rolling_features(df: pd.DataFrame, window: int = 4) -> pd.DataFrame:
    """
    Media móvil y desviación estándar de las últimas N períodos por municipio.
    Captura tendencia reciente y volatilidad — XGBoost no tiene memoria propia.
    """
    df = df.sort_values(["municipio_evento", "fecha"]).reset_index(drop=True)

    df[f"rolling_mean_{window}"] = (
        df.groupby("municipio_evento")["hospitalizaciones"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=2).mean())
    )
    df[f"rolling_std_{window}"] = (
        df.groupby("municipio_evento")["hospitalizaciones"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=2).std())
    )

    # Rellenar NaN en std con 0 (períodos con poca historia)
    df[f"rolling_std_{window}"] = df[f"rolling_std_{window}"].fillna(0)

    print(f"[rolling] rolling_mean_{window} y rolling_std_{window} creados.")

    df[f"rolling_mean_{window}"] = df[f"rolling_mean_{window}"].fillna(df["lag_hosp_1"])

    return df


# ─────────────────────────────────────────────────────────────────────────────
# 7. Tendencia local
# ─────────────────────────────────────────────────────────────────────────────

def add_trend_feature(df: pd.DataFrame, lag_reciente: int, lag_anterior: int) -> pd.DataFrame:
    """
    Diferencia entre lag reciente y lag anterior.
    Indica si la demanda está subiendo (+) o bajando (-) antes de la predicción.
    """
    col_reciente = f"lag_hosp_{lag_reciente}"
    col_anterior = f"lag_hosp_{lag_anterior}"

    if col_reciente in df.columns and col_anterior in df.columns:
        df["tendencia_local"] = df[col_reciente] - df[col_anterior]
        print(f"[tendencia] tendencia_local = {col_reciente} - {col_anterior}")
    else:
        print(f"[warning] No se pudo calcular tendencia_local — columnas faltantes.")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 8. Variables temporales adicionales
# ─────────────────────────────────────────────────────────────────────────────

def build_time_features(df: pd.DataFrame, granularidad: str) -> pd.DataFrame:
    """
    Agrega variables temporales según la granularidad del modelo.
    - mensual : trimestre, es_fin_anio, es_inicio_anio
    - semanal : trimestre derivado, es_fin_anio, es_inicio_anio, tuvo_fin_de_semana
    """
    df["es_fin_anio"]    = df["mes"].isin([11, 12]).astype(int) if "mes" in df.columns else 0
    df["es_inicio_anio"] = df["mes"].isin([1,   2]).astype(int) if "mes" in df.columns else 0

    if granularidad == "semanal" and "numero_semana" in df.columns:
        # Derivar mes y trimestre desde numero_semana si no vienen en el raw
        if "mes" not in df.columns:
            df["mes"] = df["fecha"].dt.month
        df["trimestre"] = ((df["mes"] - 1) // 3 + 1)
        df["es_fin_anio"]    = df["mes"].isin([11, 12]).astype(int)
        df["es_inicio_anio"] = df["mes"].isin([1,   2]).astype(int)

    print(f"[time:{granularidad}] Variables temporales adicionales creadas.")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 9. Guardar
# ─────────────────────────────────────────────────────────────────────────────

def save_processed(df: pd.DataFrame, filename: str):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    path = os.path.join(PROCESSED_DIR, filename)
    df.to_csv(path, index=False)
    print(f"[saved] {path}")


def save_encoders(encoders: dict, encoders_dir: str):
    os.makedirs(encoders_dir, exist_ok=True)
    for col, le in encoders.items():
        path = os.path.join(encoders_dir, f"encoder_{col}.pkl")
        joblib.dump(le, path)
        print(f"[encoder saved] {path}")

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def process_mensual():
    df = load_raw(RAW_MENSUAL, "mensual")
    df = build_fecha_mensual(df)
    df = rename_target(df)
    df = build_time_features(df, granularidad="mensual")
    df, encoders = encode_categoricals(df)
    df = add_lag_features(df, lags=[1, 2, 3, 6, 12])  # agregar lag 6 y 12
    df = add_rolling_features(df, window=4)
    df = add_trend_feature(df, lag_reciente=1, lag_anterior=3)
    df = add_target_encoding(df)    # después de lags
    df = add_relative_features(df)  # después de lags
    save_processed(df, "demanda_mensual_processed.csv")
    save_encoders(encoders, ENCODERS_DIR_M)


def main():
    process_mensual()
    print("\n Todo el feature engineering de demanda completado.")


if __name__ == "__main__":
    main()