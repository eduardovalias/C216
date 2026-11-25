const BASE = "/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Confira se os contêineres estão ativos.");
  }
  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      if (Array.isArray(data.detail)) message = "Confira os dados informados no formulário.";
    } catch {
      // A API pode retornar uma resposta vazia em situações de erro.
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function body(value) {
  return JSON.stringify(value);
}

export const api = {
  movies: () => request("/movies"),
  stats: () => request("/stats"),
  recommendations: () => request("/recommendations"),
  createMovie: (movie) => request("/movies", { method: "POST", body: body(movie) }),
  updateMovie: (id, movie) => request(`/movies/${id}`, { method: "PUT", body: body(movie) }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: "DELETE" }),
  rate: (id, score) => request(`/movies/${id}/rating`, { method: "PUT", body: body({ score }) }),
  removeRating: (id) => request(`/movies/${id}/rating`, { method: "DELETE" }),
  watchlist: (id, watchlisted) => request(`/movies/${id}/watchlist`, { method: "PATCH", body: body({ watchlisted }) }),
};
