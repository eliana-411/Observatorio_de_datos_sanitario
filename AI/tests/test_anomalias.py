import json
from pathlib import Path

import joblib
import numpy as np

from prediction.anomalia_detector import AnomaliaDetector


class DummyModel:
    def decision_function(self, X):
        return np.array([-0.2])


class DummyScaler:
    def transform(self, X):
        return np.array([[float(value) for value in X.iloc[0].values]])


def test_anomalia_detector_identifies_anomaly(tmp_path: Path):
    model_path = tmp_path / 'anomalia_model.pkl'
    scaler_path = tmp_path / 'scaler.pkl'
    config_path = tmp_path / 'config.json'

    joblib.dump(DummyModel(), model_path)
    joblib.dump(DummyScaler(), scaler_path)

    config = {
        'features': ['valor1', 'valor2'],
        'version': '0.1',
        'threshold': -0.1,
    }
    config_path.write_text(json.dumps(config), encoding='utf-8')

    detector = AnomaliaDetector(
        model_path=str(model_path),
        scaler_path=str(scaler_path),
        config_path=str(config_path),
    )

    result = detector.detect({'valor1': 5, 'valor2': 2})

    assert result['es_anomalia'] is True
    assert result['puntuacion'] == -0.2
    assert result['detalles']['mensaje'] == 'Anomalía detectada'
