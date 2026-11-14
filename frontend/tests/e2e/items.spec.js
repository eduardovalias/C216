import { expect, test } from "@playwright/test";

function uniqueName(prefix) {
  return `${prefix} ${Date.now()} ${Math.round(Math.random() * 100000)}`;
}

async function createItem(page, name, description = "") {
  await page.getByLabel("Nome do item").fill(name);
  if (description) await page.getByLabel("Descrição (opcional)").fill(description);
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("article", { name: `Item: ${name}` })).toBeVisible();
}

test("cadastra, persiste após reload e recebe CORS da API", async ({ page }) => {
  const name = uniqueName("Caderno");
  await page.goto("/");
  const postResponse = page.waitForResponse(
    (response) => response.url().includes("/items/") && response.request().method() === "POST",
  );
  await createItem(page, name, "Capa azul");
  const response = await postResponse;
  expect(response.status()).toBe(201);
  expect(response.headers()["access-control-allow-origin"]).toBeTruthy();

  await page.reload();
  await expect(page.getByRole("article", { name: `Item: ${name}` })).toBeVisible();
  await expect(page.getByText("Capa azul")).toBeVisible();
  await page.getByRole("button", { name: `Excluir ${name}` }).click();
  await expect(page.getByRole("article", { name: `Item: ${name}` })).toHaveCount(0);
});

test("não permite cadastrar o mesmo nome duas vezes", async ({ page }) => {
  const name = uniqueName("Duplicado");
  await page.goto("/");
  await createItem(page, name);
  await page.getByLabel("Nome do item").fill(name);
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("alert")).toContainText("Já existe um item com esse nome.");
  await expect(page.getByRole("article", { name: `Item: ${name}` })).toHaveCount(1);
  await page.getByRole("button", { name: `Excluir ${name}` }).click();
});

test("edita, pesquisa e exclui usando a API", async ({ page }) => {
  const name = uniqueName("Agenda");
  const updated = `${name} atualizada`;
  await page.goto("/");
  await createItem(page, name);
  await page.getByRole("button", { name: `Editar ${name}` }).click();
  await page.getByLabel("Nome do item").fill(updated);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("article", { name: `Item: ${updated}` })).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar itens" }).fill(updated);
  await expect(page.getByRole("article", { name: `Item: ${updated}` })).toBeVisible();
  await page.getByRole("button", { name: `Excluir ${updated}` }).click();
  await expect(page.getByRole("article", { name: `Item: ${updated}` })).toHaveCount(0);
});

test("mostra erro de carregamento e permite tentar novamente", async ({ page }) => {
  await page.route("**/items/", (route) => {
    if (route.request().method() === "GET") return route.abort();
    return route.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Não foi possível conectar à API");
  await page.unroute("**/items/");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText("Não foi possível carregar a lista.")).toHaveCount(0);
});

test("é responsivo em tela de celular", async ({ page }) => {
  const name = uniqueName("Celular");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await createItem(page, name);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByRole("button", { name: `Excluir ${name}` }).click();
});
