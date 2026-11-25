from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
Genre = Literal["Terror", "Ficção científica", "Suspense", "Drama", "Ação", "Animação", "Comédia"]
class MoviePayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    genre: Genre
    year: int = Field(ge=1888, le=2100)
    duration_min: int = Field(ge=30, le=350)
    synopsis: str = Field(default="", max_length=600)
class MovieOut(MoviePayload):
    model_config = ConfigDict(from_attributes=True)
    id: int
    watchlisted: bool
