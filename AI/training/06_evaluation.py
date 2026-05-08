from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

from utils.config import settings
from utils.metrics import mae, rmse, r2_score

MODEL_DIR = Path(settings.MODEL_DIR)


def evaluate_model(data_path: Path, target: str, excluded_columns: list[str], model_path: Path, scaler_path: Path, name: str) -> None:
    if not data_path.exists():
        print(f"No se encontró el archivo de datos: {data_path}")
        return
    if not model_path.exists() or not scaler_path.exists():
        print(f"Faltan artefactos de modelo para {name}")
        return

    df = pd.read_csv(data_path)
    features = [col for col in df.columns if col not in excluded_columns]
    X = df[features].fillna(0)
    y = df[target].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    scaler = joblib.load(scaler_path)
    model = joblib.load(model_path)

    X_test_scaled = scaler.transform(X_test)
    predictions = model.predict(X_test_scaled)

    print(f"Evaluación {name}")
    print("RMSE:", rmse(y_test.tolist(), predictions.tolist()))
    print("MAE:", mae(y_test.tolist(), predictions.tolist()))
    print("R2:", r2_score(y_test.tolist(), predictions.tolist()))
    print("-")


def main() -> None:
    evaluate_model(
        Path("../data/processed/brotes_processed.csv").resolve(),
        target="casos",
        excluded_columns=["fecha", "municipio", "casos"],
        model_path=MODEL_DIR / "brotes" / "brotes_model.pkl",
        scaler_path=MODEL_DIR / "brotes" / "scaler.pkl",
        name="Brotes",
    )
    evaluate_model(
        Path("../data/processed/demanda_processed.csv").resolve(),
        target="demanda",
        excluded_columns=["fecha", "servicio", "demanda"],
        model_path=MODEL_DIR / "demanda" / "demanda_model.pkl",
        scaler_path=MODEL_DIR / "demanda" / "scaler.pkl",
        name="Demanda",
    )


if __name__ == "__main__":
    main()
