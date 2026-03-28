USE ObservatorioDW;
GO

CREATE TABLE fact.fact_intento_suicidio (
    id_hecho INT IDENTITY(1,1) PRIMARY KEY,
    
    id_tiempo INT,
    id_municipio INT,
    id_paciente INT,
    id_resultado INT,
    
    hospitalizado BIT,
    cantidad_casos INT DEFAULT 1,

    CONSTRAINT fk_tiempo FOREIGN KEY (id_tiempo) REFERENCES dim.dim_tiempo(id_tiempo),
    CONSTRAINT fk_municipio FOREIGN KEY (id_municipio) REFERENCES dim.dim_municipio(id_municipio),
    CONSTRAINT fk_paciente FOREIGN KEY (id_paciente) REFERENCES dim.dim_paciente(id_paciente),
    CONSTRAINT fk_resultado FOREIGN KEY (id_resultado) REFERENCES dim.dim_resultado(id_resultado)
);