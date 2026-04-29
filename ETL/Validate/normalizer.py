import pandas as pd
import unicodedata


def limpiar_texto(texto):
    if pd.isna(texto):
        return texto

    # Convertir a string
    texto = str(texto)

    # Quitar espacios al inicio y final
    texto = texto.strip()

    # Quitar espacios dobles internos
    texto = " ".join(texto.split())

    # Normalizar tildes y caracteres especiales
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')

    # Formato tipo título (Primera letra mayúscula)
    texto = texto.title()

    return texto


def normalizar_dataframe(df: pd.DataFrame):
    columnas_texto = [
        "municipio_origen",
        "municipio_evento",
        "zona_evento",
        "genero",
        "grupo_poblacional",
        "estado_civil",
        "situacion_sentimental",
        "metodo",
        "resultado_atencion",
        "antecedentes_salud_mental",
        "consumo_sustancias"
    ]

    for col in columnas_texto:
        if col in df.columns:
            df[col] = df[col].apply(limpiar_texto)

    return df