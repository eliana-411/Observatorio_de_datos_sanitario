USE ObservatorioDW;
GO
CREATE INDEX idx_tiempo ON fact.fact_intento_suicidio(id_tiempo);
CREATE INDEX idx_municipio ON fact.fact_intento_suicidio(id_municipio);
CREATE INDEX idx_paciente ON fact.fact_intento_suicidio(id_paciente);