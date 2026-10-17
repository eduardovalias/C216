from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item


class ItemRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_items(self, name: str | None = None) -> list[Item]:
        query = select(Item).order_by(Item.id)

        if name:
            query = query.where(Item.name.ilike(f"%{name}%"))

        return list(self.session.scalars(query).all())

    def get_item(self, item_id: int) -> Item | None:
        return self.session.get(Item, item_id)

    def create_item(self, name: str, description: str | None = None) -> Item:
        item = Item(name=name, description=description)

        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)

        return item

    def update_item(self, item: Item, changes: dict[str, Any]) -> Item:
        for field, value in changes.items():
            setattr(item, field, value)

        self.session.commit()
        self.session.refresh(item)

        return item

    def delete_item(self, item: Item) -> None:
        self.session.delete(item)
        self.session.commit()
