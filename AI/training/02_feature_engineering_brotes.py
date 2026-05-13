# AI/training/02_feature_engineering.py

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# ── Rutas ────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH      = os.path.join(BASE_DIR, "data", "raw", "brotes.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
PROCESSED_PATH = os.path.join(PROCESSED_DIR, "brotes_processed.csv")
ENCODERS_DIR  = os.path.join(BASE_DIR, "models", "brotes")

# ── 1. Carga 
def load_raw() -> pd.DataFrame:
    df = pd.read_csv(RAW_PATH)
    print(f"[load] Filas: {len(df)} | Columnas: {list(df.columns)}")
    return df

# ── 2. Construcción de fecha 
def build_fecha(df: pd.DataFrame) -> pd.DataFrame:
    df["fecha"] = pd.to_datetime(
        df["anio"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
    )
    print(f"[fecha] Rango: {df['fecha'].min()} → {df['fecha'].max()}")
    return df

# ── 3. Renombrar target 
def rename_target(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns={"total_eventos": "casos"})
    print(f"[target] casos — min: {df['casos'].min()} | max: {df['casos'].max()} | media: {df['casos'].mean():.2f}")
    return df

# ── 4. Encoding de categóricas 
CATEGORICAL_COLS = [
    "municipio_evento",
    "zona_evento",          # ← corregido
    "metodo_predominante",
    "nivel_letalidad_predominante",
    "genero_predominante",
    "grupo_etario_predominante",
    "situacion_sentimental_predominante",
    "nombre_mes",
]

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

# ── 5. Lags por municipio ─────────────────────────────────────────────────────
def add_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["municipio_evento", "fecha"]).reset_index(drop=True)

    for lag in [1, 2, 3]:
        col_name = f"lag_casos_{lag}"
        df[col_name] = (
            df.groupby("municipio_evento")["casos"]
            .shift(lag)
        )
        print(f"[lag] {col_name} — nulos generados: {df[col_name].isna().sum()}")

    # Eliminar filas sin lags (primeros meses de cada municipio)
    before = len(df)
    df = df.dropna(subset=["lag_casos_1", "lag_casos_2", "lag_casos_3"])
    print(f"[lag] Filas eliminadas por NaN en lags: {before - len(df)} | Filas finales: {len(df)}")
    return df

# ── 6. Variables temporales adicionales ───────────────────────────────────────
def build_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df["es_fin_anio"]    = df["mes"].isin([11, 12]).astype(int)
    df["es_inicio_anio"] = df["mes"].isin([1, 2]).astype(int)
    print("[time] Variables temporales adicionales creadas.")
    return df

# ── 7. Guardar ────────────────────────────────────────────────────────────────
def save_processed(df: pd.DataFrame):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"[saved] {PROCESSED_PATH}")

def save_encoders(encoders: dict):
    import joblib
    os.makedirs(ENCODERS_DIR, exist_ok=True)
    for col, le in encoders.items():
        path = os.path.join(ENCODERS_DIR, f"encoder_{col}.pkl")
        joblib.dump(le, path)
        print(f"[encoder saved] {path}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    df = load_raw()
    df = build_fecha(df)
    df = rename_target(df)
    df = build_time_features(df)
    df, encoders = encode_categoricals(df)
    df = add_lag_features(df)
    save_processed(df)
    save_encoders(encoders)
    print("\n Feature engineering completado.")
    print(df.head())

if __name__ == "__main__":
    main()