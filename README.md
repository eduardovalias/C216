# CineMatch — seu cinema, do seu jeito

Aplicação web desenvolvida como projeto final da disciplina **C216 — Sistemas Distribuídos (2026.2)**. O CineMatch permite gerenciar um catálogo de filmes, registrar avaliações de 1 a 5 estrelas, organizar uma lista de títulos para assistir e receber recomendações baseadas nos gêneros mais bem avaliados.

O sistema utiliza **React** no frontend, **FastAPI** no backend e **PostgreSQL** para persistência dos dados. Os serviços são integrados pelo **Docker Compose** e podem ser executados localmente, sem autenticação ou dependência de APIs externas de filmes.

## Funcionalidades

- **Catálogo:** listar, pesquisar por título, filtrar por gênero e cadastrar, consultar, editar ou excluir filmes.
- **Avaliações:** atribuir, modificar e remover notas de 1 a 5 estrelas. Filmes avaliados são considerados assistidos.
- **Quero assistir:** adicionar ou remover filmes da lista de interesse. Ao avaliar um filme, ele é retirado automaticamente dessa lista.
- **Recomendações:** sugerir filmes ainda não avaliados a partir da média das notas atribuídas a outros filmes do mesmo gênero.
- **Dashboard:** visualizar total de filmes, filmes avaliados, títulos na lista de interesse e média das avaliações.
- **Dados persistentes:** manter filmes, avaliações e listas após atualizar o navegador ou reiniciar os contêineres.

A instalação inicial carrega um catálogo demonstrativo de **24 filmes**, que pode ser ampliado e modificado pela interface.

## Tecnologias

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Frontend | React 19, JavaScript, Vite | Interface e interação com o usuário |
| Servidor web | Nginx | Servir a aplicação compilada e encaminhar requisições `/api` |
| Backend | Python 3.12, FastAPI, Pydantic | API REST, validação e regras de negócio |
| Persistência | SQLAlchemy, PostgreSQL 17 | Modelagem, consultas e armazenamento |
| Migrações | Alembic | Versionamento do esquema do banco |
| Contêineres | Docker e Docker Compose | Execução e integração dos serviços |
| Testes e qualidade | Pytest, Ruff, Vitest, Testing Library, Playwright, Biome | Testes automatizados e análise estática |
| CI | GitHub Actions | Verificação automática do projeto |

## Arquitetura

```text
                         Navegador
                             │
                             │ HTTP (localhost:8080)
                             ▼
                    Nginx + React (SPA)
                             │
                             │ proxy reverso /api/*
                             ▼
                       FastAPI :8000
                             │
                   Rotas → Serviços
                             │
                       Repositórios
                             │
                         SQLAlchemy
                             │
                             ▼
                      PostgreSQL :5432
```

O frontend é compilado pelo Vite e distribuído pelo Nginx. O Nginx encaminha as chamadas com prefixo `/api` à aplicação FastAPI pela rede interna do Docker Compose. A API organiza suas responsabilidades em **rotas**, **serviços** (regras de negócio) e **repositórios** (acesso aos dados), utilizando o SQLAlchemy para comunicar-se com o PostgreSQL.

O Docker Compose define três serviços: `frontend`, `api` e `db`. A API aguarda o banco ficar saudável; o frontend depende da disponibilidade da API. Na inicialização da API, as migrações do Alembic são aplicadas e os filmes demonstrativos ausentes são inseridos.

A aplicação é uma **instância local única**, sem contas de usuário: avaliações e lista de interesse pertencem aos dados compartilhados dessa instância, e não a perfis individuais autenticados.

### Estrutura do repositório

