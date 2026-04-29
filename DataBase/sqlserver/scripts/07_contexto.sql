-- ============================================================
--  OBSERVATORIO 
--  Dimensión de contexto clínico
--  Fuente   : antecedentes_salud_mental, consumo_sustancias
--  Derivadas: tiene_antecedente, consume_sustancias_flag
--
--  Los flags booleanos permiten filtros rápidos de
--  inclusión / exclusión sin lógica condicional en cada consulta
-- ============================================================

USE ObservatorioDW;
GO

CREATE TABLE DIM_CONTEXTO (
    id_contexto                 INT          NOT NULL IDENTITY(1,1),
    antecedentes_salud_mental   VARCHAR(80)  NOT NULL,
    consumo_sustancias          VARCHAR(60)  NOT NULL,
    tiene_antecedente           BIT          NOT NULL,   -- 1 si antecedente <> 'Ninguno'
    consume_sustancias_flag     BIT          NOT NULL    -- 1 si consumo     <> 'Ninguno'

    CONSTRAINT PK_DIM_CONTEXTO  PRIMARY KEY (id_contexto)
);
GO