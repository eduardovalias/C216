import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createItem,
  deleteItem,
  getItem,
  listItems,
  replaceItem,
  updateItem,
} from "../../src/services/items.js";

const response = (status, data) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Camada de serviços HTTP", () => {
  it("faz GET /items/ e devolve a lista", async () => {
    fetchMock.mockResolvedValue(response(200, [{ id: 1, name: "Mouse", description: null }]));
    expect(await listItems()).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/:8000\/items\/$/);
  });

  it("espelha todos os métodos do backend", async () => {
    fetchMock.mockResolvedValue(response(200, { id: 2, name: "Mouse" }));
    await getItem(2);
    await createItem({ name: "Mouse", description: "Teste" });
    await replaceItem(2, { name: "Mouse novo", description: "Teste" });
    await updateItem(2, { name: "Mouse novo" });
    await deleteItem(2);

    const methods = fetchMock.mock.calls.map(([, options]) => options.method || "GET");
    expect(methods).toEqual(["GET", "POST", "PUT", "PATCH", "DELETE"]);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/items\/$/);
    expect(fetchMock.mock.calls[1][1].headers["Content-Type"]).toBe("application/json");
  });

  it("exibe a mensagem de conflito devolvida pela API", async () => {
    fetchMock.mockResolvedValue(response(409, { detail: "Já existe um item com esse nome." }));
    await expect(createItem({ name: "Repetido" })).rejects.toThrow(
      "Já existe um item com esse nome.",
    );
  });

  it("trata erro de rede e erro HTTP", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(listItems()).rejects.toThrow("Não foi possível conectar à API");

    fetchMock.mockResolvedValueOnce(response(503, null));
    await expect(listItems()).rejects.toThrow("HTTP 503");
  });
});