```text
C216/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Integração contínua
├── backend/
│   ├── app/
│   │   ├── main.py               # Inicialização da API e healthcheck
│   │   ├── models.py             # Modelos SQLAlchemy
│   │   ├── schemas.py            # Modelos de entrada e saída (Pydantic)
│   │   ├── database.py           # Conexão e sessões do banco
│   │   ├── seed.py               # Catálogo demonstrativo
│   │   ├── routes/               # Endpoints REST
│   │   ├── services/             # Regras de negócio
│   │   └── repositories/         # Acesso aos filmes no banco
│   ├── alembic/versions/         # Migrações do banco
│   ├── tests/                   # Testes Pytest
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Navegação e composição da interface
│   │   ├── api.js                # Comunicação com a API
│   │   └── components/           # Componentes React
│   ├── tests/                   # Vitest e Testing Library
│   ├── e2e/                     # Testes integrados com Playwright
│   ├── nginx.conf               # Servidor web e proxy da API
│   ├── playwright.config.js
│   ├── vite.config.js
│   └── package.json
├── .env.example                 # Exemplo de configuração
├── compose.yaml                 # Orquestração dos três serviços
├── Makefile                     # Comandos de execução e validação
└── README.md
```

## Modelo de dados

O banco utiliza duas tabelas principais:

**`movies` — catálogo de filmes**

| Campo | Descrição |
| --- | --- |
| `id` | Identificador único do filme |
| `title` | Título (máximo de 120 caracteres; único sem diferenciar maiúsculas e minúsculas) |
| `genre` | Gênero cinematográfico |
| `year` | Ano de lançamento |
| `duration_min` | Duração em minutos |
| `synopsis` | Sinopse (até 600 caracteres) |
| `watchlisted` | Indica se o filme está na lista Quero assistir |

**`ratings` — avaliações**

| Campo | Descrição |
| --- | --- |
| `id` | Identificador da avaliação |
| `movie_id` | Chave estrangeira para `movies.id`, com restrição de unicidade |
| `score` | Nota de 1 a 5 estrelas |
| `comment` | Comentário opcional (até 300 caracteres) |

A relação é de **um filme para zero ou uma avaliação**. O banco impede mais de uma avaliação por filme, e a exclusão do filme também exclui sua avaliação. O campo `watchlisted` é armazenado diretamente na tabela `movies`, não em uma terceira tabela.

As migrações são versionadas pelo Alembic: `0001` cria a estrutura inicial do catálogo e `0002` adiciona as avaliações.

## API REST

