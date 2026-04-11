-- ============================================================
--  OBSERVATORIO DE SALUD PÚBLICA - CALDAS
--  Paso 4: Dimensión de lugar
--  Fuente   : municipio_evento, municipio_origen, zona_evento
--  Derivada : mismo_municipio
--             (1 cuando el evento ocurre en el municipio
--              de residencia de la persona)
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_LUGAR (
    id_lugar            INT          NOT NULL IDENTITY(1,1),
    municipio_evento    VARCHAR(60)  NOT NULL,
    municipio_origen    VARCHAR(60)  NOT NULL,
    zona_evento         VARCHAR(30)  NOT NULL,   -- Urbana / Rural / Rural disperso
    departamento        VARCHAR(60)  NOT NULL CONSTRAINT DF_LUGAR_DEPTO DEFAULT 'Caldas',
    mismo_municipio     BIT          NOT NULL    -- 1 = evento en municipio de residencia

    CONSTRAINT PK_DIM_LUGAR    PRIMARY KEY (id_lugar),
    CONSTRAINT CK_ZONA_EVENTO  CHECK (zona_evento IN ('Urbana', 'Rural', 'Rural disperso'))
);
GO