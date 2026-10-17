from app.schemas.item import ItemCreate, ItemUpdate

items = []
next_id = 1


def list_items(name: str | None = None):
    if name:
        return [
            item
            for item in items
            if name.lower() in item["name"].lower()
        ]

    return items


def get_item(item_id: int):
    for item in items:
        if item["id"] == item_id:
            return item

    return None


def create_item(data: ItemCreate):
    global next_id

    item = {
        "id": next_id,
        "name": data.name,
        "description": data.description,
    }

    items.append(item)
    next_id += 1

    return item


def replace_item(item_id: int, data: ItemCreate):
    item = get_item(item_id)

    if item is None:
        return None

    item["name"] = data.name
    item["description"] = data.description

    return item


def update_item(item_id: int, data: ItemUpdate):
    item = get_item(item_id)

    if item is None:
        return None

    if data.name is not None:
        item["name"] = data.name

    if data.description is not None:
        item["description"] = data.description

    return item


def delete_item(item_id: int):
    item = get_item(item_id)

    if item is None:
        return False

    items.remove(item)

    return True