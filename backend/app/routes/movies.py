from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories import movies as repo
from app.schemas import MovieOut
router = APIRouter(prefix="/api/movies", tags=["Filmes"])

@router.get("", response_model=list[MovieOut])
def list_all(db: Session = Depends(get_db)):
    return repo.list_movies(db)
