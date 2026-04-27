-- ============================================================
--  OBSERVATORIO 
--  Dimensión de atención
--  Fuente   : resultado_atencion
--  Derivadas: tipo_resultado, requirio_hospitalizacion
--
--  tipo_resultado agrupa los 7 resultados del dataset en:
--    Egreso / Continuidad de cuidado / Fallecido / Traslado
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_ATENCION (
    id_atencion                 INT          NOT NULL IDENTITY(1,1),
    resultado_atencion          VARCHAR(80)  NOT NULL,
    tipo_resultado              VARCHAR(40)  NOT NULL,
    requirio_hospitalizacion    BIT          NOT NULL

    CONSTRAINT PK_DIM_ATENCION             PRIMARY KEY (id_atencion),
    CONSTRAINT UQ_DIM_ATENCION_RESULTADO   UNIQUE      (resultado_atencion)
);
GO