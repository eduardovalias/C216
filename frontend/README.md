# C216 — Prática 7: Frontend integrado

React, Tailwind CSS, Vite, Biome, Vitest e Playwright.

O gerenciador de itens chama o FastAPI por meio de `src/services/items.js` e
armazena dados no PostgreSQL. Nomes repetidos retornam HTTP 409; a aplicação
mostra erros de rede, carregamento e erro da API.

## Aplicação completa

Na raiz do repositório:

```bash
make up-build
make ps
make db-upgrade
make db-current
```

Abra `http://localhost:5173`; a API fica em `http://localhost:8000/docs`.

## Verificação

Na raiz do projeto:

```bash
make test
make frontend-test
make frontend-check
make frontend-build
make e2e
make check-all
```

Ou, dentro de `frontend`, com o Compose rodando:

```bash
npm ci
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

`npm run test` usa `fetch` mockado (testes de unidade e integração).
`npm run test:e2e` usa a API e PostgreSQL reais e exige que os containers estejam ativos.
`make e2e` prepara os serviços automaticamente e remove o container de teste.

## API

`src/services/items.js` implementa GET, POST, PUT, PATCH e DELETE com `fetch`.
O endereço padrão é `http://localhost:8000` no navegador local e
`http://api:8000` no navegador do Compose. É possível sobrescrever com `VITE_API_URL`.
