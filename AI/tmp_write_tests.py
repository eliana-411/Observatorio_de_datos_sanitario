from pathlib import Path

base = Path('.')
base.mkdir(parents=True, exist_ok=True)

files = {
    'tests/test_brotes.py': """import json
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
""",
    'tests/test_demanda.py': """import json
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
""",
    'tests/test_anomalias.py': """import json
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
""",
    'tests/test_api.py': """from fastapi.testclient import TestClient

import api.main as main
from api.routes import brotes as brotes_route, demanda as demanda_route, anomalias as anomalias_route


class DummyBrotesPredictor:
    def predict(self, municipio, fecha_inicio, dias_a_predecir, variables_externas=None):
        return {
            'municipio': municipio,
            'fechas': [fecha_inicio],
            'casos_estimados': [1.0],
            'modelo': 'dummy',
            'version': '0.1',
        }


class DummyDemandaPredictor:
    def forecast(self, servicio, fecha_inicio, horizonte, variables_externas=None):
        return {
            'servicio': servicio,
            'fechas': [fecha_inicio],
            'demanda_estimadas': [2.0],
            'modelo': 'dummy',
            'version': '0.1',
        }


class DummyAnomaliaDetector:
    def detect(self, medidas):
        return {
            'es_anomalia': False,
            'puntuacion': 0.5,
            'detalles': {'mensaje': 'sin anomalía'},
        }


def test_health_endpoint():
    client = TestClient(main.app)
    response = client.get('/api/v1/health')

    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_brotes_prediction_endpoint(monkeypatch):
    monkeypatch.setattr(brotes_route, 'brotes_predictor', DummyBrotesPredictor())
    monkeypatch.setattr(brotes_route, 'jwt_required', lambda authorization=None: 'dummy')
    client = TestClient(main.app)

    payload = {
        'municipio': 'Bogotá',
        'fecha_inicio': '2026-05-08',
        'dias_a_predecir': 1,
    }
    response = client.post('/api/v1/predict/brotes', json=payload)

    assert response.status_code == 200
    assert response.json()['casos_estimados'] == [1.0]


def test_demanda_prediction_endpoint(monkeypatch):
    monkeypatch.setattr(demanda_route, 'demanda_predictor', DummyDemandaPredictor())
    monkeypatch.setattr(demanda_route, 'jwt_required', lambda authorization=None: 'dummy')
    client = TestClient(main.app)

    payload = {
        'servicio': 'UCI',
        'fecha_inicio': '2026-05-08',
        'horizonte': 1,
    }
    response = client.post('/api/v1/predict/demanda', json=payload)

    assert response.status_code == 200
    assert response.json()['demanda_estimadas'] == [2.0]


def test_anomalias_detection_endpoint(monkeypatch):
    monkeypatch.setattr(anomalias_route, 'anomalias_detector', DummyAnomaliaDetector())
    monkeypatch.setattr(anomalias_route, 'jwt_required', lambda authorization=None: 'dummy')
    client = TestClient(main.app)

    payload = {
        'entidad': 'Hospital A',
        'fecha': '2026-05-08',
        'medidas': {'valor1': 1.0},
    }
    response = client.post('/api/v1/detect/anomalias', json=payload)

    assert response.status_code == 200
    assert response.json()['es_anomalia'] is False
""",
    'tests/test_integration.py': """from fastapi.testclient import TestClient

import api.main as main


def test_health_route_is_available():
    client = TestClient(main.app)
    response = client.get('/api/v1/health')

    assert response.status_code == 200
    payload = response.json()
    assert payload['service'] == 'ai-observatorio'
    assert payload['status'] == 'ok'
""",
}

for path, content in files.items():
    p = base / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')
