import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import item_service


@pytest.fixture
def api_client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_items():
    item_service.items.clear()
    item_service.next_id = 1

    yield

    item_service.items.clear()
    item_service.next_id = 1