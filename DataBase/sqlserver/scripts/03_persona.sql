-- ============================================================
--  OBSERVATORIO DE SALUD PÚBLICA - CALDAS
--  Paso 3: Dimensión de persona
--  Fuente   : genero, edad, estrato, grupo_poblacional,
--             estado_civil, situacion_sentimental
--  Derivada : grupo_etario (calculada a partir de edad)
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_PERSONA (
    id_persona              INT          NOT NULL IDENTITY(1,1),
    genero                  VARCHAR(30)  NOT NULL,
    edad                    INT          NOT NULL,
    grupo_etario            VARCHAR(30)  NOT NULL,   -- Adolescente / Joven / Adulto / Adulto mayor
    estrato                 INT          NOT NULL,   -- 1 a 6
    grupo_poblacional       VARCHAR(60)  NOT NULL,
    estado_civil            VARCHAR(30)  NOT NULL,
    situacion_sentimental   VARCHAR(60)  NOT NULL

    CONSTRAINT PK_DIM_PERSONA  PRIMARY KEY (id_persona),
    CONSTRAINT CK_EDAD         CHECK (edad BETWEEN 0 AND 120),
    CONSTRAINT CK_ESTRATO      CHECK (estrato BETWEEN 1 AND 6)
);
GO