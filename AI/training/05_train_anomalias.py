from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from utils.config import settings

MODEL_DIR = Path(settings.MODEL_DIR)
MODEL_DIR.mkdir(parents=True, exist_ok=True)
ANOMALIAS_DIR = MODEL_DIR / "anomalias"
ANOMALIAS_DIR.mkdir(parents=True, exist_ok=True)


def save_config(config: dict) -> None:
    config_path = ANOMALIAS_DIR / "config.json"
    pd.Series(config).to_json(config_path)


def train_anomalias() -> None:
    data_path = Path("../data/processed/anomalias_processed.csv").resolve()
    if not data_path.exists():
        print(f"No se encontró el archivo de datos procesados en {data_path}")
        return

    df = pd.read_csv(data_path)
    feature_columns = [col for col in df.columns if col not in ["fecha", "entidad"]]
    X = df[feature_columns].fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X_scaled)

    joblib.dump(model, ANOMALIAS_DIR / "anomalia_model.pkl")
    joblib.dump(scaler, ANOMALIAS_DIR / "scaler.pkl")

    config = {
        "model_type": "IsolationForest",
        "features": feature_columns,
        "version": "1.0",
        "threshold": -0.01,
        "train_rows": len(df),
    }
    save_config(config)

    print("Modelo de anomalías entrenado y guardado en:")
    print(ANOMALIAS_DIR)


if __name__ == "__main__":
    train_anomalias()
