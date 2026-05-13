# AI/training/02_feature_engineering_anomalias.py

import os
import pandas as pd
import numpy as np
import json

# ─────────────────────────────────────────────────────────────────────────────
# RUTAS
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PATH = os.path.join(BASE_DIR, "data", "raw", "anomalias.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
PROCESSED_PATH = os.path.join(PROCESSED_DIR, "anomalias_processed.csv")
ENCODERS_DIR = os.path.join(BASE_DIR, "models", "anomalias")

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────────────────

# Variables categóricas a codificar con ONE-HOT ENCODING
# (incluye antecedentes_salud_mental y consumo_sustancias, que NO son binarias)
CATEGORICAL_COLS = [
    "genero",
    "grupo_etario",
    "municipio_evento",
    "municipio_origen",
    "zona_evento",
    "departamento",
    "metodo",
    "tipo_metodo",
    "nivel_letalidad",
    "resultado_atencion",
    "tipo_resultado",
    "estado_civil",
    "grupo_poblacional",
    "situacion_sentimental",
    "antecedentes_salud_mental",      # Movido: era categórica, no binaria
    "consumo_sustancias",              # Movido: era categórica, no binaria
    "dia_semana",                      # Movido: es categórica (Monday, Tuesday, etc.)
]

# Variables numéricas a mantener tal cual
NUMERIC_COLS = [
    "edad",
    "estrato",
    "cantidad_intentos",
]

# Variables binarias REALES (0/1)
BINARY_COLS = [
    "es_fin_de_semana",
    "mismo_municipio",
    "requirio_hospitalizacion",
    "hospitalizado",
    "tiene_antecedente",
    "consume_sustancias_flag",
]

# Variables temporales NUMÉRICAS (no incluye dia_semana que es categórica)
TEMPORAL_COLS = [
    "anio",
    "mes",
    "trimestre",
]


# ─────────────────────────────────────────────────────────────────────────────
# 1. CARGAR DATOS CRUDOS
# ─────────────────────────────────────────────────────────────────────────────

def load_raw() -> pd.DataFrame:
    """Carga el CSV crudo de anomalías."""
    df = pd.read_csv(RAW_PATH)
    print(f"\n[LOAD] Anomalías crudas")
    print(f"  Filas: {len(df)}")
    print(f"  Columnas: {len(df.columns)}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 2. LIMPIAR DATOS
# ─────────────────────────────────────────────────────────────────────────────

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Limpia datos: elimina duplicados."""
    print(f"\n[CLEAN] Limpieza de datos")

    # Duplicados completos
    before = len(df)
    df = df.drop_duplicates()
    removed = before - len(df)
    if removed > 0:
        print(f"  Duplicados removidos: {removed}")
    else:
        print(f"  ✓ Sin duplicados")

    return df


# ─────────────────────────────────────────────────────────────────────────────
# 3. ONE-HOT ENCODING (reemplaza LabelEncoder)
# ─────────────────────────────────────────────────────────────────────────────

def one_hot_encode(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Codifica variables categóricas usando One-Hot Encoding.

    Ventajas para Isolation Forest:
    - NO introduce orden artificial entre categorías
    - Preserva estructura multivariada
    - Mantiene patrones raros en los datos

    Retorna:
    - DataFrame con columnas one-hot
    - Dict con mapeos de encoding (para futura decodificación)
    """
    print(f"\n[ENCODING] One-Hot Encoding (variables categóricas)")

    encoding_info = {}
    df_encoded = df.copy()

    for col in CATEGORICAL_COLS:
        if col not in df.columns:
            print(f"  ⚠️  Columna '{col}' no encontrada, se omite")
            continue

        # Rellenar NaN
        df_encoded[col] = df_encoded[col].fillna("UNKNOWN")

        # Obtener categorías
        categories = df_encoded[col].unique()
        n_categories = len(categories)

        # One-Hot Encoding
        one_hot = pd.get_dummies(
            df_encoded[col],
            prefix=col,
            prefix_sep="_",
            drop_first=False,
            dtype=int
        )

        # Guardar info de encoding
        encoding_info[col] = {
            "categories": list(categories),
            "n_categories": n_categories,
            "columns": list(one_hot.columns)
        }

        # Agregar columnas one-hot al dataframe
        df_encoded = pd.concat([df_encoded, one_hot], axis=1)

        print(
            f"  ✓ {col}: {n_categories} categorías → {len(one_hot.columns)} columnas one-hot")

    return df_encoded, encoding_info


# ─────────────────────────────────────────────────────────────────────────────
# 4. VALIDAR VARIABLES NUMÉRICAS (sin modificar outliers)
# ─────────────────────────────────────────────────────────────────────────────

def validate_numeric(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convierte variables numéricas a tipos correctos.

    IMPORTANTE: NO reemplaza outliers. IsolationForest necesita verlos
    para detectar anomalías reales.
    """
    print(f"\n[NUMERIC] Validación de variables numéricas")

    for col in NUMERIC_COLS:
        if col not in df.columns:
            print(f"  ⚠️  Columna '{col}' no encontrada, se omite")
            continue

        # Convertir a numérico (coerce = mantiene NaN para no-convertibles)
        df[col] = pd.to_numeric(df[col], errors='coerce')

        # Estadísticas
        n_null = df[col].isnull().sum()
        min_val = df[col].min()
        max_val = df[col].max()
        mean_val = df[col].mean()

        print(f"  ✓ {col}:")
        print(f"      Rango: {min_val:.2f} → {max_val:.2f}")
        print(f"      Media: {mean_val:.2f}")
        print(f"      NaN: {n_null}")

    return df


# ─────────────────────────────────────────────────────────────────────────────
# 6. MANEJAR VALORES FALTANTES
# ─────────────────────────────────────────────────────────────────────────────

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Maneja valores faltantes: impute con media/moda según tipo.
    """
    print(f"\n[MISSING] Manejo de valores faltantes")

    missing_summary = df.isnull().sum()
    if missing_summary.sum() > 0:
        print(f"  Columnas con NaN encontradas:")
        for col, count in missing_summary[missing_summary > 0].items():
            if df[col].dtype in ['float64', 'int64', 'Int64']:
                # Numérica: impute con media
                mean_val = df[col].mean()
                df[col].fillna(mean_val, inplace=True)
                print(f"    {col}: {count} → media ({mean_val:.2f})")
            else:
                # Categórica: impute con moda
                if not df[col].mode().empty:
                    mode_val = df[col].mode()[0]
                else:
                    mode_val = "UNKNOWN"
                df[col].fillna(mode_val, inplace=True)
                print(f"    {col}: {count} → moda ({mode_val})")
    else:
        print(f"  ✓ Sin valores faltantes")

    return df


# ─────────────────────────────────────────────────────────────────────────────
# 7. SELECCIONAR Y ORDENAR FEATURES FINALES
# ─────────────────────────────────────────────────────────────────────────────

def select_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Selecciona features finales para el modelo.

    ORDEN:
    1. Temporales
    2. One-hot encoded (categóricas)
    3. Numéricas
    4. Binarias

    EXCLUYE:
    - IDs
    - Fechas crudas
    - Columnas categóricas originales
    """
    print(f"\n[SELECT] Features finales para modelo")

    features = []

    # 1. Temporales NUMÉRICAS (anio, mes, trimestre)
    for col in TEMPORAL_COLS:
        if col in df.columns:
            features.append(col)
    
    # 2. One-hot encoded (todas las columnas con _ en el nombre que vienen de categóricas)
    for col in df.columns:
        for cat_col in CATEGORICAL_COLS:
            if col.startswith(f"{cat_col}_"):
                features.append(col)
                break
    
    # 3. Numéricas
    for col in NUMERIC_COLS:
        if col in df.columns:
            features.append(col)
    
    # 4. Binarias
    for col in BINARY_COLS:
        if col in df.columns:
            features.append(col)

    # Eliminar duplicados manteniendo orden
    features = list(dict.fromkeys(features))

    # Validar que todas existan
    features = [f for f in features if f in df.columns]

    print(f"  Total features: {len(features)}")
    print(f"  Breakdown:")
    temporal_count = sum(1 for f in features if f in TEMPORAL_COLS)
    onehot_count = sum(1 for f in features if any(
        f.startswith(f"{c}_") for c in CATEGORICAL_COLS))
    numeric_count = sum(1 for f in features if f in NUMERIC_COLS)
    binary_count = sum(1 for f in features if f in BINARY_COLS)

    print(f"    Temporales: {temporal_count}")
    print(f"    One-Hot Encoded: {onehot_count}")
    print(f"    Numéricas: {numeric_count}")
    print(f"    Binarias: {binary_count}")

    return df[features].copy(), features


# ─────────────────────────────────────────────────────────────────────────────
# 8. GUARDAR ARTEFACTOS
# ─────────────────────────────────────────────────────────────────────────────

def save_processed(df: pd.DataFrame):
    """Guarda DataFrame procesado."""
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"\n[SAVED] Dataset procesado")
    print(f"  Archivo: {PROCESSED_PATH}")
    print(f"  Filas: {len(df)}")
    print(f"  Columnas: {len(df.columns)}")


def save_config(features: list, encoding_info: dict):
    """Guarda configuración de features y encoding."""
    config = {
        "features": features,
        "n_features": len(features),
        "model_type": "IsolationForest",
        "encoding_method": "one-hot",
        "encoding_info": encoding_info,
        "version": "1.0",
        "description": "Detección de anomalías multivariadas en intentos de suicidio"
    }
    config_path = os.path.join(ENCODERS_DIR, "config.json")
    os.makedirs(ENCODERS_DIR, exist_ok=True)
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    print(f"\n[CONFIG] Guardado")
    print(f"  Archivo: {config_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 5. FEATURES DERIVADOS (mínimo)
# ─────────────────────────────────────────────────────────────────────────────

def create_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Crea features derivados mínimos.
    
    Solo convierte fecha a datetime si existe.
    """
    print(f"\n[FEATURES] Derivados mínimos")

    if 'fecha' in df.columns:
        df['fecha'] = pd.to_datetime(df['fecha'], errors='coerce')
        print(f"  ✓ fecha convertida a datetime")

    return df


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 80)
    print("FEATURE ENGINEERING: DETECCIÓN DE ANOMALÍAS CON ISOLATION FOREST")
    print("=" * 80)

    # 1. Cargar
    df = load_raw()

    # 2. Limpiar
    df = clean_data(df)

    # 3. One-Hot Encoding (NO Label Encoding)
    df, encoding_info = one_hot_encode(df)

    # 4. Validar numéricas (SIN modificar outliers)
    df = validate_numeric(df)

    # 5. Features derivados (minimales)
    df = create_derived_features(df)

    # 6. Manejar NaN
    df = handle_missing_values(df)

    # 7. Seleccionar features finales
    df_processed, features_list = select_features(df)

    # 7.5 VALIDAR TIPOS DE DATOS (CRÍTICO para Isolation Forest)
    print(f"\n[VALIDACIÓN] Tipos de datos finales")
    object_cols = df_processed.select_dtypes(include=['object']).columns
    if len(object_cols) > 0:
        print(f"\n⚠️ ERROR: Columnas object detectadas:")
        print(f"  {object_cols.tolist()}")
        raise ValueError(f"El dataset contiene {len(object_cols)} columnas string/object. IsolationForest SOLO acepta numéricas.")
    else:
        print(f"  ✓ Todas las columnas son numéricas")
        print(f"  ✓ Dataset listo para IsolationForest")

    # 8. Guardar
    save_processed(df_processed)
    save_config(features_list, encoding_info)

    print("\n" + "=" * 80)
    print("✅ Feature Engineering Completado")
    print("=" * 80)

    print(f"\nPrimeras 5 filas del dataset procesado:")
    print(df_processed.head())

    print(f"\nInfo del dataset final:")
    print(f"  Total filas: {len(df_processed)}")
    print(f"  Total features: {len(df_processed.columns)}")
    print(
        f"  Memoria: {df_processed.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

    print(f"\nTipos de datos:")
    for dtype in df_processed.dtypes.unique():
        count = (df_processed.dtypes == dtype).sum()
        print(f"  {dtype}: {count} columnas")

    print(f"\n✓ Dataset listo para entrenar IsolationForest")
    print(f"✓ Todas las columnas son numéricas")
    print(f"✓ Sin IDs, sin fechas crudas, sin columnas categóricas originales")


if __name__ == "__main__":
    main()
