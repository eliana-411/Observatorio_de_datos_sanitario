import pandas as pd

def leer_excel(ruta_archivo: str) -> pd.DataFrame:
    try:
        df = pd.read_excel(ruta_archivo, engine="openpyxl")

        print(f"[EXTRACT] Excel cargado correctamente: {len(df)} registros")
        return df

    except Exception as e:
        print(f"[ERROR][EXTRACT][EXCEL]: {e}")
        return None