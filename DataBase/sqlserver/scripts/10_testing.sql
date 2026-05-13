USE ObservatorioDW;
DELETE FROM FACT_EVENTO;
DELETE FROM DIM_ATENCION;
DELETE FROM DIM_CONTEXTO;
DELETE FROM DIM_LUGAR;
DELETE FROM DIM_METODO;
DELETE FROM DIM_TIEMPO;
DELETE FROM DIM_PERSONA;
DBCC CHECKIDENT ('DIM_PERSONA',  RESEED, 0);
DBCC CHECKIDENT ('DIM_TIEMPO',   RESEED, 0);
DBCC CHECKIDENT ('DIM_LUGAR',    RESEED, 0);
DBCC CHECKIDENT ('DIM_METODO',   RESEED, 0);
DBCC CHECKIDENT ('DIM_ATENCION', RESEED, 0);
DBCC CHECKIDENT ('DIM_CONTEXTO', RESEED, 0);

SELECT COUNT(*) FROM DIM_PERSONA;
-- Paso 1: agregar y poblar
ALTER TABLE dbo.DIM_TIEMPO 
ADD numero_semana INT NULL;

UPDATE dbo.DIM_TIEMPO 
SET numero_semana = DATEPART(ISO_WEEK, fecha);

ALTER TABLE dbo.DIM_TIEMPO 
ALTER COLUMN numero_semana INT NOT NULL;

-- Paso 2: verificar
SELECT TOP 50 
    fecha, anio, mes, numero_semana, es_fin_de_semana
FROM dbo.DIM_TIEMPO
ORDER BY fecha;

SELECT 
    municipio_evento,
    AVG(tasa_mismo_municipio) AS promedio_tasa,
    MIN(tasa_mismo_municipio) AS minimo,
    MAX(tasa_mismo_municipio) AS maximo
FROM dbo.vw_demanda_semanal
GROUP BY municipio_evento
ORDER BY promedio_tasa DESC

SELECT TOP 3 
    municipio_evento, 
    zona_predominante 
FROM dbo.vw_demanda