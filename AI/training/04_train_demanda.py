# AI/training/04_train_demanda.py

import os
import json
import joblib
import mlflow
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR   = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR_M     = os.path.join(BASE_DIR, "models", "demanda", "mensual")
MODEL_DIR_S     = os.path.join(BASE_DIR, "models", "demanda", "semanal")
MLFLOW_DIR      = os.path.join(BASE_DIR, "mlflow")

# ── Features ──────────────────────────────────────────────────────────────────
# Compartidas por ambos modelos
FEATURES_BASE = [
    "mes", "trimestre", "es_fin_anio", "es_inicio_anio",
    "zona_predominante_enc", "lag_hosp_1",
    "rolling_mean_4", "rolling_std_4", "tendencia_local",
    "metodo_predominante_enc", "nivel_letalidad_predominante_enc",
    "edad_promedio", "estrato_promedio",
    "genero_predominante_enc", "grupo_etario_predominante_enc",
    "antecedentes_mental_promedio", "consumo_sustancias_promedio",
    "tasa_mismo_municipio",
]

FEATURES_MENSUAL = FEATURES_BASE + [
    "lag_hosp_2", "lag_hosp_3", "lag_hosp_6", "lag_hosp_12",
    "total_eventos", "municipio_target_enc",  
]

FEATURES_SEMANAL = FEATURES_BASE + [
    "lag_hosp_4",
    "lag_hosp_8",
    "lag_hosp_12",
    "numero_semana",
    "tuvo_fin_de_semana",
    "municipio_target_enc",
]

TARGET = "hospitalizaciones"

# ── Parámetros XGBoost ────────────────────────────────────────────────────────
PARAMS_XGBOOST = {
    "n_estimators":     800,      # más árboles
    "max_depth":        5,        # menos profundidad para evitar overfitting
    "learning_rate":    0.03,     # más lento pero más preciso
    "subsample":        0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 5,        # nuevo — evita divisiones con pocos datos
    "reg_alpha":        0.5,      # más regularización L1
    "reg_lambda":       2.0,      # más regularización L2
    "random_state":     42,
    "n_jobs":           -1,
}


# ── Split temporal ─────────────────────────────────────────────────────────────
def temporal_split(df: pd.DataFrame, label: str):
    df = df.sort_values(["fecha", "municipio_evento"]).reset_index(drop=True)
    
    fechas = df["fecha"].sort_values().unique()
    corte  = fechas[int(len(fechas) * 0.8)]
    
    train = df[df["fecha"] <  corte]
    test  = df[df["fecha"] >= corte]
    
    print(f"[split:{label}] Train: {len(train)} | Test: {len(test)}")
    print(f"[split:{label}] Train hasta: {train['fecha'].max()} | Test desde: {test['fecha'].min()}")
    return train, test


# ── Métricas de detección de brote ────────────────────────────────────────────
def brote_detection_metrics(y_true: pd.Series, y_pred: np.ndarray, label: str) -> dict:
    """
    Evalúa la capacidad del modelo para detectar picos de demanda.
    Umbral = percentil 75 del target en test.
    """
    umbral = np.percentile(y_true, 75)
    real_brote  = (y_true >= umbral).astype(int)
    pred_brote  = (y_pred >= umbral).astype(int)

    tp = int(((real_brote == 1) & (pred_brote == 1)).sum())
    fp = int(((real_brote == 0) & (pred_brote == 1)).sum())
    fn = int(((real_brote == 1) & (pred_brote == 0)).sum())

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1        = (2 * precision * recall / (precision + recall)
                 if (precision + recall) > 0 else 0.0)

    print(f"\n[brote:{label}] Umbral alerta: {umbral:.1f} hospitalizaciones (p75)")
    print(f"[brote:{label}] Precisión : {precision:.4f}")
    print(f"[brote:{label}] Recall    : {recall:.4f}")
    print(f"[brote:{label}] F1        : {f1:.4f}")

    return {
        "brote_umbral":    round(float(umbral), 2),
        "brote_precision": round(precision, 4),
        "brote_recall":    round(recall,    4),
        "brote_f1":        round(f1,        4),
    }


