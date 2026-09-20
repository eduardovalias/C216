# C216

Repositório das práticas da disciplina C216 - Sistemas Distribuídos.

## Testes

Os testes do backend utilizam Pytest e estão em `backend/tests`.

Para instalar as dependências:

```bash
poetry -C backend install --no-root
```

Para executar os testes:

```bash
make test
```

Também é possível executar diretamente:

```bash
poetry -C backend run pytest -v
```

## CI

O workflow está em `.github/workflows/ci-backend.yml`.

O GitHub Actions executa os testes automaticamente em eventos de `push` e `pull_request`.
