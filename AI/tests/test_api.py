from fastapi.testclient import TestClient

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
