# C216

Repositório das práticas da disciplina C216 - Sistemas Distribuídos.

## Backend

O backend utiliza FastAPI, SQLAlchemy e PostgreSQL. O ambiente é iniciado com Docker Compose e a migration inicial é aplicada automaticamente antes de iniciar a API.

```bash
poetry -C backend install --no-root
make test
make lint
```

O workflow do backend está em `.github/workflows/ci-backend.yml`.

## Frontend — Prática 6

Gerenciador de itens implementado com React, Vite, Tailwind CSS e JavaScript, com operações de cadastro, listagem, edição, exclusão e busca.

Os dados existem somente no estado local do React: nesta prática, **não há chamadas ao backend nem persistência**.

Na primeira instalação:

```bash
cd frontend
npm install
npx playwright install chromium
npm run dev
```

Após gerar e versionar `frontend/package-lock.json`, valide da raiz do repositório:

```bash
make check-all
```

Esse comando executa `npm ci`, Biome (lint e formatação), testes unitários e de integração (Vitest), build e testes E2E (Playwright). O workflow `.github/workflows/ci-frontend.yml` executa a mesma validação no GitHub Actions.

Consulte [frontend/README.md](frontend/README.md) para a estrutura e demais comandos.