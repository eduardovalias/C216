from unittest.mock import Mock

import pytest

from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate
from app.services.item_service import ItemService


@pytest.fixture
def repository():
    return Mock(spec=ItemRepository)


@pytest.fixture
def service(repository):
    return ItemService(repository)


def test_list_items_with_name_filter(service, repository):
    item = Item(id=1, name="Notebook", description=None)
    repository.list_items.return_value = [item]

    result = service.list_items("note")

    assert result == [item]
    repository.list_items.assert_called_once_with("note")


def test_get_existing_item(service, repository):
    item = Item(id=3, name="Mouse", description=None)
    repository.get_item.return_value = item

    result = service.get_item(3)

    assert result is item
    repository.get_item.assert_called_once_with(3)


def test_get_nonexistent_item(service, repository):
    repository.get_item.return_value = None

    result = service.get_item(999)

    assert result is None


def test_create_item(service, repository):
    data = ItemCreate(name="Teclado", description="Mecanico")
    item = Item(id=5, name="Teclado", description="Mecanico")
    repository.create_item.return_value = item

    result = service.create_item(data)

    assert result is item
    repository.create_item.assert_called_once_with(
        name="Teclado",
        description="Mecanico",
    )


def test_replace_item(service, repository):
    original = Item(id=2, name="Monitor", description=None)
    updated = Item(id=2, name="Monitor 4K", description="Novo modelo")

    repository.get_item.return_value = original
    repository.update_item.return_value = updated

    data = ItemCreate(
        name="Monitor 4K",
        description="Novo modelo",
    )

    result = service.replace_item(2, data)

    assert result.name == "Monitor 4K"
    repository.update_item.assert_called_once_with(
        original,
        {"name": "Monitor 4K", "description": "Novo modelo"},
    )


def test_partial_update_preserves_other_fields(service, repository):
    item = Item(id=4, name="Headset", description="Antiga")

    repository.get_item.return_value = item
    repository.update_item.return_value = item

    service.update_item(4, ItemUpdate(description="Atualizada"))

    repository.update_item.assert_called_once_with(
        item,
        {"description": "Atualizada"},
    )


def test_delete_existing_item(service, repository):
    item = Item(id=6, name="Webcam", description=None)
    repository.get_item.return_value = item

    result = service.delete_item(6)

    assert result is True
    repository.delete_item.assert_called_once_with(item)


def test_delete_nonexistent_item(service, repository):
    repository.get_item.return_value = None

    result = service.delete_item(999)

    assert result is False
    repository.delete_item.assert_not_called()
