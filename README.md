# C216 — Sistemas Distribuídos

## Prática 7 — Integração completa

O repositório contém frontend React/Vite + Tailwind CSS, API REST FastAPI e PostgreSQL.
A interface cadastra, consulta, edita e exclui itens via HTTP. O banco preserva os itens
após atualizar a página. Nomes duplicados (ignorando maiúsculas/minúsculas e espaços
nas pontas) retornam HTTP 409 e a mensagem **Já existe um item com esse nome.**

### Pré-requisitos

Docker Desktop com Docker Compose, Node.js 22, npm, Python 3.13, Poetry e `make`.

### Executar

```bash
make up-build
make ps
make db-upgrade
make db-current
```

- Interface: http://localhost:5173
- Documentação da API: http://localhost:8000/docs
- Health da API: http://localhost:8000/health
- PostgreSQL: porta local 5433 (preservado em `postgres_data`)

Para interromper: `make down` (preserva o volume). **Não execute `make clean` se
quiser manter os dados**, pois ele apaga o volume do PostgreSQL.

### Validar

```bash
make test
make frontend-test
make frontend-check
make frontend-build
make e2e
make check-all
```

`make e2e` sobe os containers necessários, usa o Chromium em um container temporário
`lab-e2e` e o remove após o teste. `make check-all` executa os testes e verificações
do backend e frontend e os E2E integrados.

No navegador, cadastre um item e pressione F5: ele continua disponível. Repita o nome
(com letras maiúsculas/minúsculas diferentes): o frontend apresenta o erro 409.
Nas ferramentas de desenvolvedor > Network, confira o `OPTIONS` (preflight),
`POST /items/` e o cabeçalho `access-control-allow-origin`.

### Organização

- `backend/app/api/`: rotas, CORS e health check.
- `backend/app/repositories/`: acesso SQLAlchemy ao PostgreSQL.
- `backend/alembic/`: migrations; a nova adiciona unicidade normalizada de nome.
- `frontend/src/services/items.js`: chamadas `fetch` aos endpoints REST.
- `frontend/src/components/`: formulário, listagem e cartões.
- `frontend/tests/unit/`: validações e serviço HTTP.
- `frontend/tests/integration/`: cenários React com `fetch` mockado.
- `frontend/tests/e2e/`: testes no Chromium com serviços reais.
- `.github/workflows/`: CI para backend e frontend/E2E.

### Configurações

`CORS_ORIGINS` é uma lista separada por vírgulas de origens permitidas. O Compose
configura explicitamente `http://localhost:5173`, `http://127.0.0.1:5173` e
`http://frontend:5173` para o navegador dentro do Docker. **Não há `*`.**

Por padrão, a interface usa a API no mesmo hostname, porta 8000; dentro do Compose,
o hostname `frontend` corresponde à API `api`. Para outro ambiente, configure
`VITE_API_URL` com a URL pública da API (essa variável é aplicada durante o build Vite).

**Atenção à migração de unicidade:** se o PostgreSQL já contiver dois itens com o
mesmo nome (desconsiderando caixa e espaços nas pontas), o índice único não será
criado. Corrija os registros duplicados antes de tentar novamente `make up-build`;
não apague o volume como solução automática.

### PR

A Prática 7 deve sair da branch `pratica-6` e gerar um PR com base `pratica-6`.
Não faça merge por conta própria: aguarde o monitor revisar as práticas anteriores.
