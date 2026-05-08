-- ============================================================
--  OBSERVATORIO DE DATOS SANITARIOS
--  Vistas del Data Warehouse para IA
--
--  Este script crea las vistas necesarias para el microservicio
--  de IA: vw_brotes, vw_demanda, vw_anomalias
--
--  Ejecutar después de crear todas las tablas del DW
-- ============================================================

USE ObservatorioDW;
GO

-- ============================================================
--  VISTA: vw_brotes
--  Propósito: Detectar brotes agrupando por semana y municipio
-- ============================================================

CREATE OR ALTER VIEW vw_brotes AS
WITH brotes_base AS (
    SELECT
        DATEPART(WEEK, dt.fecha) as numero_semana,
        dt.anio,
        dt.mes,
        dl.municipio_evento,
        dl.zona_evento,
        dl.departamento,
        COUNT(fe.id_registro) as total_eventos,
        SUM(CAST(fe.hospitalizado AS INT)) as hospitalizados,
        AVG(CAST(fe.hospitalizado AS FLOAT)) as tasa_hospitalizacion,
        AVG(dp.edad) as edad_promedio,
        AVG(CAST(dc.tiene_antecedente AS FLOAT)) as antecedentes_mental_promedio,
        AVG(CAST(dc.consume_sustancias_flag AS FLOAT)) as consumo_sustancias_promedio
    FROM FACT_EVENTO fe
    JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    JOIN DIM_PERSONA dp ON fe.id_persona = dp.id_persona
    JOIN DIM_CONTEXTO dc ON fe.id_contexto = dc.id_contexto
    WHERE dl.departamento = 'Caldas'
    GROUP BY DATEPART(WEEK, dt.fecha), dt.anio, dt.mes, dl.municipio_evento, dl.zona_evento, dl.departamento
),
metodo_predominante AS (
    SELECT
        DATEPART(WEEK, dt.fecha) as numero_semana,
        dt.anio,
        dl.municipio_evento,
        dm.metodo,
        COUNT(*) as frecuencia,
        ROW_NUMBER() OVER (PARTITION BY DATEPART(WEEK, dt.fecha), dt.anio, dl.municipio_evento
                          ORDER BY COUNT(*) DESC) as rn
    FROM FACT_EVENTO fe
    JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    JOIN DIM_METODO dm ON fe.id_metodo = dm.id_metodo
    WHERE dl.departamento = 'Caldas'
    GROUP BY DATEPART(WEEK, dt.fecha), dt.anio, dl.municipio_evento, dm.metodo
),
genero_predominante AS (
    SELECT
        DATEPART(WEEK, dt.fecha) as numero_semana,
        dt.anio,
        dl.municipio_evento,
        dp.genero,
        COUNT(*) as frecuencia,
        ROW_NUMBER() OVER (PARTITION BY DATEPART(WEEK, dt.fecha), dt.anio, dl.municipio_evento
                          ORDER BY COUNT(*) DESC) as rn
    FROM FACT_EVENTO fe
    JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    JOIN DIM_PERSONA dp ON fe.id_persona = dp.id_persona
    WHERE dl.departamento = 'Caldas'
    GROUP BY DATEPART(WEEK, dt.fecha), dt.anio, dl.municipio_evento, dp.genero
)
SELECT
    bb.numero_semana,
    bb.anio,
    bb.mes,
    bb.municipio_evento,
    bb.zona_evento,
    bb.departamento,
    bb.total_eventos,
    bb.hospitalizados,
    bb.tasa_hospitalizacion,
    mp.metodo as metodo_predominante,
    bb.edad_promedio,
    gp.genero as genero_predominante,
    bb.antecedentes_mental_promedio,
    bb.consumo_sustancias_promedio
FROM brotes_base bb
LEFT JOIN metodo_predominante mp ON bb.numero_semana = mp.numero_semana
                                  AND bb.anio = mp.anio
                                  AND bb.municipio_evento = mp.municipio_evento
                                  AND mp.rn = 1
