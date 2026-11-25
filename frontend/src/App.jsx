import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import MovieForm from "./components/MovieForm";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(undefined);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = useCallback(() => api.movies().then(setMovies).catch((e) => setError(e.message)), []);
  useEffect(() => { reload(); }, [reload]);
  async function action(callback) { setBusy(true); setError(""); try { await callback(); await reload(); setForm(undefined); setRemove(null); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <><header><h1>CineMatch</h1></header><main className="container"><h2>Gerencie seu catálogo</h2><button onClick={() => setForm(null)} type="button">Adicionar filme</button>{error && <p role="alert" className="banner-error">{error}</p>}<section className="movies">{movies.map((movie) => <article className="movie-item" key={movie.id}><h3>{movie.title}</h3><p>{movie.genre} · {movie.year}</p><p>{movie.synopsis}</p><button onClick={() => setForm(movie)} type="button">Editar {movie.title}</button> <button type="button" onClick={() => setRemove(movie)}>Excluir</button></article>)}</section></main>{form !== undefined && <MovieForm movie={form} busy={busy} onClose={() => setForm(undefined)} error={error} onSave={(data) => action(() => form?.id ? api.updateMovie(form.id,data) : api.createMovie(data))}/>} {remove && <div className="modal-overlay"><section className="confirm-panel" role="dialog" aria-modal="true"><p>Excluir {remove.title}?</p><button onClick={() => action(() => api.deleteMovie(remove.id))} type="button">Confirmar exclusão</button> <button type="button" onClick={() => setRemove(null)}>Cancelar</button></section></div>}</>;
}
