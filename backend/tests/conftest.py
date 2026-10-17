from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.item import Item


@pytest.fixture
def api_client(tmp_path, monkeypatch) -> Iterator[TestClient]:
    db_path = tmp_path / "test_items.db"
    test_url = f"sqlite+pysqlite:///{db_path.as_posix()}"

    monkeypatch.setenv("DATABASE_URL", test_url)

    from app.database.session import get_session
    from app.main import app

    engine = create_engine(
        test_url,
        connect_args={"check_same_thread": False},
    )

    Item.metadata.create_all(engine)

    def test_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = test_session

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        engine.dispose()