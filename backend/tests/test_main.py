import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def api_client():
    return TestClient(app)


def test_home_returns_expected_message(api_client):
    response = api_client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "C216 backend online"}


def test_home_returns_json(api_client):
    response = api_client.get("/")

    assert "application/json" in response.headers["content-type"]


def test_swagger_page_is_available(api_client):
    response = api_client.get("/docs")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_redoc_page_is_available(api_client):
    response = api_client.get("/redoc")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


@pytest.mark.parametrize(
    "invalid_path",
    [
        "/pagina-inexistente",
        "/usuarios/999",
        "/api/nao-existe",
    ],
)
def test_invalid_paths_return_not_found(api_client, invalid_path):
    response = api_client.get(invalid_path)

    assert response.status_code == 404
    assert response.json()["detail"] == "Not Found"