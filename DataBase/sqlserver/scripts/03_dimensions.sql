USE ObservatorioDW;
GO

CREATE TABLE dim.dim_tiempo (
    id_tiempo INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATE NOT NULL,
    anio INT,
    mes INT,
    nombre_mes VARCHAR(20),
    dia INT,
    semana INT,
    trimestre INT
);
CREATE TABLE dim.dim_municipio (
    id_municipio INT IDENTITY(1,1) PRIMARY KEY,
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    region VARCHAR(100)
);
CREATE TABLE dim.dim_paciente (
    id_paciente INT IDENTITY(1,1) PRIMARY KEY,
    edad INT,
    sexo CHAR(1),
    grupo_etario VARCHAR(50)
);
CREATE TABLE dim.dim_resultado (
    id_resultado INT IDENTITY(1,1) PRIMARY KEY,
    resultado_atencion VARCHAR(100)
);