from collections import defaultdict

from sqlalchemy.orm import Session

from app.repositories.movies import list_movies


def suggestions(db: Session, limit: int = 8):
    movies = list_movies(db)
    genres = defaultdict(list)
    for movie in movies:
        if movie.rating:
            genres[movie.genre].append(movie.rating.score)
    if not genres:
        return []
    result = []
    for movie in movies:
        if movie.rating or movie.genre not in genres:
            continue
        scores = genres[movie.genre]
        affinity = round(sum(scores) / len(scores), 1)
        result.append({
            "movie": movie,
            "score": affinity,
            "sample_size": len(scores),
            "reason": f"Você avaliou {len(scores)} filme(s) de {movie.genre.lower()} com média {affinity}/5.",
        })
    result.sort(key=lambda item: (-item["score"], -item["sample_size"], -item["movie"].year, item["movie"].title))
    return result[:limit]


def stats(db: Session):
    movies = list_movies(db)
    scores = [movie.rating.score for movie in movies if movie.rating]
    return {
        "movies": len(movies),
        "rated": len(scores),
        "watchlist": sum(movie.watchlisted for movie in movies),
        "average_rating": round(sum(scores) / len(scores), 1) if scores else None,
    }
