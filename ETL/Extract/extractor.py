import os
from Extract.csv_reader import leer_csv
from Extract.excel_reader import leer_excel

def extraer_datos(ruta_archivo: str):
    extension = os.path.splitext(ruta_archivo)[1].lower()

    if extension == ".csv":
        return leer_csv(ruta_archivo)

    elif extension in [".xlsx", ".xls"]:
        return leer_excel(ruta_archivo)

    else:
        raise ValueError(f"Formato no soportado: {extension}")