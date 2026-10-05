from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():
    return {"message": "C216 backend online"}