LEFT JOIN genero_predominante gp ON bb.numero_semana = gp.numero_semana
                                  AND bb.anio = gp.anio
                                  AND bb.municipio_evento = gp.municipio_evento
                                  AND gp.rn = 1;
GO

-- ============================================================
--  VISTA: vw_demanda
--  Propósito: Predecir demanda de servicios de salud mental
-- ============================================================

CREATE OR ALTER VIEW vw_demanda AS
SELECT
    dt.fecha,
    dt.anio,
    dt.mes,
    dt.trimestre,
    dt.dia_semana,
    dt.es_fin_de_semana,
    dl.municipio_evento,
    dl.zona_evento,
    COUNT(fe.id_registro) as total_eventos,
    SUM(CAST(fe.hospitalizado AS INT)) as hospitalizados,
    AVG(dp.edad) as edad_promedio,
    AVG(dp.estrato) as estrato_promedio,
    -- Porcentajes por grupo etario
    SUM(CASE WHEN dp.grupo_etario = 'Joven' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as porcentaje_jovenes,
    SUM(CASE WHEN dp.grupo_etario = 'Adulto' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as porcentaje_adultos,
    SUM(CASE WHEN dp.grupo_etario = 'Adulto mayor' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as porcentaje_mayores,
    -- Porcentajes por género
    SUM(CASE WHEN dp.genero = 'Masculino' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as porcentaje_masculino,
    SUM(CASE WHEN dp.genero = 'Femenino' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as porcentaje_femenino,
    -- Promedios de flags clínicos
    AVG(CAST(dc.consume_sustancias_flag AS FLOAT)) * 100 as consumo_sustancias_promedio,
    AVG(CAST(dc.tiene_antecedente AS FLOAT)) * 100 as antecedentes_mental_promedio
FROM FACT_EVENTO fe
JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
JOIN DIM_PERSONA dp ON fe.id_persona = dp.id_persona
JOIN DIM_CONTEXTO dc ON fe.id_contexto = dc.id_contexto
WHERE dl.departamento = 'Caldas'
GROUP BY dt.fecha, dt.anio, dt.mes, dt.trimestre, dt.dia_semana, dt.es_fin_de_semana,
         dl.municipio_evento, dl.zona_evento;
GO

-- ============================================================
--  VISTA: vw_anomalias
--  Propósito: Detectar anomalías en patrones
-- ============================================================

CREATE OR ALTER VIEW vw_anomalias AS
WITH datos_historicos AS (
    SELECT
        dl.municipio_evento,
        dt.fecha,
        COUNT(fe.id_registro) as eventos_diarios,
        AVG(CAST(fe.hospitalizado AS FLOAT)) as tasa_hosp_diaria,
        AVG(dp.edad) as edad_promedio_diaria
    FROM FACT_EVENTO fe
    JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    JOIN DIM_PERSONA dp ON fe.id_persona = dp.id_persona
    WHERE dl.departamento = 'Caldas'
      AND dt.fecha >= DATEADD(MONTH, -12, GETDATE())  -- Últimos 12 meses como baseline
    GROUP BY dl.municipio_evento, dt.fecha
),
metricas_historicas AS (
    SELECT
        municipio_evento,
        AVG(eventos_diarios) as promedio_eventos,
        STDEV(eventos_diarios) as std_eventos,
        AVG(tasa_hosp_diaria) as promedio_hosp,
        STDEV(tasa_hosp_diaria) as std_hosp,
        AVG(edad_promedio_diaria) as promedio_edad,
        STDEV(edad_promedio_diaria) as std_edad
    FROM datos_historicos
    GROUP BY municipio_evento
),
metricas_actuales AS (
    SELECT
        dt.fecha,
        dl.municipio_evento,
        COUNT(fe.id_registro) as total_eventos,
        SUM(CAST(fe.hospitalizado AS INT)) as hospitalizados,
        AVG(CAST(fe.hospitalizado AS FLOAT)) as tasa_hospitalizacion,
        AVG(dp.edad) as edad_promedio
    FROM FACT_EVENTO fe
    JOIN DIM_TIEMPO dt ON fe.id_tiempo = dt.id_tiempo
    JOIN DIM_LUGAR dl ON fe.id_lugar = dl.id_lugar
    JOIN DIM_PERSONA dp ON fe.id_persona = dp.id_persona
    WHERE dl.departamento = 'Caldas'
      AND dt.fecha >= DATEADD(MONTH, -1, GETDATE())  -- Último mes para análisis
    GROUP BY dt.fecha, dl.municipio_evento
)
SELECT
    ma.fecha,
    ma.municipio_evento,
    ma.total_eventos,
    ma.hospitalizados,
    ma.tasa_hospitalizacion,
    ma.edad_promedio,
    -- Cálculos de desviación
    (ma.total_eventos - mh.promedio_eventos) as desviacion_eventos,
    (ma.tasa_hospitalizacion - mh.promedio_hosp) as desviacion_hospitalizacion,
    (ma.edad_promedio - mh.promedio_edad) as desviacion_edad,
    -- Z-scores
    CASE WHEN mh.std_eventos > 0
         THEN (ma.total_eventos - mh.promedio_eventos) / mh.std_eventos
         ELSE 0 END as z_score_eventos,
    CASE WHEN mh.std_hosp > 0
         THEN (ma.tasa_hospitalizacion - mh.promedio_hosp) / mh.std_hosp
         ELSE 0 END as z_score_hospitalizacion,
    CASE WHEN mh.std_edad > 0
         THEN (ma.edad_promedio - mh.promedio_edad) / mh.std_edad
         ELSE 0 END as z_score_edad,
    -- Detección de anomalía (Z-score > 2)
    CASE WHEN (ABS(CASE WHEN mh.std_eventos > 0 THEN (ma.total_eventos - mh.promedio_eventos) / mh.std_eventos ELSE 0 END) > 2
              OR ABS(CASE WHEN mh.std_hosp > 0 THEN (ma.tasa_hospitalizacion - mh.promedio_hosp) / mh.std_hosp ELSE 0 END) > 2
              OR ABS(CASE WHEN mh.std_edad > 0 THEN (ma.edad_promedio - mh.promedio_edad) / mh.std_edad ELSE 0 END) > 2)
         THEN 1 ELSE 0 END as es_anomalia,
    -- Tipo de anomalía
    CASE WHEN ABS(CASE WHEN mh.std_eventos > 0 THEN (ma.total_eventos - mh.promedio_eventos) / mh.std_eventos ELSE 0 END) > 2 THEN 'volumen'
         WHEN ABS(CASE WHEN mh.std_hosp > 0 THEN (ma.tasa_hospitalizacion - mh.promedio_hosp) / mh.std_hosp ELSE 0 END) > 2 THEN 'severidad'
         WHEN ABS(CASE WHEN mh.std_edad > 0 THEN (ma.edad_promedio - mh.promedio_edad) / mh.std_edad ELSE 0 END) > 2 THEN 'demografia'
         ELSE 'normal' END as tipo_anomalia
FROM metricas_actuales ma
JOIN metricas_historicas mh ON ma.municipio_evento = mh.municipio_evento;
GO

-- ============================================================
--  Verificación de vistas creadas
-- ============================================================

SELECT 'vw_brotes' as vista, COUNT(*) as registros FROM vw_brotes
UNION ALL
SELECT 'vw_demanda' as vista, COUNT(*) as registros FROM vw_demanda
UNION ALL
SELECT 'vw_anomalias' as vista, COUNT(*) as registros FROM vw_anomalias;
GO

PRINT 'Vistas del DW creadas exitosamente para el microservicio de IA';
GO</content>
<parameter name="filePath">c:\Users\linaN\OneDrive\Documentos\Universidad\Semestre 11\Integrador\Observatorio_de_datos_sanitario\DataBase\sqlserver\scripts\11_vistas_ia.sql