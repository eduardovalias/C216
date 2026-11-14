.PHONY: help install test lint format run up up-build down build logs ps shell clean \
        db-upgrade db-current frontend-install frontend-dev frontend-lint \
        frontend-format frontend-test frontend-check frontend-build frontend-e2e e2e check-all

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff

help:
	@echo "Backend: make install test lint format run"
	@echo "Docker: make up-build ps logs down db-upgrade db-current"
	@echo "Frontend: make frontend-install frontend-dev frontend-test frontend-check frontend-build"
	@echo "Integrado: make e2e check-all"

install:
	poetry -C backend install --no-root

test:
	$(PYTEST) -v --tb=short --basetemp=.pytest-temp

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

run:
	$(UVICORN) app.main:app --reload

up:
	docker compose up -d --remove-orphans

up-build:
	docker compose up -d --build --remove-orphans

down:
	docker compose --profile e2e down --remove-orphans

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

shell:
	docker compose exec api sh

clean:
	docker compose --profile e2e down -v --remove-orphans

db-upgrade:
	docker compose exec api alembic upgrade head

db-current:
	docker compose exec api alembic current

frontend-install:
	cd frontend && npm ci

frontend-dev:
	cd frontend && npm run dev

frontend-lint:
	cd frontend && npm run lint

frontend-format:
	cd frontend && npm run format

frontend-test:
	cd frontend && npm run test

frontend-check:
	cd frontend && npm run lint
	cd frontend && npm run format:check

frontend-build:
	cd frontend && npm run build

# O container de teste E2E é efêmero (--rm); Compose sobe as dependências saudáveis.
e2e:
	docker compose up -d --build --remove-orphans
	docker compose --profile e2e run --rm --build lab-e2e

# Um comando para todos os testes, formatação, build e E2E real com PostgreSQL.
check-all:
	$(MAKE) test
	$(MAKE) lint
	$(MAKE) frontend-test
	$(MAKE) frontend-check
	$(MAKE) frontend-build
	$(MAKE) e2e
