from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    def __init__(self, repository: ItemRepository):
        self.repository = repository

    def list_items(self, name: str | None = None) -> list[Item]:
        return self.repository.list_items(name)

    def get_item(self, item_id: int) -> Item | None:
        return self.repository.get_item(item_id)

    def create_item(self, data: ItemCreate) -> Item:
        return self.repository.create_item(
            name=data.name,
            description=data.description,
        )

    def replace_item(self, item_id: int, data: ItemCreate) -> Item | None:
        item = self.repository.get_item(item_id)

        if item is None:
            return None

        return self.repository.update_item(item, data.model_dump())

    def update_item(self, item_id: int, data: ItemUpdate) -> Item | None:
        item = self.repository.get_item(item_id)

        if item is None:
            return None

        changes = data.model_dump(exclude_unset=True)
        return self.repository.update_item(item, changes)

    def delete_item(self, item_id: int) -> bool:
        item = self.repository.get_item(item_id)

        if item is None:
            return False

        self.repository.delete_item(item)
        return True