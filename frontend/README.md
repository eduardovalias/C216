# C216 — Prática 6: Gerenciador de Itens

Frontend desenvolvido com React, Vite, Tailwind CSS e JavaScript.

## Requisitos

Node.js 22 (ou >= 20.19) e npm. O backend **não é necessário** para esta prática.

## Instalação inicial

```bash
cd frontend
npm install
npx playwright install chromium
```

O primeiro `npm install` gera o `package-lock.json`. **Inclua esse arquivo no Git** antes de abrir o PR, pois a entrega e o CI devem usar `npm ci`.

## Executar

```bash
npm run dev
```

Acesse a URL informada no terminal (normalmente `http://localhost:5173`).

## Validar

```bash
npm ci
npm run format
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

Depois da primeira formatação, verifique as alterações e inclua-as no commit. Nos testes de aceitação subsequentes, `npm run format` não precisa ser repetido; use apenas `format:check`.

Também é possível executar todos os checks da raiz do repositório:

```bash
make check-all
```

## Responsabilidades

- `src/App.jsx`: estado local, CRUD, busca e composição da interface.
- `src/components/`: formulário e componentes de listagem.
- `src/utils/items.js`: validação, normalização e filtro (funções puras).
- `tests/unit/`: regras de validação e busca (Vitest).
- `tests/integration/`: interação de componentes no navegador simulado (React Testing Library).
- `tests/e2e/`: fluxo real no Chromium (Playwright).
- `.github/workflows/ci-frontend.yml`: pipeline completo para push e PR.

Os itens não são enviados à API, ao PostgreSQL ou a qualquer serviço externo. Não utilizamos `fetch`, `localStorage` nem outros mecanismos de persistência. Recarregar a página reinicia os itens.
