from pathlib import Path

import pandas as pd
from utils.config import settings
from utils.database import get_sqlserver_engine

RAW_DIR = Path("../data/raw").resolve()
RAW_DIR.mkdir(parents=True, exist_ok=True)


def fetch_sql_table(query: str, filename: str) -> None:
    """Ejecuta una consulta y guarda el resultado como CSV en la carpeta raw."""
    engine = get_sqlserver_engine()
    df = pd.read_sql(query, engine)
    output_path = RAW_DIR / filename
    df.to_csv(output_path, index=False)
    print(f"Datos guardados en {output_path}")


def main() -> None:
    """Descarga datos desde el Data Warehouse hacia AI/data/raw."""
    departamento = settings.DEPARTAMENTO.strip()
    dept_filter = f"WHERE departamento = '{departamento}' " if departamento else ""

    queries = {
        "brotes.csv": (
            "SELECT numero_semana, anio, mes, municipio_evento, zona_evento, departamento, "
            "total_eventos, hospitalizados, tasa_hospitalizacion, metodo_predominante, "
            "edad_promedio, genero_predominante, antecedentes_mental_promedio, consumo_sustancias_promedio "
            "FROM vw_brotes "
            f"{dept_filter}"
            "ORDER BY municipio_evento, anio, numero_semana"
        ),
        "demanda.csv": (
            "SELECT fecha, anio, mes, trimestre, dia_semana, es_fin_de_semana, municipio_evento, zona_evento, "
            "total_eventos, hospitalizados, edad_promedio, estrato_promedio, "
            "porcentaje_jovenes, porcentaje_adultos, porcentaje_mayores, "
            "porcentaje_masculino, porcentaje_femenino, "
            "consumo_sustancias_promedio, antecedentes_mental_promedio "
            "FROM vw_demanda "
            f"{dept_filter}"
            "ORDER BY municipio_evento, fecha"
        ),
        "anomalias.csv": (
            "SELECT fecha, municipio_evento, total_eventos, hospitalizados, tasa_hospitalizacion, edad_promedio, "
            "desviacion_eventos, desviacion_hospitalizacion, desviacion_edad, "
            "z_score_eventos, z_score_hospitalizacion, z_score_edad, "
            "es_anomalia, tipo_anomalia "
            "FROM vw_anomalias "
            f"{dept_filter}"
            "ORDER BY municipio_evento, fecha"
        ),
    }

    for filename, query in queries.items():
        try:
            fetch_sql_table(query, filename)
        except Exception as exc:
            print(f"No se pudo descargar {filename}: {exc}")


if __name__ == "__main__":
    main()
