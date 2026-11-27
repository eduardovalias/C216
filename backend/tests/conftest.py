import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine("sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)

    def session():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def movie_payload():
    return {"title": "Filme de teste", "genre": "Terror", "year": 2020, "duration_min": 110, "synopsis": "Sinopse de teste."}
