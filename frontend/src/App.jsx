import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import MovieCard from "./components/MovieCard";
import MovieForm from "./components/MovieForm";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [recs, setRecs] = useState([]);
  const [view, setView] = useState("catalog");
  const [form, setForm] = useState(undefined);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => { try { const [m,r] = await Promise.all([api.movies(),api.recommendations()]); setMovies(m);setRecs(r); } catch (e) { setError(e.message); } }, []);
  useEffect(() => { reload(); }, [reload]);
  async function action(callback) { setBusy(true); setError(""); try { await callback(); await reload(); setForm(undefined);setRemove(null); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  const items = view === "catalog" ? movies : recs.map((r) => r.movie);
  const scores = new Map(recs.map((r) => [r.movie.id,r.score]));
  return <><header><h1>CineMatch</h1><nav><button type="button" onClick={() => setView("catalog")}>Catálogo</button><button type="button" onClick={() => setView("discover")}>Recomendações</button></nav></header><main className="container"><h2>{view === "catalog" ? "Catálogo" : "Para você"}</h2><p>{view === "discover" ? "As sugestões usam a média das suas avaliações por gênero." : "Explore e avalie filmes."}</p><button onClick={() => setForm(null)} type="button">Adicionar filme</button>{error && <p role="alert" className="banner-error">{error}</p>}{!items.length && <p className="empty-state">Avalie filmes para receber recomendações.</p>}<section className="movie-grid">{items.map((movie) => <MovieCard key={movie.id} movie={movie} matchScore={view === "discover" ? scores.get(movie.id) : undefined} busy={busy} onEdit={setForm} onDelete={setRemove} onRate={(item,score) => action(() => api.rate(item.id,score))} onRemoveRating={(item) => action(() => api.removeRating(item.id))} onWatchlist={(item) => action(() => api.watchlist(item.id,!item.watchlisted))}/>)}</section></main>{form !== undefined && <MovieForm movie={form} busy={busy} onClose={() => setForm(undefined)} error={error} onSave={(data) => action(() => form?.id ? api.updateMovie(form.id,data) : api.createMovie(data))}/>} {remove && <div className="modal-overlay"><section className="confirm-panel" role="dialog" aria-modal="true"><p>Excluir {remove.title}?</p><button onClick={() => action(() => api.deleteMovie(remove.id))} type="button">Confirmar exclusão</button> <button type="button" onClick={() => setRemove(null)}>Cancelar</button></section></div>}</>;
}
