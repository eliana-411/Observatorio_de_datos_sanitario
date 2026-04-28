import pandas as pd


ZONAS_VALIDAS = ["urbana", "rural", "rural disperso"]


def validar_fila(row):
    errores = []

    # Edad
    try:
        edad = int(row["edad"])
        if not (0 <= edad <= 120):
            errores.append("Edad fuera de rango")
    except:
        errores.append("Edad inválida")

    # Estrato
    try:
        estrato = int(row["estrato"])
        if estrato not in [1, 2, 3, 4, 5, 6]:
            errores.append("Estrato fuera de rango")
    except:
        errores.append("Estrato inválido")

    # Municipios
    if pd.isna(row["municipio_evento"]) or str(row["municipio_evento"]).strip() == "":
        errores.append("Municipio evento vacío")

    if pd.isna(row["municipio_origen"]) or str(row["municipio_origen"]).strip() == "":
        errores.append("Municipio origen vacío")

    # Zona evento (robusto)
    try:
        zona = str(row["zona_evento"]).strip().lower()
        if zona not in ZONAS_VALIDAS:
            errores.append("Zona evento inválida")
    except:
        errores.append("Zona evento inválida")

    # Fecha
    try:
        pd.to_datetime(row["fecha"])
    except:
        errores.append("Fecha inválida")

    return errores


def eliminar_duplicados(df: pd.DataFrame):
    df_sin_dup = df.drop_duplicates()
    print(f"[VALIDATE] Duplicados eliminados: {len(df) - len(df_sin_dup)}")
    return df_sin_dup


def validar_dataset(df: pd.DataFrame):
    datos_validos = []
    datos_invalidos = []

    for _, row in df.iterrows():
        errores = validar_fila(row)

        if errores:
            row["errores"] = ", ".join(errores)
            datos_invalidos.append(row)
        else:
            datos_validos.append(row)

    df_validos = pd.DataFrame(datos_validos)
    df_invalidos = pd.DataFrame(datos_invalidos)

    print(f"[VALIDATE] Registros válidos: {len(df_validos)}")
    print(f"[VALIDATE] Registros inválidos: {len(df_invalidos)}")

    return df_validos, df_invalidos


def guardar_errores(df_invalidos: pd.DataFrame):
    if not df_invalidos.empty:
        df_invalidos.to_csv("Data/errors_registros.csv", index=False)
        print("[VALIDATE] Archivo de errores generado")