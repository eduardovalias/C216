from sqlalchemy import Boolean, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
class Movie(Base):
    __tablename__ = "movies"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), index=True)
    genre: Mapped[str] = mapped_column(String(40))
    year: Mapped[int] = mapped_column(Integer)
    duration_min: Mapped[int] = mapped_column(Integer)
    synopsis: Mapped[str] = mapped_column(String(600), default="")
    watchlisted: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (Index("uq_movies_title_lower", func.lower(title), unique=True),)
