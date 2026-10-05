from fastapi import APIRouter, HTTPException, Path, Query

from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services import item_service

router = APIRouter(
    prefix="/items",
    tags=["items"],
)


@router.get("/", response_model=list[ItemResponse])
def list_items(
    name: str | None = Query(default=None),
):
    return item_service.list_items(name)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int = Path(gt=0),
):
    item = item_service.get_item(item_id)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.post("/", response_model=ItemResponse, status_code=201)
def create_item(data: ItemCreate):
    return item_service.create_item(data)


@router.put("/{item_id}", response_model=ItemResponse)
def replace_item(
    data: ItemCreate,
    item_id: int = Path(gt=0),
):
    item = item_service.replace_item(item_id, data)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(
    data: ItemUpdate,
    item_id: int = Path(gt=0),
):
    item = item_service.update_item(item_id, data)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int = Path(gt=0),
):
    deleted = item_service.delete_item(item_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"message": "Item deleted"}