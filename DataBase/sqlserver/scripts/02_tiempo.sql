-- ============================================================
--  OBSERVATORIO 
--  Dimensión de tiempo
--  Fuente   : columna [fecha] del dataset original
--  Derivadas: anio, mes, trimestre, nombre_mes,
--             dia_semana, es_fin_de_semana
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_TIEMPO (
    id_tiempo           INT          NOT NULL IDENTITY(1,1),
    fecha               DATE         NOT NULL,
    anio                INT          NOT NULL,
    mes                 INT          NOT NULL,    -- 1 a 12
    trimestre           INT          NOT NULL,    -- 1 a 4
    nombre_mes          VARCHAR(20)  NOT NULL,    -- 'Enero', 'Febrero'...
    dia_semana          VARCHAR(20)  NOT NULL,    -- 'Lunes', 'Martes'...
    es_fin_de_semana    BIT          NOT NULL     -- 1 = sábado o domingo

    CONSTRAINT PK_DIM_TIEMPO       PRIMARY KEY (id_tiempo),
    CONSTRAINT UQ_DIM_TIEMPO_FECHA UNIQUE      (fecha)
);
GO