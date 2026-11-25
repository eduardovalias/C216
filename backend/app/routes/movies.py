from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories import movies as repo
from app.schemas import Genre, MovieOut, MoviePayload
from app.services import movies as service
router = APIRouter(prefix="/api/movies", tags=["Filmes"])

@router.get("", response_model=list[MovieOut])
def list_all(search: str = "", genre: Genre | None = None, db: Session = Depends(get_db)):
    return repo.list_movies(db, search, genre)

@router.get("/{movie_id}", response_model=MovieOut)
def get_one(movie_id: int, db: Session = Depends(get_db)):
    return service.require_movie(db, movie_id)

@router.post("", response_model=MovieOut, status_code=status.HTTP_201_CREATED)
def create(payload: MoviePayload, db: Session = Depends(get_db)):
    return service.create(db, payload)

@router.put("/{movie_id}", response_model=MovieOut)
def edit(movie_id: int, payload: MoviePayload, db: Session = Depends(get_db)):
    return service.update(db, movie_id, payload)

@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(movie_id: int, db: Session = Depends(get_db)):
    service.delete(db, movie_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
