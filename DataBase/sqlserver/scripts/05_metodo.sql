-- ============================================================
--  OBSERVATORIO DE SALUD PÚBLICA - CALDAS
--  Paso 5: Dimensión de método
--  Fuente   : metodo
--  Derivadas: tipo_metodo, nivel_letalidad
--
--  tipo_metodo agrupa los 10 métodos del dataset en categorías:
--    Intoxicación / Violencia física / Asfixia / Otro
--
--  nivel_letalidad clasifica el riesgo letal de cada método:
--    Alto / Bajo
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_METODO (
    id_metodo           INT           NOT NULL IDENTITY(1,1),
    metodo              VARCHAR(100)  NOT NULL,
    tipo_metodo         VARCHAR(60)   NOT NULL,
    nivel_letalidad     VARCHAR(10)   NOT NULL   -- 'Alto' / 'Bajo'

    CONSTRAINT PK_DIM_METODO         PRIMARY KEY (id_metodo),
    CONSTRAINT UQ_DIM_METODO_METODO  UNIQUE      (metodo),
    CONSTRAINT CK_NIVEL_LETALIDAD    CHECK (nivel_letalidad IN ('Alto', 'Bajo'))
);
GO