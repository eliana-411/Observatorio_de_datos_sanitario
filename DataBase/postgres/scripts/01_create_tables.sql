
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(50)
);


CREATE TABLE datos_anonimizados (
    id SERIAL PRIMARY KEY,
    municipio VARCHAR(100),
    fecha DATE,
    cantidad_casos INT
);