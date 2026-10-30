import { expect, test } from "@playwright/test";

test("cria, edita e exclui um item", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Nome do item").fill("Notebook");
  await page.getByLabel("Descrição (opcional)").fill("Para estudar");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByRole("article", { name: "Item: Notebook" })).toBeVisible();
  await expect(page.getByText("Para estudar")).toBeVisible();

  await page.getByRole("button", { name: "Editar Notebook" }).click();
  await page.getByLabel("Nome do item").fill("Notebook novo");
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByRole("article", { name: "Item: Notebook novo" })).toBeVisible();

  await page.getByRole("button", { name: "Excluir Notebook novo" }).click();
  await expect(page.getByText("Nenhum item cadastrado")).toBeVisible();
});

test("bloqueia um cadastro inválido", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("alert")).toContainText("pelo menos 2 caracteres");
  await expect(page.getByText("Nenhum item cadastrado")).toBeVisible();
});

test("busca itens localmente sem chamar o backend", async ({ page }) => {
  const backendRequests = [];
  page.on("request", (request) => {
    if (request.url().startsWith("http://127.0.0.1:8000/")) {
      backendRequests.push(request.url());
    }
  });

  await page.goto("/");
  await page.getByLabel("Nome do item").fill("Caderno");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await page.getByLabel("Nome do item").fill("Mouse");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByRole("searchbox", { name: "Buscar itens" }).fill("mouse");
  await expect(page.getByRole("article", { name: "Item: Mouse" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Item: Caderno" })).toHaveCount(0);
  expect(backendRequests).toEqual([]);
});

test("funciona em tela de celular", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /organize suas ideias/i })).toBeVisible();
  await page.getByLabel("Nome do item").fill("Agenda");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("article", { name: "Item: Agenda" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
