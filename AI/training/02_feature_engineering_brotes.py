# AI/training/02_feature_engineering.py

import os
import joblib
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH        = os.path.join(BASE_DIR, "data", "raw",       "brotes.csv")
PROCESSED_DIR   = os.path.join(BASE_DIR, "data", "processed")
PROCESSED_PATH  = os.path.join(PROCESSED_DIR,                 "brotes_processed.csv")
MODELS_DIR      = os.path.join(BASE_DIR, "models", "brotes")
SCALER_PATH     = os.path.join(MODELS_DIR,                    "scaler_regressors.pkl")

# Columnas que Prophet necesita tal cual (no se tocan)
PROPHET_COLS = ["ds", "municipio", "total_eventos"]

# Regressores numéricos a normalizar a [0, 1]
# Prophet es sensible a magnitudes — todos vienen como porcentajes (0-100)
# o promedios de diferente escala, por eso se escalan juntos.
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


# ── 1. Carga ──────────────────────────────────────────────────────────────────

def load_raw() -> pd.DataFrame:
    df = pd.read_csv(RAW_PATH, parse_dates=["ds"])
    print(f"[load] Filas: {len(df):,} | Municipios: {df['municipio'].nunique()}")
    return df


# ── 2. Validaciones básicas ───────────────────────────────────────────────────

def validate(df: pd.DataFrame) -> pd.DataFrame:
    # Verificar columnas requeridas
    missing = [c for c in PROPHET_COLS + REGRESSORS if c not in df.columns]
    if missing:
        raise ValueError(f"Columnas faltantes en brotes.csv: {missing}")

    # Reportar nulos en regressores
    nulls = df[REGRESSORS].isnull().sum()
    if nulls.any():
        print("[validate] Nulos encontrados — se imputan con 0:")
        print(nulls[nulls > 0].to_string())

    # Imputar nulos con 0 (meses sin eventos → proporciones = 0)
    df[REGRESSORS] = df[REGRESSORS].fillna(0)

    # Municipios con muy pocos meses (no servirán para entrenar Prophet)
    conteo = df.groupby("municipio")["ds"].count()
    escasos = conteo[conteo < 24]
    if not escasos.empty:
        print(f"[validate] Municipios con < 24 meses (serán omitidos en entrenamiento):")
        print(escasos.to_string())

    print("[validate] OK")
    return df


# ── 3. Normalización de regressores ──────────────────────────────────────────

def normalize_regressors(df: pd.DataFrame) -> tuple[pd.DataFrame, MinMaxScaler]:
    """
    Escala todos los regressores a [0, 1] con MinMaxScaler.
    El scaler se guarda en disco para reutilizarlo en inferencia
    sin tener que recalcular sobre datos de entrenamiento.
    """
    scaler = MinMaxScaler()
    df = df.copy()
    df[REGRESSORS] = scaler.fit_transform(df[REGRESSORS])

    for reg in REGRESSORS:
        print(f"[scaler] {reg:40s} → [{df[reg].min():.3f}, {df[reg].max():.3f}]")

    return df, scaler


# ── 4. Guardado ───────────────────────────────────────────────────────────────

def save_processed(df: pd.DataFrame):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"[saved] {PROCESSED_PATH}")


def save_scaler(scaler: MinMaxScaler):
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)
    print(f"[saved] {SCALER_PATH}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  Feature engineering — brotes (Prophet)")
    print("=" * 55)

    df = load_raw()
    df = validate(df)
    df, scaler = normalize_regressors(df)
    save_processed(df)
    save_scaler(scaler)

    print(f"\nResumen final:")
    print(f"  Filas procesadas : {len(df):,}")
    print(f"  Municipios       : {df['municipio'].nunique()}")
    print(f"  Rango fechas     : {df['ds'].min()} → {df['ds'].max()}")
    print(f"  Regressores      : {len(REGRESSORS)}")
    print("\nFeature engineering completado.")
    print(df[PROPHET_COLS + REGRESSORS[:3]].head())


if __name__ == "__main__":
    main()