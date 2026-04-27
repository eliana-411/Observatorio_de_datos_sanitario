import pandas as pd


def crear_dim_lugar(df):
    dim_lugar = df[[
        "municipio_evento",
        "municipio_origen",
        "zona_evento"
    ]].copy()

    dim_lugar["departamento"] = "Caldas"

    # FIX #5: SQL Server BIT requiere 0/1 — bool Python falla con pyodbc
    dim_lugar["mismo_municipio"] = (
        dim_lugar["municipio_evento"] == dim_lugar["municipio_origen"]
    ).astype(int)

    dim_lugar = dim_lugar.drop_duplicates().reset_index(drop=True)
    dim_lugar["id_lugar"] = dim_lugar.index + 1

    return dim_lugar