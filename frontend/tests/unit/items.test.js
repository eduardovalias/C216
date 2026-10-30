import { describe, expect, it } from "vitest";
import {
  filterItems,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  normalizeItem,
  validateItem,
} from "../../src/utils/items.js";

describe("Validação dos itens", () => {
  it("rejeita nome vazio ou com apenas um caractere", () => {
    expect(validateItem({ name: "  ", description: "" }).name).toBeDefined();
    expect(validateItem({ name: "A", description: "" }).name).toBeDefined();
  });

  it("aceita nome válido com descrição opcional", () => {
    expect(validateItem({ name: "Meu item", description: "" })).toEqual({});
  });

  it("rejeita nome e descrição maiores que os limites", () => {
    const errors = validateItem({
      name: "x".repeat(MAX_NAME_LENGTH + 1),
      description: "y".repeat(MAX_DESCRIPTION_LENGTH + 1),
    });
    expect(errors.name).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it("remove espaços desnecessários dos campos", () => {
    expect(normalizeItem({ name: "  Caderno  ", description: "  Azul  " })).toEqual({
      name: "Caderno",
      description: "Azul",
    });
  });
});

describe("Busca dos itens", () => {
  const items = [
    { id: 1, name: "Caderno", description: "Capa azul" },
    { id: 2, name: "Mouse", description: "Sem fio" },
  ];

  it("retorna todos os itens quando a busca está vazia", () => {
    expect(filterItems(items, "  ")).toEqual(items);
  });

  it("filtra sem diferenciar maiúsculas e minúsculas", () => {
    expect(filterItems(items, "MOUSE")).toEqual([items[1]]);
  });

  it("permite buscar também pela descrição", () => {
    expect(filterItems(items, "azul")).toEqual([items[0]]);
  });
});
