import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.jsx";

const response = (status, data) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

let records;
let nextId;
let fetchMock;

beforeEach(() => {
  records = [];
  nextId = 1;
  fetchMock = vi.fn(async (url, options = {}) => {
    const path = new URL(url).pathname;
    const method = options.method || "GET";
    if (path === "/items/" && method === "GET") return response(200, [...records]);
    if (path === "/items/" && method === "POST") {
      const values = JSON.parse(options.body);
      if (records.some((item) => item.name.toLowerCase() === values.name.toLowerCase())) {
        return response(409, { detail: "Já existe um item com esse nome." });
      }
      const created = { id: nextId++, ...values };
      records.push(created);
      return response(201, created);
    }
    const id = Number(path.split("/").at(-1));
    if (method === "PATCH") {
      const original = records.find((item) => item.id === id);
      Object.assign(original, JSON.parse(options.body));
      return response(200, { ...original });
    }
    if (method === "DELETE") {
      records = records.filter((item) => item.id !== id);
      return response(200, { message: "Item deleted" });
    }
    return response(404, { detail: "Item not found" });
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function ready() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Adicionar item" })).toBeEnabled());
}

async function submitItem(user, name, description = "") {
  await user.type(screen.getByLabelText(/nome do item/i), name);
  if (description) await user.type(screen.getByLabelText(/descrição/i), description);
  await user.click(screen.getByRole("button", { name: "Adicionar item" }));
  await screen.findByRole("article", { name: `Item: ${name}` });
}

describe("Gerenciador integrado com fetch mockado", () => {
  it("mostra carregamento até a API responder", async () => {
    let resolveRequest;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    render(<App />);
    expect(screen.getByText("Carregando itens...")).toBeInTheDocument();
    resolveRequest(response(200, []));
    await screen.findByText("Nenhum item cadastrado");
  });

  it("lista os itens recebidos da API", async () => {
    records.push({ id: 10, name: "Agenda", description: null });
    render(<App />);
    expect(await screen.findByRole("article", { name: "Item: Agenda" })).toBeInTheDocument();
  });

  it("cadastra, edita e exclui via requisições HTTP", async () => {
    const user = userEvent.setup();
    render(<App />);
    await ready();
    await submitItem(user, "Caderno", "Capa azul");
    expect(screen.getByText("Capa azul")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar Caderno" }));
    await user.clear(screen.getByLabelText(/nome do item/i));
    await user.type(screen.getByLabelText(/nome do item/i), "Caderno novo");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    const card = await screen.findByRole("article", { name: "Item: Caderno novo" });
    await user.click(within(card).getByRole("button", { name: "Excluir Caderno novo" }));
    await screen.findByText("Nenhum item cadastrado");
    expect(fetchMock.mock.calls.map(([, opts]) => opts?.method || "GET")).toEqual([
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ]);
  });

  it("filtra registros retornados pelo backend", async () => {
    const user = userEvent.setup();
    records.push({ id: 1, name: "Mouse", description: "Sem fio" });
    records.push({ id: 2, name: "Teclado", description: null });
    render(<App />);
    await screen.findByRole("article", { name: "Item: Mouse" });
    await user.type(screen.getByRole("searchbox", { name: "Buscar itens" }), "mouse");
    expect(screen.queryByRole("article", { name: "Item: Teclado" })).not.toBeInTheDocument();
  });

  it("mostra nome duplicado sem limpar o formulário", async () => {
    const user = userEvent.setup();
    records.push({ id: 1, name: "Mouse", description: "" });
    render(<App />);
    await ready();
    await user.type(screen.getByLabelText(/nome do item/i), "Mouse");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Já existe um item com esse nome.");
    expect(screen.getByLabelText(/nome do item/i)).toHaveValue("Mouse");
  });

  it("exibe erro de rede e permite tentar carregar novamente", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network error"));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível conectar à API");
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await screen.findByText("Nenhum item cadastrado");
  });

  it("rejeita formulário inválido sem chamar POST", async () => {
    const user = userEvent.setup();
    render(<App />);
    await ready();
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 2 caracteres");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
