from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Movie
from app.repositories import movies as repo
from app.schemas import MoviePayload


def require_movie(db: Session, movie_id: int) -> Movie:
    movie = repo.by_id(db, movie_id)
    if not movie:
        raise HTTPException(404, "Filme não encontrado.")
    return movie


def check_title(db: Session, title: str, except_id: int | None = None) -> str:
    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(422, "O título não pode ficar vazio.")
    if repo.by_title(db, clean_title, except_id):
        raise HTTPException(409, "Já existe um filme com esse título.")
    return clean_title


def save(db: Session, movie: Movie):
    try:
        db.add(movie)
        db.commit()
        db.refresh(movie)
        return movie
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Não foi possível salvar: registro duplicado.") from None


def create(db: Session, payload: MoviePayload):
    title = check_title(db, payload.title)
    return save(db, Movie(**{**payload.model_dump(), "title": title}))


def update(db: Session, movie_id: int, payload: MoviePayload):
    movie = require_movie(db, movie_id)
    values = payload.model_dump()
    values["title"] = check_title(db, payload.title, movie.id)
    for key, value in values.items():
        setattr(movie, key, value)
    return save(db, movie)


def delete(db: Session, movie_id: int):
    db.delete(require_movie(db, movie_id))
    db.commit()
