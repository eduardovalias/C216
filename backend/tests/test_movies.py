def test_movie_crud_and_persistence(client, movie_payload):
    created = client.post("/api/movies", json=movie_payload)
    assert created.status_code == 201
    movie_id = created.json()["id"]
    assert client.get(f"/api/movies/{movie_id}").json()["title"] == movie_payload["title"]
    assert len(client.get("/api/movies").json()) == 1
    changed = {**movie_payload, "title": "Novo nome", "genre": "Drama"}
    assert client.put(f"/api/movies/{movie_id}", json=changed).status_code == 200
    assert client.get("/api/movies", params={"genre": "Terror"}).json() == []
    assert len(client.get("/api/movies", params={"genre": "Drama", "search": "novo"}).json()) == 1
    assert client.delete(f"/api/movies/{movie_id}").status_code == 204
    assert client.get(f"/api/movies/{movie_id}").status_code == 404


def test_case_insensitive_duplicate_title(client, movie_payload):
    assert client.post("/api/movies", json=movie_payload).status_code == 201
    duplicate = client.post("/api/movies", json={**movie_payload, "title": "  FILME DE TESTE "})
    assert duplicate.status_code == 409
    assert "Já existe" in duplicate.json()["detail"]


def test_blank_title_and_invalid_genre(client, movie_payload):
    assert client.post("/api/movies", json={**movie_payload, "title": "  "}).status_code == 422
    assert client.post("/api/movies", json={**movie_payload, "genre": "Outros"}).status_code == 422
    assert client.post("/api/movies", json={**movie_payload, "year": 1800}).status_code == 422


def test_missing_movie_returns_404(client, movie_payload):
    assert client.get("/api/movies/777").status_code == 404
    assert client.put("/api/movies/777", json=movie_payload).status_code == 404
    assert client.delete("/api/movies/777").status_code == 404


def test_duplicate_title_when_updating(client, movie_payload):
    first = client.post("/api/movies", json=movie_payload).json()["id"]
    second = client.post("/api/movies", json={**movie_payload, "title": "Outro"}).json()["id"]
    res = client.put(f"/api/movies/{second}", json=movie_payload)
    assert res.status_code == 409
    assert first != second
