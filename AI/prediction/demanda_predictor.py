from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

from utils.config import settings
from utils.database import get_sqlserver_engine


class DemandaPredictor:
    """Carga el modelo de demanda y genera pronósticos de ocupación hospitalaria."""

    def __init__(
        self,
        model_path: str | None = None,
        scaler_path: str | None = None,
        config_path: str | None = None,
    ):
        self.model_path = model_path or settings.MODEL_DEMANDA_PATH
        self.scaler_path = scaler_path or str(Path(settings.MODEL_DIR) / "demanda" / "scaler.pkl")
        self.config_path = config_path or str(Path(settings.MODEL_DIR) / "demanda" / "config.json")
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
        servicio: str,
        fecha_inicio: str,
        horizonte: int,
        variables_externas: Dict[str, Any] | None = None,
    ) -> pd.DataFrame:
        fecha_inicio = pd.to_datetime(fecha_inicio)
        fechas = pd.date_range(start=fecha_inicio, periods=horizonte)
        df = pd.DataFrame(
            {
                "servicio": [servicio] * horizonte,
                "fecha": fechas,
                "dia": fechas.day,
                "mes": fechas.month,
                "dia_semana": fechas.dayofweek,
            }
        )

        if variables_externas:
            for key, value in variables_externas.items():
                df[key] = value if isinstance(value, (int, float)) else 0

        feature_columns = self.config.get(
            "features",
            ["dia", "mes", "dia_semana"],
        )

        lag_columns = [c for c in feature_columns if c.startswith("lag_")]
        if lag_columns:
            lag_values = self._fetch_lag_values(servicio, fecha_inicio, lag_columns)
            for lag_column in lag_columns:
                df[lag_column] = lag_values.get(lag_column, 0)

        for column in feature_columns:
            if column not in df.columns:
                df[column] = 0

        return df[feature_columns]

    def _fetch_lag_values(
        self,
        servicio: str,
        fecha_inicio: str,
        lag_columns: List[str],
    ) -> Dict[str, float]:
        fecha_inicio = pd.to_datetime(fecha_inicio)
        lags = sorted({int(col.split("_")[-1]) for col in lag_columns if col.startswith("lag_")})
        if not lags:
            return {}

        engine = get_sqlserver_engine()
        query = (
            f"SELECT TOP {max(lags)} fecha, demanda "
            "FROM vw_demanda "
            "WHERE servicio = ? AND fecha < ? "
            "ORDER BY fecha DESC"
        )
        df = pd.read_sql_query(query, engine, params=[servicio, fecha_inicio])

        lag_values: Dict[str, float] = {}
        for lag in lags:
            if len(df) >= lag:
                lag_values[f"lag_demanda_{lag}"] = float(df.iloc[lag - 1]["demanda"])
            else:
                lag_values[f"lag_demanda_{lag}"] = 0.0

        return lag_values

    def forecast(
        self,
        servicio: str,
        fecha_inicio: str,
        horizonte: int = 7,
        variables_externas: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """Devuelve el pronóstico de demanda para el servicio solicitado."""
        features = self._build_features(servicio, fecha_inicio, horizonte, variables_externas)
        scaled = self.scaler.transform(features)
        predictions = self.model.predict(scaled)

        fecha_inicio = pd.to_datetime(fecha_inicio)
        fechas = [(fecha_inicio + pd.Timedelta(days=i)).strftime("%Y-%m-%d") for i in range(horizonte)]

        return {
            "servicio": servicio,
            "fechas": fechas,
            "demanda_estimadas": [float(x) for x in predictions],
            "modelo": self.config.get("model_type", "gradient_boosting"),
            "version": self.config.get("version", "1.0"),
        }
