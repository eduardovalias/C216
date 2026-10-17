from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.item_service import ItemService

router = APIRouter(
    prefix="/items",
    tags=["items"],
)


def get_item_service(
    db: Annotated[Session, Depends(get_session)],
) -> ItemService:
    return ItemService(ItemRepository(db))


ServiceDep = Annotated[ItemService, Depends(get_item_service)]


@router.get("/", response_model=list[ItemResponse])
def list_items(
    service: ServiceDep,
    name: str | None = Query(default=None),
):
    return service.list_items(name)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    service: ServiceDep,
    item_id: int = Path(gt=0),
):
    item = service.get_item(item_id)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.post("/", response_model=ItemResponse, status_code=201)
def create_item(
    data: ItemCreate,
    service: ServiceDep,
):
    return service.create_item(data)


@router.put("/{item_id}", response_model=ItemResponse)
def replace_item(
    data: ItemCreate,
    service: ServiceDep,
    item_id: int = Path(gt=0),
):
    item = service.replace_item(item_id, data)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(
    data: ItemUpdate,
    service: ServiceDep,
    item_id: int = Path(gt=0),
):
    item = service.update_item(item_id, data)

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return item


@router.delete("/{item_id}")
def delete_item(
    service: ServiceDep,
    item_id: int = Path(gt=0),
):
    deleted = service.delete_item(item_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"message": "Item deleted"}