from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RecommendationOut, StatsOut
from app.services import recommendations as service

router = APIRouter(prefix="/api", tags=["Descoberta"])


@router.get("/recommendations", response_model=list[RecommendationOut])
def recommendations(limit: int = Query(default=8, ge=1, le=30), db: Session = Depends(get_db)):
    return service.suggestions(db, limit)


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    return service.stats(db)
