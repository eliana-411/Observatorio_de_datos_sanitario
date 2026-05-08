from fastapi.testclient import TestClient

import api.main as main


def test_health_route_is_available():
    client = TestClient(main.app)
    response = client.get('/api/v1/health')

    assert response.status_code == 200
    payload = response.json()
    assert payload['service'] == 'ai-observatorio'
    assert payload['status'] == 'ok'
