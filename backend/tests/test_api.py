from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Service is healthy"}

def test_search_unauthorized_missing_header():
    response = client.post("/v1/search/", json={"query": "test"})
    assert response.status_code == 401
    assert response.json()["detail"] == "X-Site-Key header missing"
