USE ObservatorioDW;
GO
CREATE OR ALTER VIEW dbo.vw_demanda_semanal AS
SELECT
    dt.anio,
    DATEPART(WEEK, dt.fecha)                        AS numero_semana,
    MIN(dt.fecha)                                   AS fecha_inicio_semana,
    MAX(CAST(dt.es_fin_de_semana AS INT))           AS tuvo_fin_de_semana,
    dl.municipio_evento,

    -- TARGET
    SUM(CAST(fe.hospitalizado AS INT))            AS total_hospitalizaciones,

    -- AGREGAR ESTA LÍNEA
    COUNT(fe.id_registro)                           AS total_eventos,

    AVG(CAST(fe.hospitalizado AS FLOAT))          AS tasa_hospitalizacion,

    (
        SELECT TOP 1 dl2.zona_evento
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_TIEMPO dt2 ON fe2.id_tiempo = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR  dl2 ON fe2.id_lugar  = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND DATEPART(WEEK, dt2.fecha) = DATEPART(WEEK, dt.fecha)
        GROUP BY dl2.zona_evento
        ORDER BY COUNT(*) DESC
    )                                               AS zona_predominante,

    (
        SELECT TOP 1 dm2.metodo
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO dt2 ON fe2.id_tiempo = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR  dl2 ON fe2.id_lugar  = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND DATEPART(WEEK, dt2.fecha) = DATEPART(WEEK, dt.fecha)
        GROUP BY dm2.metodo
        ORDER BY COUNT(*) DESC
    )                                               AS metodo_predominante,

    (
        SELECT TOP 1 dm2.nivel_letalidad
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO dt2 ON fe2.id_tiempo = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR  dl2 ON fe2.id_lugar  = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND DATEPART(WEEK, dt2.fecha) = DATEPART(WEEK, dt.fecha)
        GROUP BY dm2.nivel_letalidad
        ORDER BY COUNT(*) DESC
    )                                               AS nivel_letalidad_predominante,

    (
        SELECT TOP 1 dp2.genero
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND DATEPART(WEEK, dt2.fecha) = DATEPART(WEEK, dt.fecha)
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
          AND dt2.anio             = dt.anio
          AND DATEPART(WEEK, dt2.fecha) = DATEPART(WEEK, dt.fecha)
        GROUP BY dp2.grupo_etario
        ORDER BY COUNT(*) DESC
    )                                               AS grupo_etario_predominante,

    AVG(CAST(dp.edad AS FLOAT))                     AS edad_promedio,
    AVG(CAST(dp.estrato AS FLOAT))                  AS estrato_promedio,
    AVG(CAST(dc.tiene_antecedente AS FLOAT))        AS antecedentes_mental_promedio,
    AVG(CAST(dc.consume_sustancias_flag AS FLOAT))  AS consumo_sustancias_promedio,
    AVG(CAST(dl.mismo_municipio AS FLOAT))          AS tasa_mismo_municipio

FROM dbo.FACT_EVENTO fe
JOIN dbo.DIM_TIEMPO   dt ON fe.id_tiempo   = dt.id_tiempo
JOIN dbo.DIM_LUGAR    dl ON fe.id_lugar    = dl.id_Lugar
JOIN dbo.DIM_PERSONA  dp ON fe.id_persona  = dp.id_persona
JOIN dbo.DIM_METODO   dm ON fe.id_metodo   = dm.id_metodo
JOIN dbo.DIM_ATENCION da ON fe.id_atencion = da.id_atencion
JOIN dbo.DIM_CONTEXTO dc ON fe.id_contexto = dc.id_contexto

GROUP BY
    dt.anio,
    DATEPART(WEEK, dt.fecha),
    dl.municipio_evento;