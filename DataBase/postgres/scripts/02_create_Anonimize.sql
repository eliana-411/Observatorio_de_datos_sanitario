



-- ============================================================
-- ZONA DE INGESTA ANONIMIZADA)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS staging;


-- ============================================================
--  TABLA PRINCIPAL: EVENTOS ANONIMIZADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS staging.eventos_anonimizados (

    id SERIAL PRIMARY KEY,

    -- ===============================
    -- VARIABLES DEL NEGOCIO (SIN PII)
    -- ===============================
    
    edad TEXT,
    genero TEXT,
    estrato TEXT,
    grupo_poblacional TEXT,
    estado_civil TEXT,
    situacion_sentimental TEXT,

    fecha TEXT,  -- se transforma en ETL

    municipio_evento TEXT,
    municipio_origen TEXT,
    zona_evento TEXT,

    metodo TEXT,
    resultado_atencion TEXT,
    hospitalizado TEXT,  -- ETL lo convierte a boolean

    antecedentes_salud_mental TEXT,
    consumo_sustancias TEXT,

    cantidad_intentos TEXT,

    -- ===============================
    -- METADATA
    -- ===============================
    
    fuente TEXT,  -- de dónde viene el dataset
    fecha_ingestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- ===============================
    -- FLEXIBILIDAD MULTI-FUENTE
    -- ===============================
    
    data_extra JSONB
);


-- ============================================================
-- ÍNDICES (RENDIMIENTO)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_eventos_fecha 
ON staging.eventos_anonimizados(fecha);

CREATE INDEX IF NOT EXISTS idx_eventos_fuente 
ON staging.eventos_anonimizados(fuente);

CREATE INDEX IF NOT EXISTS idx_eventos_data_extra 
ON staging.eventos_anonimizados USING GIN (data_extra);

