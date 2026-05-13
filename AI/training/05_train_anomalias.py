# AI/training/05_train_anomalias.py
"""
Entrenamiento de modelo IsolationForest para detección de anomalías.

Pipeline:
1. Cargar features del config.json del feature engineering
2. Cargar anomalias_processed.csv
3. Validar integridad (features, tipos, NaN)
4. Entrenar IsolationForest (contamination=0.05)
5. Escalar datos con StandardScaler
6. Reportar anomalías detectadas
7. Guardar artefactos
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime
from scipy import stats
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────────────────────
# RUTAS
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent
PROCESSED_PATH = BASE_DIR / "data" / "processed" / "anomalias_processed.csv"
CONFIG_PATH = BASE_DIR / "models" / "anomalias" / "config.json"
MODELS_DIR = BASE_DIR / "models" / "anomalias"
RESULTS_DIR = BASE_DIR / "data" / "results"

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────────────────

ISOLATION_FOREST_PARAMS = {
    "contamination": 0.03,      # 3% de anomalías esperadas
    "n_estimators": 200,        # Más árboles = mejor generalización
    "max_samples": "auto",      # Adapta al tamaño del dataset
    "random_state": 42,
    "n_jobs": -1,               # Paralelo en todos los cores
}

ANOMALY_DECISION_THRESHOLD = -0.01  # Threshold para clasificar como anomalía


# ─────────────────────────────────────────────────────────────────────────────
# 1. CARGAR CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────────────────

def load_config() -> dict:
    """Carga configuración de features desde feature engineering."""
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Config no encontrado: {CONFIG_PATH}")
    
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    
    print(f"[CONFIG] Cargado")
    print(f"  Features: {config['n_features']}")
    print(f"  Método encoding: {config['encoding_method']}")
    return config


# ─────────────────────────────────────────────────────────────────────────────
# 2. CARGAR DATOS PROCESADOS
# ─────────────────────────────────────────────────────────────────────────────

def load_data(config: dict) -> pd.DataFrame:
    """Carga datos procesados y valida integridad."""
    if not PROCESSED_PATH.exists():
        raise FileNotFoundError(f"Datos procesados no encontrados: {PROCESSED_PATH}")
    
    df = pd.read_csv(PROCESSED_PATH)
    
    print(f"\n[DATA] Cargado")
    print(f"  Filas: {len(df)}")
    print(f"  Columnas: {len(df.columns)}")
    
    # Validar features esperados
    expected_features = config["features"]
    missing_features = set(expected_features) - set(df.columns)
    extra_features = set(df.columns) - set(expected_features)
    
    if missing_features:
        raise ValueError(f"Faltan features: {missing_features}")
    if extra_features:
        print(f"  ⚠️  Columnas extra (se ignoran): {extra_features}")
    
    return df[expected_features].copy()


# ─────────────────────────────────────────────────────────────────────────────
# 3. VALIDAR INTEGRIDAD
# ─────────────────────────────────────────────────────────────────────────────

def validate_data(df: pd.DataFrame) -> None:
    """Valida tipos, NaN, y distribución."""
    print(f"\n[VALIDATE] Integridad de datos")
    
    # Tipos
    object_cols = df.select_dtypes(include=['object']).columns.tolist()
    if object_cols:
        raise ValueError(f"Dataset contiene columnas object: {object_cols}")
    print(f"  ✓ Todos los tipos son numéricos")
    
    # NaN
    n_null = df.isnull().sum().sum()
    if n_null > 0:
        raise ValueError(f"Dataset contiene {n_null} valores NaN")
    print(f"  ✓ Sin valores NaN")
    
    # Infinitos (solo en columnas float/int, no booleanas)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    n_inf = 0
    for col in numeric_cols:
        n_inf += np.isinf(df[col].values).sum()
    
    if n_inf > 0:
        raise ValueError(f"Dataset contiene {n_inf} valores infinitos")
    print(f"  ✓ Sin valores infinitos")
    
    # Rango (0-1 para one-hot, variable para numéricos)
    print(f"  ✓ Rango de valores:")
    print(f"      Min: {df.values.min():.4f}")
    print(f"      Max: {df.values.max():.4f}")
    print(f"      Media: {df.values.mean():.4f}")
    print(f"      Std: {df.values.std():.4f}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. ENTRENAR ISOLATION FOREST
# ─────────────────────────────────────────────────────────────────────────────

def scale_data(X: pd.DataFrame) -> tuple:
    """
    Escala datos con StandardScaler.
    
    JUSTIFICACIÓN:
    - One-hot encoding: rango 0-1
    - Variables numéricas: rango 0-100+
    - StandardScaler normaliza: (x - mean) / std
    - Mejora separabilidad de IsolationForest
    
    Returns:
        (X_scaled, scaler)
    """
    print(f"\n[SCALING] StandardScaler")
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print(f"  ✓ Datos escalados")
    print(f"    Rango post-escala:")
    print(f"      Min: {X_scaled.min():.4f}")
    print(f"      Max: {X_scaled.max():.4f}")
    print(f"      Media: {X_scaled.mean():.6f}")
    print(f"      Std: {X_scaled.std():.4f}")
    
    return X_scaled, scaler


def train_model(X_scaled: np.ndarray) -> IsolationForest:
    """Entrena IsolationForest con parámetros optimizados."""
    print(f"\n[TRAINING] IsolationForest")
    print(f"  Parámetros:")
    for k, v in ISOLATION_FOREST_PARAMS.items():
        print(f"    {k}: {v}")
    
    model = IsolationForest(**ISOLATION_FOREST_PARAMS)
    model.fit(X_scaled)
    
    print(f"  ✓ Modelo entrenado")
    print(f"    n_trees: {len(model.estimators_)}")
    print(f"    max_depth promedio: {np.mean([tree.get_depth() for tree in model.estimators_]):.2f}")
    
    return model


# ─────────────────────────────────────────────────────────────────────────────
# 5. ANALIZAR ANOMALÍAS
# ─────────────────────────────────────────────────────────────────────────────

def predict(model, X_scaled: np.ndarray) -> tuple:
    """
    Genera predicciones completas: labels + anomaly scores.
    
    Returns:
        (predictions, anomaly_scores)
    """
    print(f"\n[PREDICT] Generando predicciones")
    
    predictions = model.predict(X_scaled)
    anomaly_scores = model.decision_function(X_scaled)
    
    n_anomalies = (predictions == -1).sum()
    pct_anomalies = 100 * n_anomalies / len(predictions)
    
    print(f"  Anomalías detectadas: {n_anomalies:,} ({pct_anomalies:.2f}%)")
    print(f"  Score range: [{anomaly_scores.min():.4f}, {anomaly_scores.max():.4f}]")
    
    return predictions, anomaly_scores


def calculate_model_reliability(
    predictions: np.ndarray,
    anomaly_scores: np.ndarray,
    expected_contamination: float = 0.03
) -> dict:
    """
    MÉTRICA DE CONFIABILIDAD (0-1):
    Mide qué tan bien el modelo separó normales de anomalías.
    
    Componentes:
    1. SEPARACIÓN: Gap entre media de scores de normales vs anomalías
    2. ESTABILIDAD: Simetría de distribución (skewness)
    3. CONSISTENCIA: % real vs % esperado
    
    Fórmula: Confiabilidad = (separacion + estabilidad + consistencia) / 3
    """
    
    print(f"\n[RELIABILITY] Métrica de confiabilidad del modelo")
    
    # 1. SEPARACIÓN
    normal_scores = anomaly_scores[predictions == 1]
    anomaly_scores_filtered = anomaly_scores[predictions == -1]
    
    mean_normal = normal_scores.mean()
    mean_anomaly = anomaly_scores_filtered.mean()
    std_combined = np.sqrt(
        (normal_scores.std()**2 + anomaly_scores_filtered.std()**2) / 2
    )
    
    gap = abs(mean_normal - mean_anomaly) / (std_combined + 1e-6)
    separability = min(1.0, gap / 3.0)
    
    print(f"  1. SEPARACIÓN (Gap de scores)")
    print(f"     Media normales: {mean_normal:.4f}")
    print(f"     Media anomalías: {mean_anomaly:.4f}")
    print(f"     Separabilidad (0-1): {separability:.4f}")
    
    # 2. ESTABILIDAD
    skewness = stats.skew(anomaly_scores)
    stability = max(0, 1.0 - abs(skewness) / 2.0)
    
    print(f"  2. ESTABILIDAD (Distribución de scores)")
    print(f"     Skewness: {skewness:.4f}")
    print(f"     Estabilidad (0-1): {stability:.4f}")
    
    # 3. CONSISTENCIA
    pct_real = 100 * (predictions == -1).sum() / len(predictions)
    pct_expected = 100 * expected_contamination
    pct_deviation = abs(pct_real - pct_expected) / pct_expected
    consistency = max(0, 1.0 - pct_deviation)
    
    print(f"  3. CONSISTENCIA (% anomalías esperado vs real)")
    print(f"     Esperado: {pct_expected:.2f}%")
    print(f"     Real: {pct_real:.2f}%")
    print(f"     Consistencia (0-1): {consistency:.4f}")
    
    reliability = (separability + stability + consistency) / 3.0
    
    print(f"\n  ═══════════════════════════════════════════════════")
    print(f"  CONFIABILIDAD FINAL (0-1): {reliability:.4f}")
    print(f"  CONFIABILIDAD (%): {reliability*100:.2f}%")
    print(f"  ═══════════════════════════════════════════════════")
    
    return {
        "separability": float(separability),
        "stability": float(stability),
        "consistency": float(consistency),
        "reliability": float(reliability),
        "reliability_pct": float(reliability * 100),
        "mean_normal_score": float(mean_normal),
        "mean_anomaly_score": float(mean_anomaly),
        "skewness": float(skewness),
    }


def create_results_dataframe(
    df_original: pd.DataFrame,
    predictions: np.ndarray,
    anomaly_scores: np.ndarray
) -> pd.DataFrame:
    """Crea DataFrame con datos originales + predicciones."""
    print(f"\n[RESULTS] Creando dataset de resultados")
    
    df_results = df_original.copy()
    df_results['prediction'] = predictions
    df_results['anomaly_score'] = anomaly_scores
    df_results['is_anomaly'] = (predictions == -1).astype(int)
    
    # Ordenar por score más anómalo
    df_results = df_results.sort_values('anomaly_score')
    df_results['anomaly_rank'] = range(1, len(df_results) + 1)
    
    total_anomalies = (predictions == -1).sum()
    df_results['total_anomalies'] = total_anomalies
    df_results['pct_anomalies'] = 100 * total_anomalies / len(predictions)
    
    print(f"  ✓ Dataset generado")
    print(f"    Columnas resultado: prediction, anomaly_score, is_anomaly, anomaly_rank")
    
    return df_results


def export_results(df_results: pd.DataFrame) -> Path:
    """Exporta CSV con predicciones (para backend)."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_path = RESULTS_DIR / f"anomalies_predictions_{timestamp}.csv"
    
    df_results.to_csv(results_path, index=False)
    
    print(f"\n[EXPORT] Resultados CSV")
    print(f"  Ruta: {results_path}")
    print(f"  Filas: {len(df_results):,}")
    
    # CSV con solo anomalías
    anomalies_only = df_results[df_results['is_anomaly'] == 1].copy()
    anomalies_path = RESULTS_DIR / f"anomalies_only_{timestamp}.csv"
    anomalies_only.to_csv(anomalies_path, index=False)
    
    print(f"  Anomalías CSV: {len(anomalies_only):,} filas")
    
    return results_path


