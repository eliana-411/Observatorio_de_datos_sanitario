-- ============================================================
--  OBSERVATORIO 
--  Índices
--
--  Se crean índices sobre:
--    - Cada FK de FACT_EVENTO   → acelera los JOINs
--    - Columnas de filtro frecuente en las dimensiones
--      → acelera WHERE y GROUP BY en consultas analíticas
-- ============================================================

USE ObservatorioDW;
GO

-- ----------------------------------------------------------
--  FACT_EVENTO: un índice por cada llave foránea
-- ----------------------------------------------------------
CREATE INDEX IX_FACT_TIEMPO    ON FACT_EVENTO (id_tiempo);
CREATE INDEX IX_FACT_PERSONA   ON FACT_EVENTO (id_persona);
CREATE INDEX IX_FACT_LUGAR     ON FACT_EVENTO (id_lugar);
CREATE INDEX IX_FACT_METODO    ON FACT_EVENTO (id_metodo);
CREATE INDEX IX_FACT_ATENCION  ON FACT_EVENTO (id_atencion);
CREATE INDEX IX_FACT_CONTEXTO  ON FACT_EVENTO (id_contexto);
GO

-- ----------------------------------------------------------
--  DIM_TIEMPO: filtros temporales frecuentes
-- ----------------------------------------------------------
CREATE INDEX IX_TIEMPO_ANIO       ON DIM_TIEMPO (anio);
CREATE INDEX IX_TIEMPO_MES        ON DIM_TIEMPO (mes);
CREATE INDEX IX_TIEMPO_TRIMESTRE  ON DIM_TIEMPO (trimestre);
CREATE INDEX IX_TIEMPO_DIA_SEM    ON DIM_TIEMPO (dia_semana);
GO

-- ----------------------------------------------------------
--  DIM_LUGAR: filtros geográficos frecuentes
-- ----------------------------------------------------------
CREATE INDEX IX_LUGAR_MUNICIPIO   ON DIM_LUGAR (municipio_evento);
CREATE INDEX IX_LUGAR_ZONA        ON DIM_LUGAR (zona_evento);
GO

-- ----------------------------------------------------------
--  DIM_PERSONA: filtros demográficos frecuentes
-- ----------------------------------------------------------
CREATE INDEX IX_PERSONA_GENERO      ON DIM_PERSONA (genero);
CREATE INDEX IX_PERSONA_ETARIO      ON DIM_PERSONA (grupo_etario);
CREATE INDEX IX_PERSONA_ESTRATO     ON DIM_PERSONA (estrato);
CREATE INDEX IX_PERSONA_GRUPO_POB   ON DIM_PERSONA (grupo_poblacional);
GO

-- ----------------------------------------------------------
--  DIM_METODO: filtro por nivel de riesgo
-- ----------------------------------------------------------
CREATE INDEX IX_METODO_LETALIDAD  ON DIM_METODO (nivel_letalidad);
GO

-- ----------------------------------------------------------
--  DIM_CONTEXTO: filtros booleanos
-- ----------------------------------------------------------
CREATE INDEX IX_CONTEXTO_ANTECEDENTE  ON DIM_CONTEXTO (tiene_antecedente);
CREATE INDEX IX_CONTEXTO_CONSUMO      ON DIM_CONTEXTO (consume_sustancias_flag);
GO
