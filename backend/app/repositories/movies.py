from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models import Movie

def list_movies(db: Session, search: str = "", genre: str | None = None, watchlist: bool | None = None) -> list[Movie]:
    stmt = select(Movie)
    if search.strip():
        stmt = stmt.where(Movie.title.ilike(f"%{search.strip()}%"))
    if genre:
        stmt = stmt.where(Movie.genre == genre)
    if watchlist is not None:
        stmt = stmt.where(Movie.watchlisted == watchlist)
    return list(db.scalars(stmt.order_by(Movie.title)).all())

def by_id(db: Session, movie_id: int) -> Movie | None:
    return db.get(Movie, movie_id)

def by_title(db: Session, title: str, except_id: int | None = None) -> Movie | None:
    stmt = select(Movie).where(func.lower(Movie.title) == title.lower())
    if except_id is not None:
        stmt = stmt.where(Movie.id != except_id)
    return db.scalar(stmt)
