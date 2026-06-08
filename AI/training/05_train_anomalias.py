# AI/training/05_train_anomalias.py
"""
Entrenamiento de modelo IsolationForest para detección de anomalías.

Pipeline:
1. Cargar features del config.json del feature engineering
2. Cargar anomalias_processed.csv
3. Validar integridad (features, tipos, NaN)
4. Split train/test (80/20)
5. Validación cruzada (5 folds)
6. Entrenar IsolationForest (contamination='auto')
7. Evaluar en test set 
8. Predecir en datos completos
9. Reportar anomalías detectadas
10. Guardar métricas de confiabilidad del modelo
11. Guardar artefactos
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
from sklearn.model_selection import train_test_split, KFold
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
METRICS_DIR = BASE_DIR / "data" / "metrics"

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────────────────

ISOLATION_FOREST_PARAMS = {
    "contamination": 0.20,    # Deja que el modelo estime la proporción de anomalías
    "n_estimators": 200,        # Más árboles = mejor generalización
    "max_samples": "auto",      # Adapta al tamaño del dataset
    "random_state": 42,
    "n_jobs": -1,               # Paralelo en todos los cores
}

# Configuración de validación
VALIDATION_CONFIG = {
    "test_size": 0.2,           # 20% para test
    "n_splits_cv": 5,              # 5 folds para CV
    "random_state": 42,
}

# ANOMALY_DECISION_THRESHOLD = -0.01  # Threshold para clasificar como anomalía


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
        raise FileNotFoundError(
            f"Datos procesados no encontrados: {PROCESSED_PATH}")

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
    print(f"  Todos los tipos son numéricos")

    # NaN
    n_null = df.isnull().sum().sum()
    if n_null > 0:
        raise ValueError(f"Dataset contiene {n_null} valores NaN")
    print(f"  Sin valores NaN")

    # Infinitos (solo en columnas float/int, no booleanas)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    n_inf = 0
    for col in numeric_cols:
        n_inf += np.isinf(df[col].values).sum()

    if n_inf > 0:
        raise ValueError(f"Dataset contiene {n_inf} valores infinitos")
    print(f"Sin valores infinitos")

    # Rango (0-1 para one-hot, variable para numéricos)
    print(f" Rango de valores:")
    print(f"      Min: {df.values.min():.4f}")
    print(f"      Max: {df.values.max():.4f}")
    print(f"      Media: {df.values.mean():.4f}")
    print(f"      Std: {df.values.std():.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. SPLIT TRAIN/TEST
# ─────────────────────────────────────────────────────────────────────────────


def split_data(df: pd.DataFrame) -> tuple:
    """
    Divide datos en train (80%) y test (20%).

    Para anomalías no estratificamos porque no conocemos etiquetas reales.
    """
    print(f"\n[SPLIT] Train/Test Split")
    print(f"  Test size: {VALIDATION_CONFIG['test_size']}")

    X = df.values
    X_train, X_test = train_test_split(
        X,
        test_size=VALIDATION_CONFIG['test_size'],
        random_state=VALIDATION_CONFIG['random_state']
    )

    print(
        f"  Train: {len(X_train)} registros ({100*len(X_train)/len(X):.0f}%)")
    print(f"  Test:  {len(X_test)} registros ({100*len(X_test)/len(X):.0f}%)")

    return X_train, X_test

# ─────────────────────────────────────────────────────────────────────────────
# 5. VALIDACIÓN CRUZADA
# ─────────────────────────────────────────────────────────────────────────────


def cross_validate(X: np.ndarray) -> dict:
    """
    Validación cruzada de 5 folds.

    Mide estabilidad: ¿detecta % similar de anomalías en cada fold?
    Esto demuestra que el modelo no depende de qué datos vea.
    """
    print(f"\n[CROSS-VALIDATION] {VALIDATION_CONFIG['n_splits_cv']}-Fold")

    kf = KFold(
        n_splits=VALIDATION_CONFIG['n_splits_cv'],
        shuffle=True,
        random_state=VALIDATION_CONFIG['random_state']
    )

    fold_metrics = []

    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        print(f"\n  Fold {fold + 1}/{VALIDATION_CONFIG['n_splits_cv']}")

        X_train_fold = X[train_idx]
        X_val_fold = X[val_idx]

        # Entrenar modelo en este fold
        model = IsolationForest(**ISOLATION_FOREST_PARAMS)
        model.fit(X_train_fold)

        # Predecir en validación
        preds = model.predict(X_val_fold)
        scores = model.decision_function(X_val_fold)

        # Métricas del fold
        n_anomalies = (preds == -1).sum()
        pct_anomalies = 100 * n_anomalies / len(preds)

        fold_metrics.append({
            "fold": fold + 1,
            "n_train": len(X_train_fold),
            "n_val": len(X_val_fold),
            "n_anomalies": int(n_anomalies),
            "pct_anomalies": float(pct_anomalies),
            "score_min": float(scores.min()),
            "score_max": float(scores.max()),
            "score_mean": float(scores.mean()),
            "score_std": float(scores.std()),
        })

        print(f"    Anomalías: {n_anomalies} ({pct_anomalies:.2f}%)")
        print(f"    Score range: [{scores.min():.4f}, {scores.max():.4f}]")

    # Estadísticas agregadas
    pct_values = [m["pct_anomalies"] for m in fold_metrics]
    mean_pct = np.mean(pct_values)
    std_pct = np.std(pct_values)

    # Estabilidad: 1.0 = perfectamente estable, 0.0 = muy inestable
    stability = max(0, 1.0 - std_pct / mean_pct) if mean_pct > 0 else 0

    print(f"\n  ─────────────────────────────")
    print(f"  Estabilidad del modelo:")
    print(f"    Media % anomalías: {mean_pct:.2f}%")
    print(f"    Desviación std: {std_pct:.2f}%")
    print(f"    Estabilidad (0-1): {stability:.4f}")
    print(f"  ─────────────────────────────")

    return {
        "folds": fold_metrics,
        "stability": float(stability),
        "mean_pct_anomalies": float(mean_pct),
        "std_pct_anomalies": float(std_pct),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. ENTRENAR ISOLATION FOREST
# ─────────────────────────────────────────────────────────────────────────────

def train_model(X_train: np.ndarray) -> IsolationForest:
    """Entrena IsolationForest con datos de entrenamiento escalados."""
    print(f"\n[TRAINING] IsolationForest")
    print(f"  Parámetros:")
    for k, v in ISOLATION_FOREST_PARAMS.items():
        print(f"    {k}: {v}")

    model = IsolationForest(**ISOLATION_FOREST_PARAMS)
    model.fit(X_train)

    print(f"    Modelo entrenado")
    print(f"    n_trees: {len(model.estimators_)}")
    print(
        f"    max_depth promedio: {np.mean([tree.get_depth() for tree in model.estimators_]):.2f}")

    return model

# ─────────────────────────────────────────────────────────────────────────────
# 7. EVALUAR EN TEST SET
# ─────────────────────────────────────────────────────────────────────────────


def evaluate_on_test(model: IsolationForest, X_test: np.ndarray) -> dict:
    """
    Evalúa el modelo entrenado en datos que NUNCA vio.

    Comparamos % de anomalías en test vs train para detectar overfitting.
    """
    print(f"\n[EVALUATION] Test Set")

    predictions = model.predict(X_test)
    scores = model.decision_function(X_test)

    n_anomalies = (predictions == -1).sum()
    pct_anomalies = 100 * n_anomalies / len(predictions)

    normal_scores = scores[predictions == 1]
    anomaly_scores_filtered = scores[predictions == -1]

    print(f"  Anomalías detectadas: {n_anomalies} ({pct_anomalies:.2f}%)")
    print(f"  Score range: [{scores.min():.4f}, {scores.max():.4f}]")

    if len(anomaly_scores_filtered) > 0:
        print(f"  Media scores normales: {normal_scores.mean():.4f}")
        print(
            f"  Media scores anomalías: {anomaly_scores_filtered.mean():.4f}")

    return {
        "n_test": len(X_test),
        "n_anomalies": int(n_anomalies),
        "pct_anomalies": float(pct_anomalies),
        "score_min": float(scores.min()),
        "score_max": float(scores.max()),
        "score_mean": float(scores.mean()),
        "score_median": float(np.median(scores)),
        "score_std": float(scores.std()),
        "mean_normal_score": float(normal_scores.mean()) if len(normal_scores) > 0 else None,
        "mean_anomaly_score": float(anomaly_scores_filtered.mean()) if len(anomaly_scores_filtered) > 0 else None,
    }

# ─────────────────────────────────────────────────────────────────────────────
# 8. PREDECIR EN DATOS COMPLETOS
# ─────────────────────────────────────────────────────────────────────────────


def predict_full(model: IsolationForest, X: np.ndarray) -> tuple:
    """Genera predicciones finales en todos los datos."""
    print(f"\n[PREDICT] Datos completos")

    predictions = model.predict(X)
    anomaly_scores = model.decision_function(X)

    n_anomalies = (predictions == -1).sum()
    pct_anomalies = 100 * n_anomalies / len(predictions)

    print(f"  Anomalías detectadas: {n_anomalies:,} ({pct_anomalies:.2f}%)")
    print(
        f"  Score range: [{anomaly_scores.min():.4f}, {anomaly_scores.max():.4f}]")

    return predictions, anomaly_scores

# ─────────────────────────────────────────────────────────────────────────────
# 9. MÉTRICA DE CONFIABILIDAD DEL MODELO
# ─────────────────────────────────────────────────────────────────────────────


def calculate_model_reliability(
    predictions: np.ndarray,
    anomaly_scores: np.ndarray
) -> dict:
    """
    MÉTRICA DE CONFIABILIDAD (0-1):
    Mide qué tan bien el modelo separó normales de anomalías.

    Componentes:
    1. SEPARACIÓN: Gap entre media de scores de normales vs anomalías
    2. ESTABILIDAD: Simetría de distribución (skewness)
    3. CONSISTENCIA: % de datos clasificados (siempre será 100% porque no hay etiquetas, pero medimos desviación del % esperado)

    NOTA: Eliminamos "consistencia" porque contamination='auto' 
    hace que el modelo estime el % de anomalías, por lo que no podemos comparar con un valor esperado fijo. 
    En su lugar, nos enfocamos en la separación y estabilidad de los scores para medir confiabilidad.
    """

    print(f"\n[RELIABILITY] Métrica de confiabilidad del modelo")

    # 1. SEPARACIÓN
    normal_scores = anomaly_scores[predictions == 1]
    anomaly_scores_filtered = anomaly_scores[predictions == -1]

    if len(anomaly_scores_filtered) == 0:
        print(f"No se detectaron anomalías, confiabilidad = 0")
        return {
            "separability": 0.0,
            "stability": 0.0,
            "coverage": 0.0,
            "reliability": 0.0,
            "reliability_pct": 0.0,
        }

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

    # 3. COBERTURA (Siempre 1.0 porque clasificamos todo)
    coverage = 1.0
    reliability = (separability + stability + coverage) / 3.0

    print(f"\n  ═══════════════════════════════════════════════════")
    print(f"  CONFIABILIDAD FINAL (0-1): {reliability:.4f}")
    print(f"  CONFIABILIDAD (%): {reliability*100:.2f}%")
    print(f"  ═══════════════════════════════════════════════════")

    return {
        "separability": float(separability),
        "stability": float(stability),
        "coverage": float(coverage),
        "reliability": float(reliability),
        "reliability_pct": float(reliability * 100),
        "mean_normal_score": float(mean_normal),
        "mean_anomaly_score": float(mean_anomaly),
        "skewness": float(skewness),
    }

# ─────────────────────────────────────────────────────────────────────────────
# 10. CREAR RESULTADOS
# ─────────────────────────────────────────────────────────────────────────────


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

    # RECUPERAR id_registro del CSV raw
    raw_path = BASE_DIR / "data" / "raw" / "anomalias.csv"
    if raw_path.exists():
        df_raw = pd.read_csv(raw_path)
        if 'id_registro' in df_raw.columns and len(df_raw) == len(df_results):
            df_results['id_registro'] = df_raw['id_registro'].values
            print(
                f"id_registro recuperado de raw CSV ({len(df_raw)} registros)")
        else:
            # Fallback: generar IDs secuenciales
            df_results['id_registro'] = range(1, len(df_results) + 1)
            print(
                f"id_registro generado secuencialmente (raw no coincide o no tiene id)")
    else:
        df_results['id_registro'] = range(1, len(df_results) + 1)
        print(f"id_registro generado secuencialmente (raw CSV no encontrado)")

    # Ordenar por score más anómalo
    df_results = df_results.sort_values('anomaly_score')
    df_results['anomaly_rank'] = range(1, len(df_results) + 1)

    total_anomalies = (predictions == -1).sum()
    df_results['total_anomalies'] = total_anomalies
    df_results['pct_anomalies'] = 100 * total_anomalies / len(predictions)

    print(f"  Dataset generado: {len(df_results)} filas")
    print(f"  Con id_registro: {'id_registro' in df_results.columns}")

    return df_results


def export_results(df_results: pd.DataFrame) -> Path:
    """Exporta CSV con predicciones"""
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
# 11. GUARDAR MÉTRICAS PARA DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────
def save_metrics_for_dashboard(
    cv_metrics: dict,
    test_metrics: dict,
    reliability_metrics: dict,
    full_metrics: dict
) -> Path:
    """
    Guarda métricas en JSON para consumir en dashboard de Next.js.

    Estructura plana y compatible con Recharts/Chart.js
    """
    METRICS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Datos para gráficos de barras (folds del CV)
    cv_chart_data = [
        {
            "fold": f["fold"],
            "pct_anomalies": f["pct_anomalies"],
            "n_anomalies": f["n_anomalies"]
        }
        for f in cv_metrics["folds"]
    ]

    dashboard_metrics = {
        "model_type": "IsolationForest",
        "trained_at": datetime.now().isoformat(),
        "version": "2.1",

        # Métricas principales (tarjetas del dashboard)
        "summary": {
            "total_records": full_metrics["n_total"],
            "total_anomalies": full_metrics["n_anomalies"],
            "pct_anomalies": round(full_metrics["pct_anomalies"], 2),
            "reliability_pct": round(reliability_metrics["reliability_pct"], 2),
            "cv_stability": round(cv_metrics["stability"], 4),
        },

        # Datos para gráficos
        "charts": {
            "cross_validation": cv_chart_data,
            "score_distribution": {
                "min": full_metrics["score_min"],
                "max": full_metrics["score_max"],
                "mean": full_metrics["score_mean"],
                "median": full_metrics["score_median"],
                "std": full_metrics["score_std"],
            }
        },

        # Métricas detalladas
        "cross_validation": cv_metrics,
        "test_evaluation": test_metrics,
        "reliability": reliability_metrics,
        "model_params": ISOLATION_FOREST_PARAMS,
    }

    # Guardar con timestamp
    metrics_path = METRICS_DIR / f"anomalies_metrics_{timestamp}.json"
    with open(metrics_path, "w") as f:
        json.dump(dashboard_metrics, f, indent=2)

    # Guardar latest (siempre el mismo nombre, fácil de consumir)
    latest_path = METRICS_DIR / "anomalies_metrics_latest.json"
    with open(latest_path, "w") as f:
        json.dump(dashboard_metrics, f, indent=2)

    print(f"\n[DASHBOARD] Métricas guardadas")
    print(f"  Timestamp: {metrics_path}")
    print(f"  Latest: {latest_path}")

    return latest_path
# ─────────────────────────────────────────────────────────────────────────────
# 12. GUARDAR ARTEFACTOS
# ─────────────────────────────────────────────────────────────────────────────


def save_artifacts(
    model: IsolationForest,
    config: dict,
    predictions: np.ndarray,
    anomaly_scores: np.ndarray,
    cv_metrics: dict,
    test_metrics: dict,
    reliability_metrics: dict,
) -> None:
    """Guarda modelo y config actualizado."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Modelo
    model_path = MODELS_DIR / "anomalia_model.pkl"
    joblib.dump(model, model_path)
    print(f"[SAVED] Artefactos")
    print(f"  Modelo: {model_path}")

    # Config actualizado
    metrics = {
        "n_anomalies": int((predictions == -1).sum()),
        "pct_anomalies": float(100 * (predictions == -1).sum() / len(predictions)),
        "score_min": float(anomaly_scores.min()),
        "score_max": float(anomaly_scores.max()),
        "score_mean": float(anomaly_scores.mean()),
        "score_median": float(np.median(anomaly_scores)),
        "score_std": float(anomaly_scores.std()),
    }

    updated_config = {
        **config,
        "model_type": "IsolationForest",
        "version": "2.1",
        "trained_at": datetime.now().isoformat(),
        "isolation_forest_params": ISOLATION_FOREST_PARAMS,
        "scaler_type": None,
        "metrics": metrics,
        "cross_validation": cv_metrics,
        "test_evaluation": test_metrics,
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
    print("ENTRENAMIENTO: ISOLATION FOREST PARA DETECCIÓN DE ANOMALÍAS v2.1")
    print("=" * 80)

    try:
        # 1. Cargar config
        config = load_config()

        # 2. Cargar datos
        df = load_data(config)

        # 3. Validar
        validate_data(df)

        # 4. Split train/test
        X_train, X_test = split_data(df)

        # 5. Validación cruzada
        cv_metrics = cross_validate(df.values)

        # 6. Entrenar modelo final con train
        model = train_model(X_train)

        # 7. Evaluar en test set
        test_metrics = evaluate_on_test(model, X_test)

        # 8. Predecir en datos completos
        predictions, anomaly_scores = predict_full(model, df.values)

        # 9. Calcular confiabilidad del modelo
        reliability_metrics = calculate_model_reliability(
            predictions, anomaly_scores)

        # 10. crear dataset de resultados
        df_results = create_results_dataframe(df, predictions, anomaly_scores)

        # 11. Exportar CSV
        export_results(df_results)

        # 12. Guardar métricas para dashboard
        full_metrics = {
            "n_total": len(df),
            "n_anomalies": int((predictions == -1).sum()),
            "pct_anomalies": float(100 * (predictions == -1).sum() / len(predictions)),
            "score_min": float(anomaly_scores.min()),
            "score_max": float(anomaly_scores.max()),
            "score_mean": float(anomaly_scores.mean()),
            "score_median": float(np.median(anomaly_scores)),
            "score_std": float(anomaly_scores.std()),
        }
        save_metrics_for_dashboard(
            cv_metrics, test_metrics, reliability_metrics, full_metrics)

        # 13. Guardar artefactos
        save_artifacts(model, config, predictions, anomaly_scores,
                       cv_metrics, test_metrics, reliability_metrics)

        print("\n" + "=" * 80)
        print("ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        print("=" * 80)
        print(f"\nArtefactos guardados en: {MODELS_DIR}")
        print(f"CSV de resultados en: {RESULTS_DIR}")
        print(f"Métricas para dashboard en: {METRICS_DIR}")
        print("=" * 80)

    except Exception as e:
        print(f"\n✗ ERROR: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
