from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

from utils.config import settings
from utils.metrics import mae, rmse, r2_score

MODEL_DIR = Path(settings.MODEL_DIR)
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DEMANDA_DIR = MODEL_DIR / "demanda"
DEMANDA_DIR.mkdir(parents=True, exist_ok=True)


def save_config(config: dict) -> None:
    config_path = DEMANDA_DIR / "config.json"
    pd.Series(config).to_json(config_path)


def train_demanda() -> None:
    data_path = Path("../data/processed/demanda_processed.csv").resolve()
    if not data_path.exists():
        print(f"No se encontró el archivo de datos procesados en {data_path}")
        return

    df = pd.read_csv(data_path)
    features = [col for col in df.columns if col not in ["fecha", "servicio", "demanda"]]
    target = "demanda"
    X = df[features].fillna(0)
    y = df[target].astype(float)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=42)
    model.fit(X_scaled, y)

    joblib.dump(model, DEMANDA_DIR / "demanda_model.pkl")
    joblib.dump(scaler, DEMANDA_DIR / "scaler.pkl")

    config = {
        "model_type": "GradientBoostingRegressor",
        "features": features,
        "target": target,
        "version": "1.0",
        "train_rows": len(df),
    }
    save_config(config)

    print("Modelo de demanda entrenado y guardado en:")
    print(DEMANDA_DIR)
    print("Métricas de entrenamiento:")
    preds = model.predict(X_scaled)
    print("RMSE:", rmse(y.tolist(), preds.tolist()))
    print("MAE:", mae(y.tolist(), preds.tolist()))
    print("R2:", r2_score(y.tolist(), preds.tolist()))


if __name__ == "__main__":
    train_demanda()
