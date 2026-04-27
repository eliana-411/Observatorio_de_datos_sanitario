import pandas as pd
 
 
def crear_dim_contexto(df):
    dim_contexto = df[[
        "antecedentes_salud_mental",
        "consumo_sustancias"
    ]].copy()
 
    # FIX #5/#6: SQL Server BIT requiere 0/1
    dim_contexto["tiene_antecedente"] = dim_contexto["antecedentes_salud_mental"].apply(
        lambda x: 0 if str(x).lower() == "ninguno" else 1
    )
 
    dim_contexto["consume_sustancias_flag"] = dim_contexto["consumo_sustancias"].apply(
        lambda x: 0 if str(x).lower() == "ninguno" else 1
    )
 
    dim_contexto = dim_contexto.drop_duplicates().reset_index(drop=True)
    dim_contexto["id_contexto"] = dim_contexto.index + 1
 
    return dim_contexto