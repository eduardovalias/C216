.PHONY: help install test lint format run clean up up-build down build logs ps shell frontend-install frontend-dev frontend-lint frontend-format frontend-test frontend-build frontend-e2e check-all

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala dependências do backend"
	@echo "  make test     - executa testes do backend"
	@echo "  make lint     - verifica código do backend"
	@echo "  make format   - formata o backend"
	@echo "  make run      - inicia o servidor"
	@echo "  make up        - inicia os containers"
	@echo "  make up-build  - reconstrói e inicia os containers"
	@echo "  make down      - encerra os containers"
	@echo "  make build     - constrói as imagens Docker"
	@echo "  make logs      - acompanha os logs dos containers"
	@echo "  make ps        - exibe o estado dos containers"
	@echo "  make shell     - abre um terminal no container"
	@echo "  make clean     - remove os containers e volumes"
	@echo "  make frontend-install - npm ci no frontend"
	@echo "  make frontend-dev     - inicia o frontend"
	@echo "  make check-all        - valida todos os requisitos do frontend"

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
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

shell:
	docker compose exec backend sh

clean:
	docker compose down -v

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

frontend-build:
	cd frontend && npm run build

frontend-e2e:
	cd frontend && npm run test:e2e

check-all:
	cd frontend && npm ci
	cd frontend && npm run lint
	cd frontend && npm run format:check
	cd frontend && npm run test
	cd frontend && npm run build
	cd frontend && npx playwright install chromium
	cd frontend && npm run test:e2e