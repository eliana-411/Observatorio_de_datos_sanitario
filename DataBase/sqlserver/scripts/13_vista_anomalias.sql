USE ObservatorioDW;
GO

-- ============================================================================
-- VISTA: dbo.vw_anomalias
-- ============================================================================
-- Descripción:
--   Vista para alimentar modelo de detección de anomalías (IsolationForest)
--   en intentos de suicidio. Integra datos de FACT_EVENTO con todas las
--   dimensiones: tiempo, persona, lugar, método, atención y contexto.
--
-- Objetivo:
--   Detectar anomalías geográficas, temporales, demográficas, clínicas 
--   y contextuales en eventos de intentos de suicidio.
--
-- Última actualización: 2026-05-13
-- ============================================================================

IF OBJECT_ID('dbo.vw_anomalias', 'V') IS NOT NULL
    DROP VIEW dbo.vw_anomalias;
GO

CREATE VIEW dbo.vw_anomalias AS
SELECT
    -- ─────────────────────────────────────────────────────────────────────
    -- IDENTIFICADORES
    -- ─────────────────────────────────────────────────────────────────────
    fe.id_registro,
    fe.id_tiempo,
    fe.id_persona,
    fe.id_lugar,
    fe.id_metodo,
    fe.id_atencion,
    fe.id_contexto,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES TEMPORALES (de DIM_TIEMPO)
    -- ─────────────────────────────────────────────────────────────────────
    dt.fecha,
    dt.anio,
    dt.mes,
    dt.trimestre,
    dt.nombre_mes,
    dt.dia_semana,
    ISNULL(dt.es_fin_de_semana, 0) AS es_fin_de_semana,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES DEMOGRÁFICAS (de DIM_PERSONA)
    -- ─────────────────────────────────────────────────────────────────────
    dp.genero,
    dp.edad,
    dp.grupo_etario,
    dp.estrato,
    dp.estado_civil,
    dp.grupo_poblacional,
    dp.situacion_sentimental,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES GEOGRÁFICAS (de DIM_LUGAR)
    -- ─────────────────────────────────────────────────────────────────────
    dl.municipio_evento,
    dl.municipio_origen,
    dl.zona_evento,
    dl.departamento,
    ISNULL(dl.mismo_municipio, 0) AS mismo_municipio,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES CLÍNICAS / MÉTODO (de DIM_METODO)
    -- ─────────────────────────────────────────────────────────────────────
    dm.metodo,
    dm.tipo_metodo,
    dm.nivel_letalidad,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES DE ATENCIÓN (de DIM_ATENCION)
    -- ─────────────────────────────────────────────────────────────────────
    da.resultado_atencion,
    da.tipo_resultado,
    ISNULL(da.requirio_hospitalizacion, 0) AS requirio_hospitalizacion,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES DE HOSPITALIZACIÓN (de FACT_EVENTO)
    -- ─────────────────────────────────────────────────────────────────────
    ISNULL(fe.hospitalizado, 0) AS hospitalizado,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES CONTEXTUALES (de DIM_CONTEXTO)
    -- ─────────────────────────────────────────────────────────────────────
    dc.antecedentes_salud_mental,
    dc.consumo_sustancias,
    dc.tiene_antecedente,
    dc.consume_sustancias_flag,
    
    -- ─────────────────────────────────────────────────────────────────────
    -- VARIABLES OPERATIVAS (de FACT_EVENTO)
    -- ─────────────────────────────────────────────────────────────────────
    fe.cantidad_intentos

FROM
    -- TABLA DE HECHOS (CENTRAL)
    dbo.FACT_EVENTO fe
    
    -- INNER JOIN CON DIMENSIONES
    INNER JOIN dbo.DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    INNER JOIN dbo.DIM_PERSONA dp ON fe.id_persona = dp.id_persona
    INNER JOIN dbo.DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    INNER JOIN dbo.DIM_METODO dm ON fe.id_metodo = dm.id_metodo
    INNER JOIN dbo.DIM_ATENCION da ON fe.id_atencion = da.id_atencion
    INNER JOIN dbo.DIM_CONTEXTO dc ON fe.id_contexto = dc.id_contexto

WHERE
    -- Filtros opcionales para mejorar calidad de datos
    -- Incluir solo registros con información completa
    dt.fecha IS NOT NULL
    AND dp.edad > 0
    AND fe.cantidad_intentos > 0;

GO

-- ============================================================================
-- VALIDACIÓN DE LA VISTA
-- ============================================================================
-- Ejecutar después de crear:
-- SELECT TOP 100 * FROM dbo.vw_anomalias;
-- SELECT COUNT(*) FROM dbo.vw_anomalias;
-- ============================================================================
