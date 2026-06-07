import pandas as pd


def crear_fact_evento(df, dim_persona, dim_tiempo, dim_lugar, dim_metodo, dim_atencion, dim_contexto):
    """
    Crea la tabla de hechos (FACT_EVENTO) resolviendo las FKs
    contra las dimensiones en memoria.

    IMPORTANTE: los id_* que genera aquí son temporales.
    El loader los reemplaza con los IDs reales de la BD
    después de insertar las dimensiones (ver load_to_database).
    """

    fact = df.copy()

    # FK → dim_persona
    fact = fact.merge(
        dim_persona[[
            'genero', 'edad', 'estrato', 'grupo_poblacional',
            'estado_civil', 'situacion_sentimental', 'id_persona'
        ]],
        on=['genero', 'edad', 'estrato', 'grupo_poblacional',
            'estado_civil', 'situacion_sentimental'],
        how='left'
    )

    # FK → dim_tiempo
    fact['fecha'] = pd.to_datetime(fact['fecha'])
    fact = fact.merge(
        dim_tiempo[['fecha', 'id_tiempo']],
        on='fecha',
        how='left'
    )

    # FK → dim_lugar
    fact = fact.merge(
        dim_lugar[['municipio_evento', 'municipio_origen', 'zona_evento', 'id_lugar']],
        on=['municipio_evento', 'municipio_origen', 'zona_evento'],
        how='left'
    )

    # FK → dim_metodo
    fact = fact.merge(
        dim_metodo[['metodo', 'id_metodo']],
        on='metodo',
        how='left'
    )

    # FK → dim_atencion
    fact = fact.merge(
        dim_atencion[['resultado_atencion', 'id_atencion']],
        on='resultado_atencion',
        how='left'
    )

    # FK → dim_contexto
    fact = fact.merge(
        dim_contexto[['antecedentes_salud_mental', 'consumo_sustancias', 'id_contexto']],
        on=['antecedentes_salud_mental', 'consumo_sustancias'],
        how='left'
    )

    fact_final = pd.DataFrame()
    fact_final['id_registro']     = fact['id_registro']
    fact_final['id_tiempo']       = fact['id_tiempo'].astype('Int64')
    fact_final['id_persona']      = fact['id_persona'].astype('Int64')
    fact_final['id_lugar']        = fact['id_lugar'].astype('Int64')
    fact_final['id_metodo']       = fact['id_metodo'].astype('Int64')
    fact_final['id_atencion']     = fact['id_atencion'].astype('Int64')
    fact_final['id_contexto']     = fact['id_contexto'].astype('Int64')
    fact_final['hospitalizado']   = fact['hospitalizado'].apply(
        lambda x: 1 if str(x).lower() in ['sí', 'si', 'yes', '1', 'true'] else 0
    )
    fact_final['cantidad_intentos'] = 1

    return fact_final.reset_index(drop=True)