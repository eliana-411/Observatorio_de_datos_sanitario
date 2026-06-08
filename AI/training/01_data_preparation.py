# AI/training/01_data_preparation.py

import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR    = os.path.join(BASE_DIR, "data", "raw")


# ── Conexión ─────────────────────────────────────────────────────────────────

def get_engine():
    conn_str = os.getenv("SQLSERVER_CONN")
    if not conn_str:
        raise ValueError("SQLSERVER_CONN no está definida en el .env")
    return create_engine(f"mssql+pyodbc:///?odbc_connect={conn_str}")


# ── Extracción ────────────────────────────────────────────────────────────────

def extract_brotes(engine) -> pd.DataFrame:
    """
    Extrae vw_brotes: 1 fila por (municipio × mes).
    Ya viene con ds, total_eventos y regressores calculados.
    """
    with engine.begin() as conn:
        df = pd.read_sql(
            text("SELECT * FROM dbo.vw_brotes ORDER BY municipio, ds"),
            conn
        )
    print(f"[brotes] Filas       : {len(df):,}")
    print(f"[brotes] Municipios  : {df['municipio'].nunique()}")
    print(f"[brotes] Rango fechas: {df['ds'].min()} → {df['ds'].max()}")
    print(f"[brotes] Columnas    : {list(df.columns)}")
    return df


def extract_anomalias(engine) -> pd.DataFrame:
    """Extrae datos de la vista vw_anomalias para detección de anomalías."""
    query = "SELECT * FROM dbo.vw_anomalias"
    df = pd.read_sql(query, engine)
    if df.empty:
        raise ValueError("La consulta a vw_anomalias no devolvió datos.")
    
    print(f"[anomalias] Filas extraídas: {len(df)}")
    print(f"[anomalias] Columnas: {len(df.columns)}")
    print(f"[anomalias] Lista de columnas:")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i:2d}. {col}")
    return df

def extract_demanda_mensual(engine) -> pd.DataFrame:
    query = "SELECT * FROM dbo.vw_demanda"
    df = pd.read_sql(query, engine)
    print(f"[demanda_mensual] Filas extraídas: {len(df)}")
    print(f"[demanda_mensual] Columnas: {list(df.columns)}")
    return df
# ── Guardado ──────────────────────────────────────────────────────────────────

def save_raw(df: pd.DataFrame, filename: str):
    os.makedirs(RAW_DIR, exist_ok=True)
    path = os.path.join(RAW_DIR, filename)
    df.to_csv(path, index=False)
    print(f"[saved] {path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  Extracción — vw_brotes")
    print("=" * 55)

    engine = get_engine()

    df_brotes = extract_brotes(engine)
    save_raw(df_brotes, "brotes.csv")

    print("\n--- muestra ---")
    print(df_brotes.head())
    print("\nExtracción completada.")

    df_anomalias = extract_anomalias(engine)
    save_raw(df_anomalias, "anomalias.csv")
    print("\n Extracion completada")

    df_demanda = extract_demanda_mensual(engine)
    save_raw(df_demanda, "demanda_mensual.csv")
    print("\n Extracion completada")


if __name__ == "__main__":
    main()