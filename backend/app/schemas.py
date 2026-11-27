from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Genre = Literal["Terror", "Ficção científica", "Suspense", "Drama", "Ação", "Animação", "Comédia"]


class MoviePayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    genre: Genre
    year: int = Field(ge=1888, le=2100)
    duration_min: int = Field(ge=30, le=350)
    synopsis: str = Field(default="", max_length=600)


class RatingPayload(BaseModel):
    score: int = Field(ge=1, le=5)
    comment: str = Field(default="", max_length=300)


class WatchlistPayload(BaseModel):
    watchlisted: bool


class RatingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    score: int
    comment: str


class MovieOut(MoviePayload):
    model_config = ConfigDict(from_attributes=True)
    id: int
    watchlisted: bool
    rating: RatingOut | None = None


class RecommendationOut(BaseModel):
    movie: MovieOut
    score: float
    sample_size: int
    reason: str


class StatsOut(BaseModel):
    movies: int
    rated: int
    watchlist: int
    average_rating: float | None
