.PHONY: up up-build down ps logs db-current
DC = docker compose
up: up-build
up-build:
	$(DC) up -d --build --wait
ps:
	$(DC) ps
logs:
	$(DC) logs -f --tail=100
down:
	$(DC) down
db-current:
	$(DC) exec -T api alembic current
seed:
	$(DC) exec -T api python -m app.seed
test:
	$(DC) exec -T api python -m pytest -q