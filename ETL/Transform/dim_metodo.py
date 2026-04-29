import pandas as pd

def clasificar_tipo_metodo(metodo):
    metodo = str(metodo).lower()

    if "medicamento" in metodo or "veneno" in metodo:
        return "Quimico"
    elif "ahorc" in metodo:
        return "Mecanico"
    elif "arma" in metodo:
        return "Violento"
    else:
        return "Otro"


def clasificar_letalidad(metodo):
    metodo = str(metodo).lower()

    if "arma" in metodo or "ahorc" in metodo:
        return "Alto"
    else:
        return "Bajo"


def crear_dim_metodo(df):
    dim_metodo = df[["metodo"]].copy()

    dim_metodo["tipo_metodo"] = dim_metodo["metodo"].apply(clasificar_tipo_metodo)
    dim_metodo["nivel_letalidad"] = dim_metodo["metodo"].apply(clasificar_letalidad)

    dim_metodo = dim_metodo.drop_duplicates().reset_index(drop=True)

    dim_metodo["id_metodo"] = dim_metodo.index + 1

    return dim_metodo