# ─────────────────────────────────────────────────────────────────────────────
# 6. GUARDAR ARTEFACTOS
# ─────────────────────────────────────────────────────────────────────────────

def save_artifacts(
    model,
    scaler,
    config: dict,
    predictions: np.ndarray,
    anomaly_scores: np.ndarray,
    reliability_metrics: dict,
) -> None:
    """Guarda modelo, scaler, y config actualizado."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Modelo
    model_path = MODELS_DIR / "model.pkl"
    joblib.dump(model, model_path)
    print(f"[SAVED] Artefactos")
    print(f"  Modelo: {model_path}")
    
    # Scaler
    scaler_path = MODELS_DIR / "scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"  Scaler: {scaler_path}")
    
    # Config actualizado
    metrics = {
        "n_anomalies": int((predictions == -1).sum()),
        "pct_anomalies": float(100 * (predictions == -1).sum() / len(predictions)),
        "score_min": float(anomaly_scores.min()),
        "score_max": float(anomaly_scores.max()),
        "score_mean": float(anomaly_scores.mean()),
        "score_median": float(np.median(anomaly_scores)),
        "score_std": float(anomaly_scores.std()),
        "threshold": ANOMALY_DECISION_THRESHOLD,
    }
    
    updated_config = {
        **config,
        "model_type": "IsolationForest",
        "version": "2.0",
        "trained_at": datetime.now().isoformat(),
        "isolation_forest_params": ISOLATION_FOREST_PARAMS,
        "scaler_type": "StandardScaler",
        "metrics": metrics,
        "reliability": reliability_metrics,
    }
    
    config_path = MODELS_DIR / "config.json"
    with open(config_path, "w") as f:
        json.dump(updated_config, f, indent=2)
    print(f"  Config: {config_path}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 80)
    print("ENTRENAMIENTO: ISOLATION FOREST PARA DETECCIÓN DE ANOMALÍAS v2.0")
    print("=" * 80)
    
    try:
        # 1. Cargar config
        config = load_config()
        
        # 2. Cargar datos
        df = load_data(config)
        
        # 3. Validar
        validate_data(df)
        
        # 4. Escalar
        X_scaled, scaler = scale_data(df)
        
        # 5. Entrenar
        model = train_model(X_scaled)
        
        # 6. Predecir
        predictions, anomaly_scores = predict(model, X_scaled)
        
        # 7. Calcular confiabilidad
        reliability_metrics = calculate_model_reliability(
            predictions,
            anomaly_scores,
            expected_contamination=ISOLATION_FOREST_PARAMS["contamination"]
        )
        
        # 8. Crear dataset de resultados
        df_results = create_results_dataframe(df, predictions, anomaly_scores)
        
        # 9. Exportar CSV
        export_results(df_results)
        
        # 10. Guardar artefactos
        save_artifacts(model, scaler, config, predictions, anomaly_scores, reliability_metrics)
        
        print("\n" + "=" * 80)
        print("✓ ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        print("=" * 80)
        print(f"\nArtefactos guardados en: {MODELS_DIR}")
        print(f"CSV de resultados en: {RESULTS_DIR}")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
