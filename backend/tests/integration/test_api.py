import pytest


def test_home_returns_expected_message(api_client):
    response = api_client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "C216 backend online"}


def test_swagger_page_is_available(api_client):
    response = api_client.get("/docs")

    assert response.status_code == 200


def test_create_item(api_client):
    response = api_client.post(
        "/items/",
        json={
            "name": "Notebook",
            "description": "Notebook de teste",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Notebook"
    assert response.json()["id"] == 1


def test_list_items(api_client):
    api_client.post(
        "/items/",
        json={"name": "Mouse"},
    )

    response = api_client.get("/items/")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Mouse"


def test_get_item_by_id(api_client):
    created = api_client.post(
        "/items/",
        json={"name": "Teclado"},
    )

    item_id = created.json()["id"]

    response = api_client.get(f"/items/{item_id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Teclado"


def test_replace_item(api_client):
    created = api_client.post(
        "/items/",
        json={"name": "Monitor"},
    )

    item_id = created.json()["id"]

    response = api_client.put(
        f"/items/{item_id}",
        json={
            "name": "Monitor 4K",
            "description": "Novo monitor",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Monitor 4K"
    assert response.json()["description"] == "Novo monitor"


def test_update_item(api_client):
    created = api_client.post(
        "/items/",
        json={"name": "Mouse"},
    )

    item_id = created.json()["id"]

    response = api_client.patch(
        f"/items/{item_id}",
        json={"name": "Mouse Gamer"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Mouse Gamer"


def test_delete_item(api_client):
    created = api_client.post(
        "/items/",
        json={"name": "Headset"},
    )

    item_id = created.json()["id"]

    response = api_client.delete(f"/items/{item_id}")

    assert response.status_code == 200
    assert response.json() == {"message": "Item deleted"}

    response = api_client.get(f"/items/{item_id}")

    assert response.status_code == 404


def test_filter_items_with_query_parameter(api_client):
    api_client.post("/items/", json={"name": "Mouse Gamer"})
    api_client.post("/items/", json={"name": "Teclado"})

    response = api_client.get("/items/?name=mouse")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Mouse Gamer"


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