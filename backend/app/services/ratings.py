from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Rating
from app.schemas import RatingPayload
from app.services.movies import require_movie


def upsert(db: Session, movie_id: int, payload: RatingPayload):
    movie = require_movie(db, movie_id)
    if movie.rating is None:
        movie.rating = Rating(score=payload.score, comment=payload.comment)
    else:
        movie.rating.score = payload.score
        movie.rating.comment = payload.comment
    movie.watchlisted = False
    db.commit()
    db.refresh(movie)
    return movie


def remove(db: Session, movie_id: int):
    movie = require_movie(db, movie_id)
    if not movie.rating:
        raise HTTPException(404, "Este filme ainda não tem avaliação.")
    db.delete(movie.rating)
    db.commit()
    db.refresh(movie)
    return movie


def set_watchlist(db: Session, movie_id: int, watchlisted: bool):
    movie = require_movie(db, movie_id)
    if watchlisted and movie.rating:
        raise HTTPException(409, "Um filme já avaliado não pode entrar na lista Quero assistir.")
    movie.watchlisted = watchlisted
    db.commit()
    db.refresh(movie)
    return movie
