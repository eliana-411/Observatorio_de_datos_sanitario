import pandas as pd


def crear_dim_tiempo(df):
    df = df.copy()
    df["fecha"] = pd.to_datetime(df["fecha"])

    dim_tiempo = pd.DataFrame()
    dim_tiempo["fecha"] = df["fecha"].drop_duplicates().reset_index(drop=True)

    dim_tiempo["anio"]       = dim_tiempo["fecha"].dt.year
    dim_tiempo["mes"]        = dim_tiempo["fecha"].dt.month
    dim_tiempo["trimestre"]  = dim_tiempo["fecha"].dt.quarter
    dim_tiempo["nombre_mes"] = dim_tiempo["fecha"].dt.month_name()
    dim_tiempo["dia_semana"] = dim_tiempo["fecha"].dt.day_name()

    # FIX #6: SQL Server BIT requiere 0/1 — bool Python falla con pyodbc
    dim_tiempo["es_fin_de_semana"] = (dim_tiempo["fecha"].dt.weekday >= 5).astype(int)

    dim_tiempo = dim_tiempo.reset_index(drop=True)
    dim_tiempo["id_tiempo"] = dim_tiempo.index + 1

    return dim_tiempo