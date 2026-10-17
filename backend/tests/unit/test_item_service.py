from app.schemas.item import ItemCreate, ItemUpdate
from app.services import item_service


def test_create_item():
    data = ItemCreate(
        name="Notebook",
        description="Notebook de teste",
    )

    item = item_service.create_item(data)

    assert item["id"] == 1
    assert item["name"] == "Notebook"
    assert item["description"] == "Notebook de teste"


def test_get_item():
    data = ItemCreate(name="Mouse")
    created_item = item_service.create_item(data)

    item = item_service.get_item(created_item["id"])

    assert item is not None
    assert item["name"] == "Mouse"


def test_update_item():
    created_item = item_service.create_item(
        ItemCreate(name="Teclado")
    )

    updated_item = item_service.update_item(
        created_item["id"],
        ItemUpdate(name="Teclado Mecânico"),
    )

    assert updated_item["name"] == "Teclado Mecânico"


def test_delete_item():
    created_item = item_service.create_item(
        ItemCreate(name="Monitor")
    )

    deleted = item_service.delete_item(created_item["id"])

    assert deleted is True
    assert item_service.get_item(created_item["id"]) is None


def test_filter_items_by_name():
    item_service.create_item(ItemCreate(name="Mouse Gamer"))
    item_service.create_item(ItemCreate(name="Teclado"))
    item_service.create_item(ItemCreate(name="Mouse sem fio"))

    result = item_service.list_items("mouse")

    assert len(result) == 2