# ── Entrenar ──────────────────────────────────────────────────────────────────
def train(df: pd.DataFrame, features_list: list, label: str):
    available = [f for f in features_list if f in df.columns]
    missing   = [f for f in features_list if f not in df.columns]
    if missing:
        print(f"[warning:{label}] Features omitidas: {missing}")

    train_df, test_df = temporal_split(df, label)

    X_train = train_df[available]
    y_train = train_df[TARGET]
    X_test  = test_df[available]
    y_test  = test_df[TARGET]

    # Target encoding sin leakage — calculado solo sobre train
    media_municipio = train_df.groupby("municipio_evento")["hospitalizaciones"].mean()
    train_df = train_df.copy()
    test_df  = test_df.copy()
    train_df["municipio_target_enc"] = train_df["municipio_evento"].map(media_municipio)
    test_df["municipio_target_enc"]  = test_df["municipio_evento"].map(media_municipio).fillna(media_municipio.mean())

    # XGBoost no requiere escalado, pero lo mantenemos por consistencia
    # con el pipeline de brotes y para el predictor en producción
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    model = xgb.XGBRegressor(**PARAMS_XGBOOST)
    model.fit(
        X_train_scaled, y_train,
        eval_set=[(X_test_scaled, y_test)],
        verbose=False,
    )
    print(f"[train:{label}] Modelo entrenado.")

    y_pred = model.predict(X_test_scaled)
    rmse   = np.sqrt(mean_squared_error(y_test, y_pred))
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)

    metrics = {
        "rmse": round(float(rmse), 4),
        "mae":  round(float(mae),  4),
        "r2":   round(float(r2),   4),
    }

    print(f"\n Métricas en test [{label}]:")
    print(f"   RMSE : {rmse:.4f}")
    print(f"   MAE  : {mae:.4f}")
    print(f"   R²   : {r2:.4f}")

    # Métricas de detección de brote
    brote_metrics = brote_detection_metrics(y_test, y_pred, label)
    metrics.update(brote_metrics)

    # Feature importance
    importances = pd.Series(model.feature_importances_, index=available)
    print(f"\n Top 10 variables más importantes [{label}]:")
    print(importances.sort_values(ascending=False).head(10).to_string())

    return model, scaler, available, metrics


# ── Guardar artefactos ─────────────────────────────────────────────────────────
def save_artifacts(model, scaler, features, metrics, model_dir: str, label: str):
    os.makedirs(model_dir, exist_ok=True)

    model_filename = f"demanda_{label}_model.pkl"
    joblib.dump(model,  os.path.join(model_dir, model_filename))
    joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))

    config = {
        "model_type":  "XGBRegressor",
        "target":      TARGET,
        "features":    features,
        "params":      PARAMS_XGBOOST,
        "metrics":     metrics,
        "aggregation": f"municipio+{label}",
        "granularidad": label,
    }
    with open(os.path.join(model_dir, "config.json"), "w") as f:
        json.dump(config, f, indent=2)

    print(f"\n[saved:{label}] Modelo → {model_dir}/{model_filename}")
    print(f"[saved:{label}] Scaler → {model_dir}/scaler.pkl")
    print(f"[saved:{label}] Config → {model_dir}/config.json")


# ── Pipeline por granularidad ─────────────────────────────────────────────────
def run_pipeline(label: str):
    print(f"\n{'═'*50}")
    print(f" ENTRENAMIENTO DEMANDA — {label.upper()}")
    print(f"{'═'*50}")

    processed_path = os.path.join(PROCESSED_DIR, f"demanda_{label}_processed.csv")
    model_dir      = MODEL_DIR_M if label == "mensual" else MODEL_DIR_S
    features_list  = FEATURES_MENSUAL if label == "mensual" else FEATURES_SEMANAL
    experiment     = f"demanda_xgboost_{label}"

    df = pd.read_csv(processed_path)
    df["fecha"] = pd.to_datetime(df["fecha"])
    print(f"[load:{label}] Filas: {len(df)} | Municipios: {df['municipio_evento'].nunique()}")

    mlflow.set_experiment(experiment)
    with mlflow.start_run(run_name=f"xgb_demanda_{label}"):
        model, scaler, features, metrics = train(df, features_list, label)

        # Registrar en MLflow
        mlflow.log_params(PARAMS_XGBOOST)
        mlflow.log_metrics(metrics)
        mlflow.log_param("n_features",   len(features))
        mlflow.log_param("features",     str(features))
        mlflow.log_param("granularidad", label)
        mlflow.xgboost.log_model(model, f"demanda_{label}_model")

        save_artifacts(model, scaler, features, metrics, model_dir, label)

    print(f"\n Entrenamiento {label} completado.")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    os.makedirs(MLFLOW_DIR, exist_ok=True)
    mlflow.set_tracking_uri(f"sqlite:///{os.path.join(MLFLOW_DIR, 'mlflow.db')}")

    run_pipeline("mensual")

    print("\n Entrenamiento de demanda completado.")

if __name__ == "__main__":
    main()