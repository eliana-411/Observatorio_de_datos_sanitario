import pandas as pd

def leer_csv(ruta_archivo: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(ruta_archivo)

        print(f"[EXTRACT] CSV cargado correctamente: {len(df)} registros")
        return df

    except Exception as e:
        print(f"[ERROR][EXTRACT][CSV]: {e}")
        return None