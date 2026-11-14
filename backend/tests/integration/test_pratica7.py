def test_health_checks_database(api_client):
    response = api_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_preflight_cors_allows_explicit_origin(api_client):
    response = api_client.options(
        "/items/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "POST" in response.headers["access-control-allow-methods"]


def test_cors_rejects_other_origins(api_client):
    response = api_client.options(
        "/items/",
        headers={
            "Origin": "http://outro-site.invalid",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_item_persists_across_requests(api_client):
    created = api_client.post("/items/", json={"name": "Persistente", "description": "Teste"})
    assert created.status_code == 201
    listed = api_client.get("/items/")
    assert any(x["id"] == created.json()["id"] for x in listed.json())


def test_duplicate_item_name_returns_409(api_client):
    first = api_client.post("/items/", json={"name": "Caderno"})
    second = api_client.post("/items/", json={"name": " cAdErNo "})
    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["detail"] == "Já existe um item com esse nome."
    assert len(api_client.get("/items/").json()) == 1


def test_cannot_rename_to_existing_name(api_client):
    api_client.post("/items/", json={"name": "Mouse"})
    other = api_client.post("/items/", json={"name": "Teclado"})
    updated = api_client.patch(f"/items/{other.json()['id']}", json={"name": "mouse"})
    assert updated.status_code == 409
    assert api_client.get(f"/items/{other.json()['id']}").json()["name"] == "Teclado"


def test_invalid_name_is_rejected(api_client):
    response = api_client.post("/items/", json={"name": "  "})
    assert response.status_code == 422
