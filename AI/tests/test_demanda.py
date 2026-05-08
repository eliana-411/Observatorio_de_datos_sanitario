import json
from pathlib import Path

import joblib
import numpy as np

from prediction.demanda_predictor import DemandaPredictor


class DummyModel:
    def predict(self, X):
        return np.arange(len(X)) * 2.0


class DummyScaler:
    def transform(self, X):
        return np.array(X, dtype=float)


def test_demanda_predictor_forecasts(tmp_path: Path):
    model_path = tmp_path / 'demanda_model.pkl'
    scaler_path = tmp_path / 'scaler.pkl'
    config_path = tmp_path / 'config.json'

    joblib.dump(DummyModel(), model_path)
    joblib.dump(DummyScaler(), scaler_path)

    config = {
        'features': ['dia', 'mes', 'dia_semana'],
        'model_type': 'dummy_gb',
        'version': '0.1',
    }
    config_path.write_text(json.dumps(config), encoding='utf-8')

    predictor = DemandaPredictor(
        model_path=str(model_path),
        scaler_path=str(scaler_path),
        config_path=str(config_path),
    )

    result = predictor.forecast('UCI', '2026-05-08', horizonte=4)

    assert result['servicio'] == 'UCI'
    assert result['fechas'] == ['2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11']
    assert result['demanda_estimadas'] == [0.0, 2.0, 4.0, 6.0]
    assert result['modelo'] == 'dummy_gb'
    assert result['version'] == '0.1'
