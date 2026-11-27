import { expect, test } from "@playwright/test";

const unique = () => `E2E Filme ${Date.now()} ${Math.round(Math.random() * 10000)}`;

async function addMovie(page, title, genre = "Terror") {
  await page.getByRole("button", { name: "Catálogo", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar filme" }).click();
  await page.getByLabel("Título do filme").fill(title);
  await page.locator('select[name="genre"]').selectOption(genre);
  await page.getByLabel("Ano").fill("2024");
  await page.getByLabel("Duração em minutos").fill("110");
  await page.getByLabel("Sinopse").fill("Criado automaticamente pelo teste integrado.");
  await page.getByRole("button", { name: "Cadastrar filme" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Filme adicionado" })).toBeVisible();
}

test("cadastro e avaliação persistem após atualizar a página", async ({ page }) => {
  const title = unique();
  await page.goto("/");
  await addMovie(page, title);
  const card = page.getByTestId("movie-card").filter({ hasText: title });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: `Avaliar ${title} com 5 estrelas` }).click();
  await page.reload();
  await page.getByRole("button", { name: "Catálogo", exact: true }).click();
  const persisted = page.getByTestId("movie-card").filter({ hasText: title });
  await expect(persisted.getByRole("button", { name: "Limpar" })).toBeVisible();
  await persisted.getByRole("button", { name: `Excluir ${title}` }).click();
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
  await expect(page.getByTestId("movie-card").filter({ hasText: title })).toHaveCount(0);
});

test("impede títulos duplicados e mostra mensagem", async ({ page }) => {
  const title = unique();
  await page.goto("/");
  await addMovie(page, title);
  await page.getByRole("button", { name: "Adicionar filme" }).click();
  await page.getByLabel("Título do filme").fill(title.toUpperCase());
  await page.getByRole("button", { name: "Cadastrar filme" }).click();
  await expect(page.getByRole("alert")).toContainText("Já existe um filme");
  await page.getByRole("button", { name: "Fechar formulário" }).click();
  const card = page.getByTestId("movie-card").filter({ hasText: title });
  await card.getByRole("button", { name: `Excluir ${title}` }).click();
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
});

test("lista Quero assistir e edição funcionam", async ({ page }) => {
  const title = unique();
  await page.goto("/");
  await addMovie(page, title, "Drama");
  const card = page.getByTestId("movie-card").filter({ hasText: title });
  await card.getByRole("button", { name: `Adicionar ${title} à lista Quero assistir` }).click();
  await page.getByRole("button", { name: "Quero assistir", exact: true }).click();
  await expect(page.getByTestId("movie-card").filter({ hasText: title })).toBeVisible();
  await page.getByRole("button", { name: "Catálogo", exact: true }).click();
  await page.getByTestId("movie-card").filter({ hasText: title }).getByRole("button", { name: `Editar ${title}` }).click();
  await page.getByLabel("Título do filme").fill(`${title} editado`);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  const renamed = page.getByTestId("movie-card").filter({ hasText: `${title} editado` });
  await expect(renamed).toBeVisible();
  await renamed.getByRole("button", { name: `Excluir ${title} editado` }).click();
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
});

test("avaliações geram recomendações por gênero", async ({ page }) => {
  const ratedTitle = unique();
  const suggestedTitle = unique();

  await page.goto("/");
  await addMovie(page, ratedTitle, "Terror");
  await addMovie(page, suggestedTitle, "Terror");

  try {
    const ratedCard = page
      .getByTestId("movie-card")
      .filter({ hasText: ratedTitle });

    await ratedCard
      .getByRole("button", {
        name: `Avaliar ${ratedTitle} com 5 estrelas`,
      })
      .click();

    await expect(
      page.getByRole("status").filter({
        hasText: `Você avaliou ${ratedTitle}`,
      })
    ).toBeVisible();

    const response = await page.request.get(
      "/api/recommendations?limit=30"
    );
    expect(response.ok()).toBe(true);

    const recommendations = await response.json();

    expect(
      recommendations.some(
        ({ movie }) =>
          movie.title === suggestedTitle &&
          movie.genre === "Terror"
      )
    ).toBe(true);

    await page.getByRole("button", {
      name: "Para você",
      exact: true,
    }).click();

    await expect(
      page.getByTestId("movie-card").first()
    ).toBeVisible();

    await expect(
      page.getByTestId("movie-card").filter({
        hasText: ratedTitle,
      })
    ).toHaveCount(0);
  } finally {
    const response = await page.request.get("/api/movies");
    const movies = await response.json();

    for (const title of [ratedTitle, suggestedTitle]) {
      const movie = movies.find((item) => item.title === title);
      if (movie) {
        await page.request.delete(`/api/movies/${movie.id}`);
      }
    }
  }
});

test("interface acessível no tamanho de celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "CineMatch início" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
