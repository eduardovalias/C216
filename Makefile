.PHONY: up up-build down ps logs db-upgrade db-current seed test lint frontend-install frontend-test frontend-check frontend-build e2e check-all reset-demo
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
db-upgrade:
	$(DC) exec -T api alembic upgrade head
db-current:
	$(DC) exec -T api alembic current
seed:
	$(DC) exec -T api python -m app.seed
test:
	$(DC) exec -T api python -m pytest -q
lint:
	$(DC) exec -T api ruff check .
	cd frontend && npx biome check .
frontend-install:
	cd frontend && npm install
frontend-test:
	cd frontend && npm run test -- --run
frontend-check:
	cd frontend && npx biome check .
frontend-build:
	cd frontend && npm run build
e2e:
	cd frontend && npm run test:e2e
check-all: up-build db-current test lint frontend-test frontend-build e2e
reset-demo:
	$(DC) down -v
	$(DC) up -d --build --wait
