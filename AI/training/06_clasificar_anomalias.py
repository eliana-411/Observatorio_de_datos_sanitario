# AI/training/06_clasificar_anomalias.py
"""
Clasificación de anomalías usando datos one-hot del CSV de predicciones.
Mapea columnas one-hot de vuelta a valores originales para clasificar.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json

BASE_DIR = Path(__file__).parent.parent
RESULTS_DIR = BASE_DIR / "data" / "results"
METRICS_DIR = BASE_DIR / "data" / "metrics"


def encontrar_ultimo_csv():
    archivos = sorted(RESULTS_DIR.glob("anomalies_predictions_*.csv"))
    if not archivos:
        raise FileNotFoundError("No se encontraron archivos de predicciones")
    return archivos[-1]


def one_hot_to_value(row, prefix):
    """Convierte columnas one-hot de vuelta a valor original."""
    cols = [c for c in row.index if c.startswith(f"{prefix}_")]
    for col in cols:
        if row[col] == 1:
            return col.replace(f"{prefix}_", "")
    return "Desconocido"


def clasificar_anomalia(row):
    """Clasifica usando datos one-hot mapeados."""

    # Mapear one-hot → valores originales
    genero = one_hot_to_value(row, "genero")
    metodo = one_hot_to_value(row, "metodo")
    nivel_letalidad = one_hot_to_value(row, "nivel_letalidad")
    estado_civil = one_hot_to_value(row, "estado_civil")
    situacion_sentimental = one_hot_to_value(row, "situacion_sentimental")
    antecedentes = one_hot_to_value(row, "antecedentes_salud_mental")
    consumo = one_hot_to_value(row, "consumo_sustancias")
    municipio_origen = one_hot_to_value(row, "municipio_origen")
    municipio_evento = one_hot_to_value(row, "municipio_evento")

    # Valores binarios
    tiene_antecedente = row.get('tiene_antecedente', 0) == 1 or row.get(
        'tiene_antecedente', False) == True
    hospitalizado = row.get('hospitalizado', 0) == 1 or row.get(
        'hospitalizado', False) == True
    mismo_municipio = row.get('mismo_municipio', 0) == 1 or row.get(
        'mismo_municipio', False) == True

    # 1. Primeriza + letalidad alta
    if not tiene_antecedente and nivel_letalidad == 'Alto':
        return {
            'tipo': 'Primeriza + letalidad alta',
            'descripcion': f'Primera vez con método de alta letalidad: {metodo}',
            'severidad': 'Alta',
            'categoria': 'Riesgo individual'
        }

    # 2. Desplazamiento geográfico
    if not mismo_municipio:
        metodos_violentos = ['Ahorcamiento', 'Lesión Por Arma De Fuego',
                             'Lesión Por Arma Cortopunzante', 'Quemaduras']
        if metodo in metodos_violentos:
            return {
                'tipo': 'Desplazamiento geográfico',
                'descripcion': f'{municipio_origen} → {municipio_evento} con {metodo}',
                'severidad': 'Media',
                'categoria': 'Patrón geográfico'
            }

    # 3. Gravedad individual
    if nivel_letalidad == 'Alto' and hospitalizado:
        return {
            'tipo': 'Gravedad individual',
            'descripcion': f'Método letal {metodo} requirió hospitalización',
            'severidad': 'Alta',
            'categoria': 'Gravedad clínica'
        }

    # 4. Combinaciones Salud Mental + Sustancias
    perfiles_raros = [
        ('Esquizofrenia', 'Alcohol + Cocaína'),
        ('Sin Antecedentes', 'Alcohol + Cocaína'),
        ('Intento Previo + Depresión', 'No Consume'),
        ('Trastorno Bipolar', 'Alcohol + Cocaína'),
        ('Sin Antecedentes', 'Alcohol + Marihuana'),
        ('Depresión', 'Alcohol + Cocaína'),
    ]
    for antecedente, consumo_esperado in perfiles_raros:
        if antecedentes == antecedente and consumo == consumo_esperado:
            return {
                'tipo': 'Combinaciones Salud Mental + Sustancias',
                'descripcion': f'{antecedentes} + {consumo}',
                'severidad': 'Media',
                'categoria': 'Perfil contextual'
            }

    # 3. Default
    return {
        'tipo': 'Patrones multivariados complejos',
        'descripcion': 'Combinación inusual de múltiples variables',
        'severidad': 'Media',
        'categoria': 'Patrón complejo'
    }


def main():
    print("=" * 80)
    print("CLASIFICACIÓN DE ANOMALÍAS (con mapeo one-hot)")
    print("=" * 80)

    csv_path = encontrar_ultimo_csv()
    print(f"\n[LOAD] {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"  Total: {len(df)}")
    print(f"  Anomalías: {df['is_anomaly'].sum()}")

    # RECUPERAR id_registro del CSV raw
    raw_path = BASE_DIR / "data" / "raw" / "anomalias.csv"
    df_raw = pd.read_csv(raw_path)

    if 'id_registro' in df_raw.columns and len(df_raw) == len(df):
        df['id_registro'] = df_raw['id_registro'].values
        print(f"  ✓ id_registro recuperado de raw CSV")
    else:
        df['id_registro'] = range(1, len(df) + 1)
        print(f"  ⚠️ id_registro generado secuencialmente")

    df_anomalias = df[df['is_anomaly'] == 1].copy()
    print(f"\n[CLASIFICAR] {len(df_anomalias)} anomalías...")

    clasificaciones = df_anomalias.apply(clasificar_anomalia, axis=1)
    df_anomalias['tipo_anomalia'] = clasificaciones.apply(lambda x: x['tipo'])
    df_anomalias['descripcion_anomalia'] = clasificaciones.apply(
        lambda x: x['descripcion'])
    df_anomalias['severidad'] = clasificaciones.apply(lambda x: x['severidad'])
    df_anomalias['categoria'] = clasificaciones.apply(lambda x: x['categoria'])

    print(f"\n[RESUMEN]")
    resumen = df_anomalias['tipo_anomalia'].value_counts()
    for tipo, count in resumen.items():
        pct = 100 * count / len(df_anomalias)
        print(f"  {tipo:<40} {count:>4} ({pct:>5.1f}%)")

    output = RESULTS_DIR / \
        f"anomalies_clasificadas_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv"
    df_anomalias.to_csv(output, index=False)
    print(f"\n[SAVED] {output}")

    metrics = {
        'total': int(len(df_anomalias)),
        'por_tipo': resumen.to_dict(),
        'por_severidad': df_anomalias['severidad'].value_counts().to_dict(),
        'timestamp': pd.Timestamp.now().isoformat()
    }

    with open(METRICS_DIR / "anomalies_clasificacion_latest.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n" + "=" * 80)
    print("COMPLETADO")
    print("=" * 80)


if __name__ == "__main__":
    main()
