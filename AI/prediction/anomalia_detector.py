from __future__ import annotations
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from utils.config import settings


class AnomaliaDetector:
    """Carga el modelo de detección de anomalías y evalúa puntos nuevos."""

    def __init__(
        self,
        model_path: str | None = None,
        scaler_path: str | None = None,
        config_path: str | None = None,
    ):
        self.model_path = model_path or settings.MODEL_ANOMALIAS_PATH
        self.scaler_path = scaler_path or str(Path(settings.MODEL_DIR) / "anomalias" / "scaler.pkl")
        self.config_path = config_path or str(Path(settings.MODEL_DIR) / "anomalias" / "config.json")
        self.model = self._load_artifact(self.model_path)
        self.scaler = self._load_artifact(self.scaler_path)
        self.config = self._load_config(self.config_path)
        self.threshold = float(self.config.get("threshold", -0.01))

    def _load_artifact(self, path: str) -> Any:
        path_obj = Path(path)
        if not path_obj.exists():
            raise FileNotFoundError(f"No existe el archivo de modelo: {path}")
        return joblib.load(path)

    def _load_config(self, path: str) -> Dict[str, Any]:
        path_obj = Path(path)
        if not path_obj.exists():
            return {}
        return pd.read_json(path_obj, typ="series").to_dict()

    def _build_input_df(self, medidas: Dict[str, Any]) -> pd.DataFrame:
        features = self.config.get("features", list(medidas.keys()))
        df = pd.DataFrame([medidas])

        for feature in features:
            if feature not in df.columns:
                df[feature] = 0

        return df[features]

    def detect(self, medidas: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa si un registro contiene una anomalía."""
        df = self._build_input_df(medidas)
        X = self.scaler.transform(df.fillna(0))
        score = float(self.model.decision_function(X)[0])
        es_anomalia = bool(score < self.threshold)

        return {
            "puntuacion": score,
            "es_anomalia": es_anomalia,
            "threshold": self.threshold,
            "detalles": {
                "mensaje": "Anomalía detectada" if es_anomalia else "Sin anomalía",
                "features_evaluadas": list(df.columns),
            },
        }
