# AI/training/03_train_brotes.py

import os
import json
import joblib
import mlflow
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


import mlflow
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MLFLOW_PATH = os.path.join(BASE_DIR, "mlruns")

mlflow.set_tracking_uri(f"file:///{MLFLOW_PATH}")
# ── Rutas ─────────────────────────────────────────────────────────────────────
#BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_PATH = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
MODEL_DIR      = os.path.join(BASE_DIR, "models", "brotes")
MLFLOW_DIR     = os.path.join(BASE_DIR, "mlflow")

# ── Features ──────────────────────────────────────────────────────────────────
FEATURES = [
    # Temporales
    "mes",
    "trimestre",
    "es_fin_anio",
    "es_inicio_anio",
    "nombre_mes_enc",

    # Lugar
    "municipio_evento_enc",
    "zona_evento_enc",

    # Lags
    "lag_casos_1",
    "lag_casos_2",
    "lag_casos_3",

    # Método y letalidad
    "metodo_predominante_enc",
    "nivel_letalidad_predominante_enc",

    # Persona
    "edad_promedio",
    "estrato_promedio",
    "genero_predominante_enc",
    "grupo_etario_predominante_enc",
    "situacion_sentimental_predominante_enc",

    # Contexto
    "antecedentes_mental_promedio",
    "consumo_sustancias_promedio",

    # Movilidad
    "tasa_mismo_municipio",
]

TARGET = "casos"

# ── Split temporal ─────────────────────────────────────────────────────────────
def temporal_split(df: pd.DataFrame):
    df = df.sort_values(["fecha", "municipio_evento"]).reset_index(drop=True)
    split_idx = int(len(df) * 0.8)
    train = df.iloc[:split_idx]
    test  = df.iloc[split_idx:]
    print(f"[split] Train: {len(train)} | Test: {len(test)}")
    print(f"[split] Train hasta: {train['fecha'].max()} | Test desde: {test['fecha'].min()}")
    return train, test

# ── Entrenar ───────────────────────────────────────────────────────────────────
def train(df: pd.DataFrame):
    available = [f for f in FEATURES if f in df.columns]
    missing   = [f for f in FEATURES if f not in df.columns]
    if missing:
        print(f"[warning] Features omitidas: {missing}")

    train_df, test_df = temporal_split(df)

    X_train = train_df[available]
    y_train = train_df[TARGET]
    X_test  = test_df[available]
    y_test  = test_df[TARGET]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    params = {
        "n_estimators": 200,
        "max_depth": 10,
        "min_samples_leaf": 5,
        "random_state": 42,
        "n_jobs": -1
    }

    model = RandomForestRegressor(**params)
    model.fit(X_train_scaled, y_train)
    print("[train] Modelo entrenado.")

    y_pred = model.predict(X_test_scaled)
    rmse   = np.sqrt(mean_squared_error(y_test, y_pred))
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)

    metrics = {
        "rmse": round(rmse, 4),
        "mae":  round(mae, 4),
        "r2":   round(r2, 4)
    }

    print(f"\n Métricas en test:")
    print(f"   RMSE : {rmse:.4f}")
    print(f"   MAE  : {mae:.4f}")
    print(f"   R²   : {r2:.4f}")

    importances = pd.Series(model.feature_importances_, index=available)
    print(f"\n Top 10 variables más importantes:")
    print(importances.sort_values(ascending=False).head(10).to_string())

    return model, scaler, available, metrics, params

# ── Guardar artefactos ─────────────────────────────────────────────────────────
def save_artifacts(model, scaler, features, metrics, params):
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(model,  os.path.join(MODEL_DIR, "brotes_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    config = {
        "model_type": "RandomForestRegressor",
        "target":     TARGET,
        "features":   features,
        "params":     params,
        "metrics":    metrics,
        "aggregation": "municipio+zona+mes"
    }
    with open(os.path.join(MODEL_DIR, "config.json"), "w") as f:
        json.dump(config, f, indent=2)

    print(f"\n[saved] Modelo → {MODEL_DIR}/brotes_model.pkl")
    print(f"[saved] Scaler → {MODEL_DIR}/scaler.pkl")
    print(f"[saved] Config → {MODEL_DIR}/config.json")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    os.makedirs(MLFLOW_DIR, exist_ok=True)
    mlflow.set_tracking_uri(f"sqlite:///{os.path.join(MLFLOW_DIR, 'mlflow.db')}")
    mlflow.set_experiment("brotes_randomforest")

    df = pd.read_csv(PROCESSED_PATH)
    df["fecha"] = pd.to_datetime(df["fecha"])
    print(f"[load] Filas: {len(df)} | Municipios: {df['municipio_evento'].nunique()}")

    with mlflow.start_run(run_name="rf_brotes"):
        model, scaler, features, metrics, params = train(df)

        # Registrar en MLflow
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)
        mlflow.log_param("n_features", len(features))
        mlflow.log_param("features", str(features))
        mlflow.sklearn.log_model(
            sk_model=model,
            name="brotes_model"
        )

        save_artifacts(model, scaler, features, metrics, params)

    print("\n Entrenamiento completado.")

if __name__ == "__main__":
    main()