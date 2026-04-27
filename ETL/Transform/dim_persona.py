import pandas as pd

def clasificar_grupo_etario(edad):
    if edad < 18:
        return "Adolescente"
    elif edad < 30:
        return "Joven"
    elif edad < 60:
        return "Adulto"
    else:
        return "Adulto Mayor"


def crear_dim_persona(df):
    dim_persona = df[[
        "genero",
        "edad",
        "estrato",
        "grupo_poblacional",
        "estado_civil",
        "situacion_sentimental"
    ]].copy()

    # Feature engineering
    dim_persona["grupo_etario"] = dim_persona["edad"].apply(clasificar_grupo_etario)

    # Eliminar duplicados
    dim_persona = dim_persona.drop_duplicates().reset_index(drop=True)
    # Asignar ID único
    dim_persona["id_persona"] = dim_persona.index + 1

    return dim_persona