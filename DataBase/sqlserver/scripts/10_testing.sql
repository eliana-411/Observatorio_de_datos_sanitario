-- ----------------------------------------------------------
--  VERIFICACIÓN FINAL
--  Lista todas las tablas e índices creados
-- ----------------------------------------------------------
SELECT
    t.TABLE_NAME                                AS tabla,
    COUNT(DISTINCT c.COLUMN_NAME)               AS columnas,
    COUNT(DISTINCT i.name)                      AS indices,
    CASE
        WHEN t.TABLE_NAME = 'FACT_EVENTO' THEN '★ Hechos'
        ELSE '◇ Dimensión'
    END                                         AS tipo
FROM INFORMATION_SCHEMA.TABLES  t
JOIN INFORMATION_SCHEMA.COLUMNS c  ON t.TABLE_NAME = c.TABLE_NAME
LEFT JOIN sys.indexes           i  ON OBJECT_NAME(i.object_id) = t.TABLE_NAME
                                   AND i.is_primary_key = 0
WHERE t.TABLE_TYPE = 'BASE TABLE'
GROUP BY t.TABLE_NAME
ORDER BY tipo DESC, t.TABLE_NAME;
GO