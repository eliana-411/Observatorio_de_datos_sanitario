import pandas as pd


def crear_fact_evento(df, dim_persona, dim_tiempo, dim_lugar, dim_metodo, dim_atencion, dim_contexto):
    """
    Crea la tabla de hechos (FACT_EVENTO) con las claves foráneas hacia las
    dimensiones y las medidas definidas en el DDL de la BD.

    Columnas de la tabla en BD:
        id_registro, id_tiempo, id_persona, id_lugar, id_metodo,
        id_atencion, id_contexto, hospitalizado (BIT), cantidad_intentos (TINYINT)
    """

    # ── 1. RESOLVER FKs MEDIANTE MERGE ────────────────────────────────────────

    # FK → dim_persona  (join por todos los atributos de persona)
    fact = df.merge(
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

    # FK → dim_atencion  (UQ en resultado_atencion → no genera duplicados)
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

    # ── 2. CONSTRUIR TABLA FINAL ───────────────────────────────────────────────

    fact_final = pd.DataFrame()

    # FIX #2a: la PK en BD se llama id_registro, no id_evento
    fact_final['id_registro'] = fact['id_registro']

    # Claves foráneas
    fact_final['id_tiempo']   = fact['id_tiempo'].astype('Int64')
    fact_final['id_persona']  = fact['id_persona'].astype('Int64')
    fact_final['id_lugar']    = fact['id_lugar'].astype('Int64')
    fact_final['id_metodo']   = fact['id_metodo'].astype('Int64')
    fact_final['id_atencion'] = fact['id_atencion'].astype('Int64')
    fact_final['id_contexto'] = fact['id_contexto'].astype('Int64')

    # FIX #2b: columna 'hospitalizado' es NOT NULL en BD — viene del dataset original
    fact_final['hospitalizado'] = fact['hospitalizado'].apply(
        lambda x: 1 if str(x).lower() in ['sí', 'si', 'yes', '1', 'true'] else 0
    )

    # Medida: cantidad de intentos (siempre 1 por registro)
    fact_final['cantidad_intentos'] = 1

    return fact_final.reset_index(drop=True)