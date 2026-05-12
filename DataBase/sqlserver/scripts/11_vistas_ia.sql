USE ObservatorioDW;
GO

CREATE OR ALTER VIEW dbo.vw_brotes AS
SELECT
    -- Temporales
    dt.anio,
    dt.mes,
    dt.trimestre,
    dt.nombre_mes,

    -- Lugar
    dl.municipio_evento,
    dl.zona_evento,

    -- Volumen (TARGET)
    COUNT(fe.id_registro)                               AS total_eventos,

    -- Hospitalización
    SUM(CAST(fe.hospitalizado AS INT))                AS hospitalizados,
    AVG(CAST(fe.hospitalizado AS FLOAT))              AS tasa_hospitalizacion,

    -- Método predominante
    (
        SELECT TOP 1 dm2.metodo
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar  = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND dt2.mes              = dt.mes
        GROUP BY dm2.metodo
        ORDER BY COUNT(*) DESC
    )                                                   AS metodo_predominante,

    -- Letalidad (varchar → moda en lugar de promedio)
    (
        SELECT TOP 1 dm2.nivel_letalidad
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_METODO dm2 ON fe2.id_metodo = dm2.id_metodo
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar  = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND dt2.mes              = dt.mes
        GROUP BY dm2.nivel_letalidad
        ORDER BY COUNT(*) DESC
    )                                                   AS nivel_letalidad_predominante,

    -- Género predominante
    (
        SELECT TOP 1 dp2.genero
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND dt2.mes              = dt.mes
        GROUP BY dp2.genero
        ORDER BY COUNT(*) DESC
    )                                                   AS genero_predominante,

    -- Grupo etario predominante
    (
        SELECT TOP 1 dp2.grupo_etario
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND dt2.mes              = dt.mes
        GROUP BY dp2.grupo_etario
        ORDER BY COUNT(*) DESC
    )                                                   AS grupo_etario_predominante,

    -- Situación sentimental predominante
    (
        SELECT TOP 1 dp2.situacion_sentimental
        FROM dbo.FACT_EVENTO fe2
        JOIN dbo.DIM_PERSONA dp2 ON fe2.id_persona = dp2.id_persona
        JOIN dbo.DIM_TIEMPO  dt2 ON fe2.id_tiempo  = dt2.id_tiempo
        JOIN dbo.DIM_LUGAR   dl2 ON fe2.id_lugar   = dl2.id_Lugar
        WHERE dl2.municipio_evento = dl.municipio_evento
          AND dt2.anio             = dt.anio
          AND dt2.mes              = dt.mes
        GROUP BY dp2.situacion_sentimental
        ORDER BY COUNT(*) DESC
    )                                                   AS situacion_sentimental_predominante,

    -- Promedios numéricos persona
    AVG(CAST(dp.edad AS FLOAT))                         AS edad_promedio,
    AVG(CAST(dp.estrato AS FLOAT))                      AS estrato_promedio,

    -- Contexto (nombres corregidos)
    AVG(CAST(dc.tiene_antecedente AS FLOAT))            AS antecedentes_mental_promedio,
    AVG(CAST(dc.consume_sustancias_flag AS FLOAT))      AS consumo_sustancias_promedio,

    -- Movilidad
    AVG(CAST(dl.mismo_municipio AS FLOAT))              AS tasa_mismo_municipio

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
    dl.municipio_evento,
    dl.zona_evento;