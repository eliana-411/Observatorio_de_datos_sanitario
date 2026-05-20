USE ObservatorioDW;
GO

CREATE OR ALTER VIEW dbo.vw_demanda AS
SELECT
    dt.anio,
    dt.mes,
    dt.trimestre,
    dt.nombre_mes,
    dl.municipio_evento,

    -- Target
    SUM(CAST(fe.hospitalizado AS INT))            AS total_hospitalizaciones,
    COUNT(*)                                        AS total_eventos,
    AVG(CAST(fe.hospitalizado AS FLOAT))          AS tasa_hospitalizacion,

    -- Atención
    (
        SELECT TOP 1 da2.resultado_atencion
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_ATENCION da2 ON fe2.id_atencion = da2.id_atencion
        JOIN dbo.DIM_TIEMPO   dt2 ON fe2.id_tiempo   = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR    dl2 ON fe2.id_lugar    = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY da2.resultado_atencion
        ORDER BY COUNT(*) DESC
    )                                               AS resultado_atencion_predominante,

    (
        SELECT TOP 1 da2.tipo_resultado
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_ATENCION da2 ON fe2.id_atencion = da2.id_atencion
        JOIN dbo.DIM_TIEMPO   dt2 ON fe2.id_tiempo   = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR    dl2 ON fe2.id_lugar    = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY da2.tipo_resultado
        ORDER BY COUNT(*) DESC
    )                                               AS tipo_resultado_predominante,

    -- Método
    (
        SELECT TOP 1 dm2.metodo
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO  dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY dm2.metodo
        ORDER BY COUNT(*) DESC
    )                                               AS metodo_predominante,

    (
        SELECT TOP 1 dm2.nivel_letalidad
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO  dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY dm2.nivel_letalidad
        ORDER BY COUNT(*) DESC
    )                                               AS nivel_letalidad_predominante,

    -- Zona predominante (nueva)
    (
        SELECT TOP 1 dl2.zona_evento
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar  = dl2.id_Lugar
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo = dt2.id_tiempo
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY dl2.zona_evento
        ORDER BY COUNT(*) DESC
    )                                               AS zona_predominante,

    -- Persona
    AVG(CAST(dp.edad    AS FLOAT))                  AS edad_promedio,
    AVG(CAST(dp.estrato AS FLOAT))                  AS estrato_promedio,

    (
        SELECT TOP 1 dp2.genero
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY dp2.genero
        ORDER BY COUNT(*) DESC
    )                                               AS genero_predominante,

    (
        SELECT TOP 1 dp2.grupo_etario
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio = dt.anio AND dt2.mes = dt.mes
        GROUP BY dp2.grupo_etario
        ORDER BY COUNT(*) DESC
    )                                               AS grupo_etario_predominante,

    -- Contexto
    AVG(CAST(dc.tiene_antecedente       AS FLOAT))  AS antecedentes_mental_promedio,
    AVG(CAST(dc.consume_sustancias_flag AS FLOAT))  AS consumo_sustancias_promedio

FROM dbo.FACT_EVENTO fe
JOIN dbo.DIM_TIEMPO   dt ON fe.id_tiempo   = dt.id_tiempo
JOIN dbo.DIM_LUGAR    dl ON fe.id_lugar    = dl.id_Lugar
JOIN dbo.DIM_PERSONA  dp ON fe.id_persona  = dp.id_persona
JOIN dbo.DIM_METODO   dm ON fe.id_metodo   = dm.id_metodo
JOIN dbo.DIM_ATENCION da ON fe.id_atencion = da.id_atencion
JOIN dbo.DIM_CONTEXTO dc ON fe.id_contexto = dc.id_contexto

GROUP BY
    dt.anio,
    dt.mes,
    dt.trimestre,
    dt.nombre_mes,
    dl.municipio_evento;