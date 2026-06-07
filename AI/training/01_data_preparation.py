# AI/training/01_data_preparation.py

import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

def get_sqlserver_engine():
    connection_string = os.getenv("SQLSERVER_CONN")
    if not connection_string:
        raise ValueError("La variable SQLSERVER_CONN no está definida en el .env")
    
    connection_url = f"mssql+pyodbc:///?odbc_connect={connection_string}"
    return create_engine(connection_url)


def extract_brotes(engine) -> pd.DataFrame:
    query = "SELECT * FROM dbo.vw_brotes"
    df = pd.read_sql(query, engine)
    print(f"[brotes] Filas extraídas: {len(df)}")
    print(f"[brotes] Columnas: {list(df.columns)}")
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
 
def extract_demanda_semanal(engine) -> pd.DataFrame:
    query = "SELECT * FROM dbo.vw_demanda_semanal"
    df = pd.read_sql(query, engine)
    print(f"[demanda_semanal] Filas extraídas: {len(df)}")
    print(f"[demanda_semanal] Columnas: {list(df.columns)}")
    return df

def save_raw(df: pd.DataFrame, filename: str):
    """Guarda el DataFrame en CSV."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(base_dir, "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, filename)
    df.to_csv(path, index=False)
    print(f"[saved] {path}")


def main():
    print("Conectando a SQL Server...")
    engine = get_sqlserver_engine()

    print("Extrayendo vw_brotes...")
    df_brotes = extract_brotes(engine)
    save_raw(df_brotes, "brotes.csv")

    print("\nExtrayendo vw_demanda (mensual)...")
    df_demanda_mensual = extract_demanda_mensual(engine)
    save_raw(df_demanda_mensual, "demanda_mensual.csv")
 
    print("\nExtrayendo vw_demanda_semanal...")
    df_demanda_semanal = extract_demanda_semanal(engine)
    save_raw(df_demanda_semanal, "demanda_semanal.csv")

    print("\nExtracción completada.")
    print("\n--- brotes (muestra) ---")
    print(df_brotes.head())

    print("\n--- demanda mensual (muestra) ---")
    print(df_demanda_mensual.head())

    print("\n--- demanda semanal (muestra) ---")
    print(df_demanda_semanal.head())

    print("Extrayendo vw_anomalias...")
    df_anomalias = extract_anomalias(engine)
    save_raw(df_anomalias, "anomalias.csv")

    print("Extracción anomalias completada.")
    print(df_anomalias.head())

if __name__ == "__main__":
    main()