import os
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routes.home import router as home_router
from app.api.routes.items import router as items_router
from app.database.session import get_session

app = FastAPI(title="C216 Backend")

# Origem explícita: o navegador da máquina do aluno e o navegador no Docker E2E.
origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health", tags=["health"])
def health(session: Annotated[Session, Depends(get_session)]):
    session.execute(text("SELECT 1"))
    return {"status": "ok"}


app.include_router(home_router)
app.include_router(items_router)
