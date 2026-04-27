import pandas as pd


def clasificar_tipo_resultado(resultado):
    resultado = str(resultado).lower()
    if "alta" in resultado:
        return "Recuperado"
    elif "hospital" in resultado:
        return "Grave"
    elif "traslado" in resultado:
        return "Remitido"
    else:
        return "Otro"


def crear_dim_atencion(df):
    dim_atencion = df[["resultado_atencion", "hospitalizado"]].copy()

    dim_atencion["tipo_resultado"] = dim_atencion["resultado_atencion"].apply(
        clasificar_tipo_resultado
    )

    dim_atencion["requirio_hospitalizacion"] = dim_atencion["hospitalizado"].apply(
        lambda x: 1 if str(x).lower() in ['sí', 'si', 'yes', '1', 'true'] else 0
    )

    # FIX DUPLICADOS: la BD tiene UQ sobre resultado_atencion únicamente.
    # Si deduplicamos por todas las columnas, el mismo resultado_atencion puede
    # aparecer con distintos valores de hospitalizado → duplica filas en el merge
    # de la fact. Deduplicamos SOLO por resultado_atencion (la clave natural).
    dim_atencion = (
        dim_atencion
        .drop_duplicates(subset=["resultado_atencion"])
        .reset_index(drop=True)
    )

    dim_atencion["id_atencion"] = dim_atencion.index + 1

    return dim_atencion[
        ["resultado_atencion", "tipo_resultado", "requirio_hospitalizacion", "id_atencion"]
    ]