import json
from pathlib import Path

import joblib
import numpy as np

from prediction.brotes_predictor import BrotesPredictor


class DummyModel:
    def predict(self, X):
        return np.arange(len(X)) * 1.5


class DummyScaler:
    def transform(self, X):
        return np.array(X, dtype=float)


def test_brotes_predictor_loads_artifacts(tmp_path: Path):
    model_path = tmp_path / 'brotes_model.pkl'
    scaler_path = tmp_path / 'scaler.pkl'
    config_path = tmp_path / 'config.json'

    joblib.dump(DummyModel(), model_path)
    joblib.dump(DummyScaler(), scaler_path)

    config = {
        'features': ['dia', 'mes', 'dia_semana'],
        'model_type': 'dummy_rf',
        'version': '0.1',
    }
    config_path.write_text(json.dumps(config), encoding='utf-8')

    predictor = BrotesPredictor(
        model_path=str(model_path),
        scaler_path=str(scaler_path),
        config_path=str(config_path),
    )

    result = predictor.predict('Bogotá', '2026-05-08', dias_a_predecir=3)

    assert result['municipio'] == 'Bogotá'
    assert result['fechas'] == ['2026-05-08', '2026-05-09', '2026-05-10']
    assert result['casos_estimados'] == [0.0, 1.5, 3.0]
    assert result['modelo'] == 'dummy_rf'
    assert result['version'] == '0.1'
