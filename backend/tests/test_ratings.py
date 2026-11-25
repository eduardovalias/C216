def test_rating_create_update_and_remove(client, movie_payload):
    movie_id = client.post("/api/movies", json=movie_payload).json()["id"]
    rated = client.put(f"/api/movies/{movie_id}/rating", json={"score": 5, "comment": "Excelente"})
    assert rated.status_code == 200
    assert rated.json()["rating"]["score"] == 5
    changed = client.put(f"/api/movies/{movie_id}/rating", json={"score": 3})
    assert changed.json()["rating"]["score"] == 3
    assert client.get(f"/api/movies/{movie_id}").json()["rating"]["score"] == 3
    removed = client.delete(f"/api/movies/{movie_id}/rating")
    assert removed.status_code == 200
    assert removed.json()["rating"] is None
    assert client.delete(f"/api/movies/{movie_id}/rating").status_code == 404


def test_rating_validation(client, movie_payload):
    movie_id = client.post("/api/movies", json=movie_payload).json()["id"]
    assert client.put(f"/api/movies/{movie_id}/rating", json={"score": 0}).status_code == 422
    assert client.put(f"/api/movies/{movie_id}/rating", json={"score": 6}).status_code == 422
    assert client.put("/api/movies/900/rating", json={"score": 3}).status_code == 404


def test_watchlist_and_rated_conflict(client, movie_payload):
    movie_id = client.post("/api/movies", json=movie_payload).json()["id"]
    saved = client.patch(f"/api/movies/{movie_id}/watchlist", json={"watchlisted": True})
    assert saved.json()["watchlisted"] is True
    assert len(client.get("/api/movies", params={"watchlist": True}).json()) == 1
    rated = client.put(f"/api/movies/{movie_id}/rating", json={"score": 4})
    assert rated.json()["watchlisted"] is False
    assert client.patch(f"/api/movies/{movie_id}/watchlist", json={"watchlisted": True}).status_code == 409


def test_delete_movie_cascades_its_rating(client, movie_payload):
    movie_id = client.post("/api/movies", json=movie_payload).json()["id"]
    client.put(f"/api/movies/{movie_id}/rating", json={"score": 3})
    assert client.delete(f"/api/movies/{movie_id}").status_code == 204
    assert client.get("/api/stats").json()["rated"] == 0