A API é acessível diretamente em `http://localhost:8000`, e sua documentação interativa fica disponível em **[http://localhost:8000/docs](http://localhost:8000/docs)**.

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica a disponibilidade da API e do banco |
| `GET` | `/api/movies` | Lista filmes; aceita filtros `search`, `genre` e `watchlist` |
| `GET` | `/api/movies/{movie_id}` | Consulta um filme por identificador |
| `POST` | `/api/movies` | Cadastra um filme |
| `PUT` | `/api/movies/{movie_id}` | Atualiza os dados de um filme |
| `DELETE` | `/api/movies/{movie_id}` | Exclui um filme |
| `PATCH` | `/api/movies/{movie_id}/watchlist` | Adiciona ou remove um filme da lista Quero assistir |
| `PUT` | `/api/movies/{movie_id}/rating` | Cria ou atualiza uma avaliação |
| `DELETE` | `/api/movies/{movie_id}/rating` | Remove uma avaliação |
| `GET` | `/api/recommendations` | Retorna recomendações; aceita `limit` (1 a 30, padrão 8) |
| `GET` | `/api/stats` | Retorna os indicadores do dashboard |

Exemplo de corpo JSON para `POST /api/movies`:

```json
{
  "title": "Meu Filme",
  "genre": "Suspense",
  "year": 2024,
  "duration_min": 110,
  "synopsis": "Sinopse do filme."
}
```

Exemplo de avaliação com `PUT /api/movies/1/rating`:

```json
{
  "score": 5,
  "comment": "Excelente filme."
}
```

Exemplo para adicionar um filme à lista com `PATCH /api/movies/1/watchlist`:

```json
{
  "watchlisted": true
}
```

### Validações e regras de negócio

- **Título duplicado:** não é permitido cadastrar ou renomear um filme com um título já existente, desconsiderando diferenças entre maiúsculas e minúsculas (`409 Conflict`).
- **Avaliação:** a nota precisa ser um número inteiro entre 1 e 5; valores fora desse intervalo são rejeitados (`422 Unprocessable Entity`).
- **Filme inexistente:** consultas e operações sobre identificadores não encontrados retornam `404 Not Found`.
- **Quero assistir:** um filme já avaliado não pode ser adicionado à lista (`409 Conflict`). Atribuir uma avaliação remove automaticamente o filme dessa lista.
- **Gêneros aceitos:** Terror, Ficção científica, Suspense, Drama, Ação, Animação e Comédia.

## Recomendações por gênero

O CineMatch utiliza um **algoritmo determinístico baseado em avaliações armazenadas**, sem modelos de inteligência artificial ou serviços externos.

1. Agrupa as notas dos filmes avaliados por gênero.
2. Calcula a média das notas de cada gênero.
3. Seleciona filmes **ainda não avaliados** pertencentes a gêneros que já receberam avaliações.
4. Ordena os candidatos pela maior média do gênero, depois pela quantidade de avaliações desse gênero, pelo ano de lançamento mais recente e, por fim, pelo título.
5. Retorna até 8 recomendações por padrão; a API permite configurar o limite até 30.

Cada recomendação apresenta o filme, a nota média do gênero (`score`), a quantidade de avaliações utilizadas (`sample_size`) e uma justificativa (`reason`). Na ausência de avaliações, o resultado é uma lista vazia.

**Exemplo:** se os filmes de Terror foram avaliados com notas 4 e 5, o gênero terá afinidade média 4,5. Filmes de Terror ainda não avaliados podem aparecer entre as recomendações, respeitando a ordenação descrita.

## Pré-requisitos

- **Docker Desktop**, em execução, com suporte ao Docker Compose v2.
- **GNU Make** para executar os atalhos do `Makefile`.
- **Node.js 22** e npm para executar os testes e ferramentas do frontend localmente.
- Acesso à internet na primeira execução para obter as imagens, dependências e o navegador do Playwright.

Python e PostgreSQL não precisam ser instalados diretamente no computador para a execução pelo Docker.

## Instalação e execução

Clone a branch que contém o projeto e entre na pasta do repositório:

```bash
git clone --branch projeto-final https://github.com/eduardovalias/C216.git
cd C216
```

Opcionalmente, crie um arquivo `.env` baseado no exemplo. No **PowerShell**:

```powershell
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

As configurações padrão também permitem executar o projeto sem criar esse arquivo. Para instalar as dependências de teste do frontend e iniciar os serviços:

```bash
make frontend-install
make up-build
make ps
make db-current
```

O comando `make up-build` constrói as imagens, inicia os contêineres e aguarda os healthchecks. A inicialização da API executa `alembic upgrade head` e `python -m app.seed`, aplicando o esquema e carregando os filmes demonstrativos ausentes. A operação de seed é **idempotente**: reiniciar os serviços não duplica filmes já existentes.

### Endereços locais

| Serviço | Endereço |
| --- | --- |
| Interface web | [http://localhost:8080](http://localhost:8080) |
| Documentação interativa da API | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Healthcheck | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

As portas podem ser modificadas em `.env`.

## Configuração

O arquivo `.env.example` contém os parâmetros utilizados pelo Docker Compose:

| Variável | Valor padrão | Finalidade |
| --- | --- | --- |
| `WEB_PORT` | `8080` | Porta da interface web no computador |
| `API_PORT` | `8000` | Porta de acesso direto à API no computador |
| `POSTGRES_DB` | `cinematch` | Nome do banco de dados |
| `POSTGRES_USER` | `cinematch` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `cinematch_local` | Senha local do PostgreSQL |
| `CORS_ORIGINS` | Origens locais nas portas 8080 e 5173 | Origens HTTP permitidas pelo backend |

O frontend utiliza caminhos relativos com prefixo `/api`, encaminhados pelo Nginx ao backend, evitando configurar uma URL de API fixa no navegador. O servidor de desenvolvimento Vite também possui um proxy local para a API.

Os valores padrão são destinados **exclusivamente ao desenvolvimento local**. Não versione o arquivo `.env` nem utilize as credenciais de exemplo em ambientes públicos. A aplicação não implementa autenticação.

## Testes e qualidade

O projeto possui testes automatizados em três níveis:

| Ferramenta | Escopo |
| --- | --- |
| **Pytest** | CRUD da API, validações, avaliações, lista de interesse, recomendações e estatísticas |
| **Vitest + Testing Library** | Carregamento, mensagens de erro e interações dos componentes React |
| **Playwright** | Fluxos integrados no navegador, incluindo persistência, títulos duplicados, lista de interesse, recomendações e visualização em tela de celular |

Execute os comandos a partir da **raiz do repositório**:

```bash
make test             # Testes Pytest do backend, dentro do contêiner
make lint             # Ruff no backend e Biome no frontend
make frontend-test    # Testes React com Vitest e Testing Library
make frontend-build   # Build de produção com Vite
make e2e              # Testes Playwright contra a aplicação em execução
make check-all        # Inicialização, migrações e todas as verificações acima
```

Na primeira execução do Playwright, instale o Chromium:

```bash
cd frontend
npx playwright install chromium
cd ..
```

`make e2e` exige que a aplicação já esteja em funcionamento (`make up-build`). `make check-all` realiza a inicialização antes dos testes. Como os testes integrados exercitam operações reais sobre a aplicação, recomenda-se executá-los com **dados locais de desenvolvimento**, e não sobre uma base importante.

## Integração contínua

O workflow **`.github/workflows/ci.yml`** executa as validações automaticamente no GitHub Actions em pushes para `projeto-final` e em pull requests direcionados a `main`.

São dois jobs principais:

- **API — Pytest e Ruff:** prepara o Python 3.12, instala dependências com Poetry e executa testes e análise estática do backend.
- **React — Vitest, Biome, Build e E2E:** prepara o Node.js 22, instala dependências, executa as verificações do frontend, constrói a aplicação e inicia os três serviços via Docker Compose para os testes Playwright. Em caso de falha, coleta logs e, quando disponível, o relatório do Playwright.

## Persistência e manutenção

O PostgreSQL utiliza o volume nomeado `cinematch-db`. Por isso, executar `make down` **não remove** os dados armazenados.

```bash
make ps             # Estado dos contêineres
make logs           # Logs dos serviços
make db-current     # Revisão atual do Alembic
make db-upgrade     # Aplicar migrações pendentes
make seed           # Inserir filmes demonstrativos ausentes
make down           # Parar e remover contêineres, preservando o volume
make reset-demo     # Apagar o volume local e recriar o catálogo demonstrativo
```

**Atenção:** `make reset-demo` executa `docker compose down -v`, excluindo o volume do banco de dados desta instalação. Filmes cadastrados, avaliações e lista de interesse existentes nesse banco são perdidos. Use esse comando apenas quando desejar reiniciar os dados demonstrativos.

## Vídeo demonstrativo

[Assista à demonstração do CineMatch](https://posinatel-my.sharepoint.com/:v:/r/personal/eduardo_valias_gec_inatel_br/_layouts/15/stream.aspx?id=%2Fpersonal%2Feduardo_valias_gec_inatel_br%2FDocuments%2FProjetoFinalC216.mp4&share=cQqzVxpvzJubSZt6RhOMPO0HEgUDZQWEr0z1DcurNqknvmWiHw&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0)