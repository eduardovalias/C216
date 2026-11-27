from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import MovieOut, RatingPayload
from app.services import ratings as service

router = APIRouter(prefix="/api/movies", tags=["Avaliações"])


@router.put("/{movie_id}/rating", response_model=MovieOut)
def rate(movie_id: int, payload: RatingPayload, db: Session = Depends(get_db)):
    return service.upsert(db, movie_id, payload)


@router.delete("/{movie_id}/rating", response_model=MovieOut)
def unrate(movie_id: int, db: Session = Depends(get_db)):
    return service.remove(db, movie_id)
