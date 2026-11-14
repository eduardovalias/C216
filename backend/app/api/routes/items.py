from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.item_service import ItemService

router = APIRouter(prefix="/items", tags=["items"])


def get_item_service(
    db: Annotated[Session, Depends(get_session)],
) -> ItemService:
    return ItemService(ItemRepository(db))


ServiceDep = Annotated[ItemService, Depends(get_item_service)]


def raise_if_duplicate(exc: IntegrityError) -> None:
    # SQLSTATE 23505 = unique_violation no PostgreSQL; SQLite usa mensagem.
    sqlstate = getattr(exc.orig, "sqlstate", None)
    if sqlstate == "23505" or "unique" in str(exc.orig).lower():
        raise HTTPException(
            status_code=409, detail="Já existe um item com esse nome."
        ) from exc
    raise exc


@router.get("/", response_model=list[ItemResponse])
def list_items(
    service: ServiceDep,
    name: str | None = Query(default=None),
):
    return service.list_items(name)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(service: ServiceDep, item_id: int = Path(gt=0)):
    item = service.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/", response_model=ItemResponse, status_code=201)
def create_item(data: ItemCreate, service: ServiceDep):
    try:
        return service.create_item(data)
    except IntegrityError as exc:
        raise_if_duplicate(exc)


@router.put("/{item_id}", response_model=ItemResponse)
def replace_item(data: ItemCreate, service: ServiceDep, item_id: int = Path(gt=0)):
    try:
        item = service.replace_item(item_id, data)
    except IntegrityError as exc:
        raise_if_duplicate(exc)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(data: ItemUpdate, service: ServiceDep, item_id: int = Path(gt=0)):
    try:
        item = service.update_item(item_id, data)
    except IntegrityError as exc:
        raise_if_duplicate(exc)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}")
def delete_item(service: ServiceDep, item_id: int = Path(gt=0)):
    if not service.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}
