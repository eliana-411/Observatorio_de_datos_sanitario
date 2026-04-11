-- ============================================================
--  OBSERVATORIO DE SALUD PÚBLICA - CALDAS
--  Paso 8: Tabla de hechos — FACT_EVENTO
--
--  Granularidad : un registro = un evento de intento de suicidio
--  Métrica      : hospitalizado (BIT)
--
--  IMPORTANTE: ejecutar DESPUÉS de todos los scripts de
--  dimensiones (02 al 07), ya que las FK las referencian
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE FACT_EVENTO (
    id_registro     INT  NOT NULL,
    id_tiempo       INT  NOT NULL,
    id_persona      INT  NOT NULL,
    id_lugar        INT  NOT NULL,
    id_metodo       INT  NOT NULL,
    id_atencion     INT  NOT NULL,
    id_contexto     INT  NOT NULL,
    hospitalizado   BIT  NOT NULL    -- 1 = Sí  /  0 = No

    CONSTRAINT PK_FACT_EVENTO   PRIMARY KEY (id_registro),
    CONSTRAINT FK_FACT_TIEMPO   FOREIGN KEY (id_tiempo)   REFERENCES DIM_TIEMPO   (id_tiempo),
    CONSTRAINT FK_FACT_PERSONA  FOREIGN KEY (id_persona)  REFERENCES DIM_PERSONA  (id_persona),
    CONSTRAINT FK_FACT_LUGAR    FOREIGN KEY (id_lugar)    REFERENCES DIM_LUGAR    (id_lugar),
    CONSTRAINT FK_FACT_METODO   FOREIGN KEY (id_metodo)   REFERENCES DIM_METODO   (id_metodo),
    CONSTRAINT FK_FACT_ATENCION FOREIGN KEY (id_atencion) REFERENCES DIM_ATENCION (id_atencion),
    CONSTRAINT FK_FACT_CONTEXTO FOREIGN KEY (id_contexto) REFERENCES DIM_CONTEXTO (id_contexto)
);
GO