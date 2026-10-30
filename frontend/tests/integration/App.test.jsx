import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App.jsx";

async function createItem(user, name, description = "") {
  await user.type(screen.getByLabelText(/nome do item/i), name);
  if (description) {
    await user.type(screen.getByLabelText(/descrição/i), description);
  }
  await user.click(screen.getByRole("button", { name: "Adicionar item" }));
}

describe("Gerenciador de itens (integração)", () => {
  it("exibe uma lista vazia antes do primeiro cadastro", () => {
    render(<App />);
    expect(screen.getByText("Nenhum item cadastrado")).toBeInTheDocument();
  });

  it("adiciona um item válido e mostra a descrição", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createItem(user, "Caderno", "Capa azul");

    expect(screen.getByRole("article", { name: "Item: Caderno" })).toBeInTheDocument();
    expect(screen.getByText("Capa azul")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Item criado com sucesso.");
  });

  it("não cadastra um nome inválido", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 2 caracteres");
    expect(screen.getByText("Nenhum item cadastrado")).toBeInTheDocument();
  });

  it("edita um item sem criar outro registro", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createItem(user, "Caderno", "Azul");

    await user.click(screen.getByRole("button", { name: "Editar Caderno" }));
    const nameInput = screen.getByLabelText(/nome do item/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Caderno atualizado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(screen.getByRole("article", { name: "Item: Caderno atualizado" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Azul")).toBeInTheDocument();
  });

  it("cancela a edição sem modificar os dados", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createItem(user, "Mouse");
    await user.click(screen.getByRole("button", { name: "Editar Mouse" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("article", { name: "Item: Mouse" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Adicionar item" })).toBeInTheDocument();
  });

  it("exclui um item da lista", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createItem(user, "Teclado");

    const card = screen.getByRole("article", { name: "Item: Teclado" });
    await user.click(within(card).getByRole("button", { name: "Excluir Teclado" }));

    expect(screen.queryByRole("article", { name: "Item: Teclado" })).not.toBeInTheDocument();
    expect(screen.getByText("Nenhum item cadastrado")).toBeInTheDocument();
  });

  it("filtra itens cadastrados pelo texto da busca", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createItem(user, "Caderno");
    await createItem(user, "Mouse");
    await user.type(screen.getByRole("searchbox", { name: "Buscar itens" }), "mouse");

    expect(screen.getByRole("article", { name: "Item: Mouse" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Item: Caderno" })).not.toBeInTheDocument();
  });
});
