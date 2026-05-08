from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

from utils.config import settings
from utils.database import get_sqlserver_engine


class BrotesPredictor:
    """Carga el modelo de brotes y genera predicciones para un municipio y horizonte."""

    def __init__(
        self,
        model_path: str | None = None,
        scaler_path: str | None = None,
        config_path: str | None = None,
    ):
        self.model_path = model_path or settings.MODEL_BROTES_PATH
        self.scaler_path = scaler_path or str(Path(settings.MODEL_DIR) / "brotes" / "scaler.pkl")
        self.config_path = config_path or str(Path(settings.MODEL_DIR) / "brotes" / "config.json")
        self.model = self._load_artifact(self.model_path)
        self.scaler = self._load_artifact(self.scaler_path)
        self.config = self._load_config(self.config_path)

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

    def _build_features(
        self,
        municipio: str,
        fecha_inicio: str,
        variables_externas: Dict[str, Any] | None = None,
    ) -> pd.DataFrame:
        fecha_inicio = pd.to_datetime(fecha_inicio)
        dias = pd.date_range(
            start=fecha_inicio,
            periods=variables_externas.get("dias_a_predecir", 1) if variables_externas else 1,
        )

        df = pd.DataFrame(
            {
                "municipio": [municipio] * len(dias),
                "fecha": dias,
                "dia": dias.day,
                "mes": dias.month,
                "dia_semana": dias.dayofweek,
            }
        )

        if variables_externas:
            for key, value in variables_externas.items():
                if key != "dias_a_predecir":
                    df[key] = value if isinstance(value, (int, float)) else 0

        feature_columns = self.config.get(
            "features",
            ["dia", "mes", "dia_semana"],
        )

        lag_columns = [c for c in feature_columns if c.startswith("lag_")]
        if lag_columns:
            lag_values = self._fetch_lag_values(municipio, fecha_inicio, lag_columns)
            for lag_column in lag_columns:
                df[lag_column] = lag_values.get(lag_column, 0)

        for column in feature_columns:
            if column not in df.columns:
                df[column] = 0

        df["fecha"] = dias
        return df

    def _fetch_lag_values(
        self,
        municipio: str,
        fecha_inicio: str,
        lag_columns: List[str],
    ) -> Dict[str, float]:
        fecha_inicio = pd.to_datetime(fecha_inicio)
        lags = sorted({int(col.split("_")[-1]) for col in lag_columns if col.startswith("lag_")})
        if not lags:
            return {}

        engine = get_sqlserver_engine()
        query = (
            f"SELECT TOP {max(lags)} fecha, casos "
            "FROM vw_brotes "
            "WHERE municipio = ? AND fecha < ? "
            "ORDER BY fecha DESC"
        )
        df = pd.read_sql_query(query, engine, params=[municipio, fecha_inicio])

        lag_values: Dict[str, float] = {}
        for lag in lags:
            if len(df) >= lag:
                lag_values[f"lag_casos_{lag}"] = float(df.iloc[lag - 1]["casos"])
            else:
                lag_values[f"lag_casos_{lag}"] = 0.0

        return lag_values

    def predict(
        self,
        municipio: str,
        fecha_inicio: str,
        dias_a_predecir: int = 7,
        variables_externas: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """Genera la predicción de casos de brotes para el periodo solicitado."""
        if variables_externas is None:
            variables_externas = {}
        variables_externas["dias_a_predecir"] = dias_a_predecir
        df = self._build_features(municipio, fecha_inicio, variables_externas)

        feature_columns = self.config.get(
            "features",
            ["dia", "mes", "dia_semana"],
        )
        X = df[feature_columns]

        scaled = self.scaler.transform(X)
        predictions = self.model.predict(scaled)

        return {
            "municipio": municipio,
            "fechas": df["fecha"].dt.strftime("%Y-%m-%d").tolist(),
            "casos_estimados": [float(x) for x in predictions],
            "modelo": self.config.get("model_type", "random_forest"),
            "version": self.config.get("version", "1.0"),
        }
