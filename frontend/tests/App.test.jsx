import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { api } from "../src/api";

vi.mock("../src/api", () => ({ api: {
  movies: vi.fn(), stats: vi.fn(), recommendations: vi.fn(), createMovie: vi.fn(),
  updateMovie: vi.fn(), deleteMovie: vi.fn(), rate: vi.fn(), removeRating: vi.fn(), watchlist: vi.fn(),
} }));

const sample = { id: 1, title: "Interestelar", genre: "Ficção científica", year: 2014, duration_min: 169, synopsis: "Uma viagem espacial.", watchlisted: false, rating: null };

beforeEach(() => {
  vi.clearAllMocks();
  api.movies.mockResolvedValue([sample]);
  api.stats.mockResolvedValue({ movies: 1, rated: 0, watchlist: 0, average_rating: null });
  api.recommendations.mockResolvedValue([]);
  api.createMovie.mockResolvedValue(sample);
  api.rate.mockResolvedValue({ ...sample, rating: { id: 1, score: 5, comment: "" } });
  api.watchlist.mockResolvedValue({ ...sample, watchlisted: true });
});

describe("CineMatch", () => {
  it("carrega os filmes e mostra o catálogo", async () => {
    render(<App />);
    expect(screen.getByText(/Carregando seu cinema/)).toBeInTheDocument();
    await screen.findAllByText("Interestelar");
    fireEvent.click(screen.getByRole("button", { name: "Catálogo" }));
    expect(screen.getByText("1 filme encontrado")).toBeInTheDocument();
  });

  it("mostra falhas da API e permite tentar novamente", async () => {
    api.movies.mockRejectedValueOnce(new Error("API indisponível"));
    render(<App />);
    expect(await screen.findByText("API indisponível")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await screen.findAllByText("Interestelar");
    expect(api.movies).toHaveBeenCalledTimes(2);
  });

  it("permite cadastrar um filme pelo formulário", async () => {
    render(<App />);
    await screen.findAllByText("Interestelar");
    fireEvent.click(screen.getByRole("button", { name: "Novo filme" }));
    fireEvent.change(screen.getByLabelText("Título do filme"), { target: { value: "Novo título" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar filme" }));
    await waitFor(() => expect(api.createMovie).toHaveBeenCalledWith(expect.objectContaining({ title: "Novo título" })));
  });

  it("salva uma nota de avaliação", async () => {
    render(<App />);
    await screen.findAllByText("Interestelar");
    fireEvent.click(screen.getByRole("button", { name: "Catálogo" }));
    fireEvent.click(screen.getByRole("button", { name: "Avaliar Interestelar com 5 estrelas" }));
    await waitFor(() => expect(api.rate).toHaveBeenCalledWith(1, 5));
  });

  it("exibe recomendações baseadas na API", async () => {
    api.recommendations.mockResolvedValue([{ movie: sample, score: 4.5, sample_size: 2, reason: "Seu gênero favorito" }]);
    render(<App />);
    await screen.findAllByText("Interestelar");
    fireEvent.click(screen.getByRole("button", { name: "Para você" }));
    expect(screen.getByText(/4.5 \/ 5 afinidade/)).toBeInTheDocument();
  });
});
