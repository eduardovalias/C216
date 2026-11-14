// No navegador local usamos localhost:8000. No Chromium do Compose, o hostname
// da interface é 'frontend' e o serviço FastAPI é resolvido como 'api'.
function apiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  const hostname = window.location.hostname === "frontend" ? "api" : window.location.hostname;
  return `http://${hostname}:8000`;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...options,
      headers: options.body
        ? { "Content-Type": "application/json", ...options.headers }
        : options.headers,
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está ativo.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : `A requisição falhou (HTTP ${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export function listItems() {
  return request("/items/");
}

export function getItem(id) {
  return request(`/items/${id}`);
}

export function createItem(values) {
  return request("/items/", { method: "POST", body: JSON.stringify(values) });
}

export function replaceItem(id, values) {
  return request(`/items/${id}`, { method: "PUT", body: JSON.stringify(values) });
}

export function updateItem(id, values) {
  return request(`/items/${id}`, { method: "PATCH", body: JSON.stringify(values) });
}

export function deleteItem(id) {
  return request(`/items/${id}`, { method: "DELETE" });
}
