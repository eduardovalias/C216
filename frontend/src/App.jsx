import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import MovieCard from "./components/MovieCard";
import MovieForm from "./components/MovieForm";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(undefined);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => api.movies().then(setMovies).catch((e) => setError(e.message)), []);
  useEffect(() => { reload(); }, [reload]);
  async function action(callback) { setBusy(true); setError(""); try { await callback(); await reload(); setForm(undefined); setRemove(null); setNotice("Alteração salva."); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <><header><h1>CineMatch</h1></header><main className="container"><h2>Seu catálogo</h2><p>Avalie filmes e monte sua lista para assistir.</p><button onClick={() => setForm(null)} type="button">Adicionar filme</button>{error && <p role="alert" className="banner-error">{error}</p>}{notice && <p role="status" className="banner-success">{notice}</p>}<section className="movie-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} busy={busy} onEdit={setForm} onDelete={setRemove} onRate={(item,score) => action(() => api.rate(item.id,score))} onRemoveRating={(item) => action(() => api.removeRating(item.id))} onWatchlist={(item) => action(() => api.watchlist(item.id,!item.watchlisted))}/>)}</section></main>{form !== undefined && <MovieForm movie={form} busy={busy} onClose={() => setForm(undefined)} error={error} onSave={(data) => action(() => form?.id ? api.updateMovie(form.id,data) : api.createMovie(data))}/>} {remove && <div className="modal-overlay"><section className="confirm-panel" role="dialog" aria-modal="true"><p>Excluir {remove.title}?</p><button onClick={() => action(() => api.deleteMovie(remove.id))} type="button">Confirmar exclusão</button> <button type="button" onClick={() => setRemove(null)}>Cancelar</button></section></div>}</>;
}
