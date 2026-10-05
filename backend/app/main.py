from fastapi import FastAPI

from app.api.routes.home import router as home_router
from app.api.routes.items import router as items_router

app = FastAPI(title="C216 Backend")

app.include_router(home_router)
app.include_router(items_router)