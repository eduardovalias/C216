.PHONY: help install test lint format run clean up up-build down build logs ps shell

PYTEST := poetry -C backend run pytest
UVICORN := poetry -C backend run uvicorn
RUFF := poetry -C backend run ruff

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala dependências"
	@echo "  make test     - executa testes"
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia o servidor"
	@echo "  make up        - inicia os containers"
	@echo "  make up-build  - reconstrói e inicia os containers"
	@echo "  make down      - para os containers"
	@echo "  make build     - constrói as imagens Docker"
	@echo "  make logs      - acompanha os logs"
	@echo "  make ps        - mostra o estado dos containers"
	@echo "  make shell     - abre um terminal no container do backend"
	@echo "  make clean     - remove containers e volumes"

install:
	poetry -C backend install

test:
	$(PYTEST)

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