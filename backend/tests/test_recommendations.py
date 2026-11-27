def make_movie(client, title, genre, year=2020):
    payload = {"title": title, "genre": genre, "year": year, "duration_min": 110, "synopsis": ""}
    return client.post("/api/movies", json=payload).json()["id"]


def test_recommendations_empty_without_ratings(client):
    make_movie(client, "Filme A", "Terror")
    assert client.get("/api/recommendations").json() == []
    assert client.get("/api/stats").json() == {"movies": 1, "rated": 0, "watchlist": 0, "average_rating": None}


def test_genre_based_recommendations_ignore_rated_movies(client):
    horror = make_movie(client, "Terror visto", "Terror")
    suggested_horror = make_movie(client, "Terror novo", "Terror")
    action = make_movie(client, "Ação vista", "Ação")
    suggested_action = make_movie(client, "Ação nova", "Ação")
    make_movie(client, "Drama sem nota", "Drama")
    client.put(f"/api/movies/{horror}/rating", json={"score": 5})
    client.put(f"/api/movies/{action}/rating", json={"score": 2})
    results = client.get("/api/recommendations").json()
    assert [item["movie"]["id"] for item in results] == [suggested_horror, suggested_action]
    assert results[0]["score"] == 5.0
    assert results[1]["score"] == 2.0
    assert results[0]["sample_size"] == 1
    assert client.get("/api/recommendations", params={"limit": 1}).json()[0]["movie"]["id"] == suggested_horror


def test_stats_update_after_rating_and_watchlist(client):
    first = make_movie(client, "Teste 1", "Terror")
    second = make_movie(client, "Teste 2", "Terror")
    client.put(f"/api/movies/{first}/rating", json={"score": 4})
    client.patch(f"/api/movies/{second}/watchlist", json={"watchlisted": True})
    stats = client.get("/api/stats").json()
    assert stats == {"movies": 2, "rated": 1, "watchlist": 1, "average_rating": 4.0}
    assert client.get("/api/recommendations", params={"limit": 0}).status_code == 422


def test_cors_accepts_explicit_frontend_origin(client):
    result = client.options(
        "/api/movies",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert result.status_code == 200
    assert result.headers["access-control-allow-origin"] == "http://localhost:5173"
