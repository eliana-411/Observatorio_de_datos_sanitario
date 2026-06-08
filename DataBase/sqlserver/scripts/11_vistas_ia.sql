-- ============================================================
-- Vista: vw_brotes (versión actualizada)
-- Propósito: Datos agregados mensuales por municipio para
--            entrenamiento del modelo Prophet de brotes.
-- Granularidad: 1 fila por (municipio_evento × año × mes)
-- ============================================================
USE ObservatorioDW;
GO

CREATE OR ALTER VIEW dbo.vw_brotes AS

SELECT
    -- ── Dimensión temporal ────────────────────────────────────────────────
    DATEFROMPARTS(t.anio, t.mes, 1)     AS ds,
    t.anio,
    t.mes,
    t.trimestre,

    -- ── Dimensión geográfica ──────────────────────────────────────────────
    l.municipio_evento                  AS municipio,
    l.departamento,

    -- ── Variable objetivo ─────────────────────────────────────────────────
    COUNT(*)                            AS total_eventos,

    -- ── Regressores: temporalidad ─────────────────────────────────────────
    ROUND(AVG(CAST(t.es_fin_de_semana AS FLOAT)) * 100, 2)
                                        AS pct_fin_semana,

    -- ── Regressores: geografía ────────────────────────────────────────────
    ROUND(
        SUM(CASE WHEN l.zona_evento IN ('Rural', 'Rural Disperso')
                 THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_zona_rural,

    ROUND(
        AVG(CAST(CASE WHEN l.mismo_municipio = 0 THEN 1 ELSE 0 END AS FLOAT)) * 100, 2
    )                                   AS pct_fuera_municipio,

    -- ── Regressores: perfil demográfico ───────────────────────────────────
    ROUND(AVG(CAST(p.edad    AS FLOAT)), 2) AS edad_promedio,
    ROUND(AVG(CAST(p.estrato AS FLOAT)), 2) AS estrato_promedio,

    ROUND(
        SUM(CASE WHEN p.genero = 'Femenino' THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_femenino,

    -- Adolescentes (12-17) — grupo de alto riesgo
    ROUND(
        SUM(CASE WHEN p.grupo_poblacional = 'Adolescencia (12-17)'
                 THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_adolescente,

    -- ── Regressores: situación sentimental ────────────────────────────────
    -- Sin pareja activa (sin pareja + ruptura reciente + duelo)
    ROUND(
        SUM(CASE WHEN p.situacion_sentimental IN (
                        'Sin Pareja',
                        'Ruptura Reciente',
                        'Duelo Por Perdida De Pareja'
                    ) THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_sin_pareja,

    -- Relación conflictiva o en proceso de separación
    ROUND(
        SUM(CASE WHEN p.situacion_sentimental IN (
                        'Relacion Conflictiva',
                        'En Proceso De Separacion'
                    ) THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_relacion_conflictiva,

    -- ── Regressores: método ───────────────────────────────────────────────
    -- Intoxicación — método más frecuente y con perfil diferenciado
    ROUND(
        SUM(CASE WHEN m.metodo IN (
                        'Intoxicacion Por Medicamentos',
                        'Intoxicacion Por Otras Sustancias',
                        'Intoxicacion Por Plaguicidas'
                    ) THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_intoxicacion,

    -- Métodos de alta letalidad
    ROUND(
        SUM(CASE WHEN m.nivel_letalidad = 'Alto' THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_letalidad_alta,

    -- ── Regressores: atención clínica ─────────────────────────────────────
    ROUND(AVG(CAST(fe.hospitalizado AS FLOAT)) * 100, 2)
                                        AS pct_hospitalizado,

    ROUND(AVG(CAST(a.requirio_hospitalizacion AS FLOAT)) * 100, 2)
                                        AS pct_requirio_hospitalizacion,

    -- En tratamiento ambulatorio — indica continuidad de atención
    ROUND(
        SUM(CASE WHEN a.resultado_atencion = 'En Tratamiento Ambulatorio'
                 THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_en_tratamiento,

    -- Derivación a psiquiatría o traslado — casos más graves
    ROUND(
        SUM(CASE WHEN a.resultado_atencion IN (
                        'Remision A Psiquiatria',
                        'Traslado A Otro Centro',
                        'Hospitalizacion Prolongada'
                    ) THEN 1.0 ELSE 0.0 END)
        / COUNT(*) * 100, 2
    )                                   AS pct_derivacion,

    -- ── Regressores: contexto clínico ─────────────────────────────────────
    ROUND(AVG(CAST(c.tiene_antecedente       AS FLOAT)) * 100, 2)
                                        AS pct_antecedente_sm,

    ROUND(AVG(CAST(c.consume_sustancias_flag AS FLOAT)) * 100, 2)
                                        AS pct_sustancias

FROM      dbo.FACT_EVENTO  fe
JOIN      dbo.DIM_TIEMPO   t  ON fe.id_tiempo   = t.id_tiempo
JOIN      dbo.DIM_LUGAR    l  ON fe.id_lugar    = l.id_lugar
JOIN      dbo.DIM_PERSONA  p  ON fe.id_persona  = p.id_persona
JOIN      dbo.DIM_ATENCION a  ON fe.id_atencion = a.id_atencion
JOIN      dbo.DIM_CONTEXTO c  ON fe.id_contexto = c.id_contexto
JOIN      dbo.DIM_METODO   m  ON fe.id_metodo   = m.id_metodo

WHERE     t.fecha >= '2018-01-01'
  AND     t.fecha <  '2026-01-01'

GROUP BY
    t.anio,
    t.mes,
    t.trimestre,
    l.municipio_evento,
    l.departamento;
GO

-- ── Verificación post-creación ────────────────────────────────────────────
-- SELECT TOP 5 * FROM dbo.vw_brotes ORDER BY ds, municipio;
--
-- SELECT
--     COUNT(*)                  AS total_filas,
--     COUNT(DISTINCT municipio) AS municipios,
--     COUNT(DISTINCT ds)        AS meses,
--     MIN(ds) AS desde,
--     MAX(ds) AS hasta
-- FROM dbo.vw_brotes;