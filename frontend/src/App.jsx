import { ArrowRight, Bookmark, Clapperboard, Film, Heart, LayoutGrid, Plus, Search, Sparkles, Star, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import MovieCard from "./components/MovieCard";
import MovieForm from "./components/MovieForm";
import { GENRES } from "./constants";

const tabs = [
  { id: "home", label: "Início", icon: LayoutGrid },
  { id: "catalog", label: "Catálogo", icon: Film },
  { id: "discover", label: "Para você", icon: Sparkles },
  { id: "watchlist", label: "Quero assistir", icon: Bookmark },
];

const initialStats = { movies: 0, rated: 0, watchlist: 0, average_rating: null };

export default function App() {
  const [page, setPage] = useState("home");
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [formMovie, setFormMovie] = useState(undefined);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");

  const reload = useCallback(async () => {
    try {
      const [nextMovies, nextStats, nextRecommendations] = await Promise.all([
        api.movies(), api.stats(), api.recommendations(),
      ]);
      setMovies(nextMovies);
      setStats(nextStats);
      setRecommendations(nextRecommendations);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filteredMovies = useMemo(() => movies.filter((movie) => {
    const matchesSearch = movie.title.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
    const matchesGenre = genre === "Todos" || movie.genre === genre;
    return matchesSearch && matchesGenre;
  }), [movies, search, genre]);

  async function mutate(action, successMessage) {
    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      await action();
      await reload();
      setNotice(successMessage);
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveMovie(values) {
    const editing = Boolean(formMovie?.id);
    const success = await mutate(() => editing ? api.updateMovie(formMovie.id, values) : api.createMovie(values), editing ? "Filme atualizado com sucesso." : "Filme adicionado ao catálogo.");
    if (success) { setFormMovie(undefined); setPage("catalog"); }
  }

  async function deleteMovie() {
    if (!confirmDelete) return;
    const success = await mutate(() => api.deleteMovie(confirmDelete.id), "Filme excluído do catálogo.");
    if (success) setConfirmDelete(null);
  }

  async function rateMovie(movie, score) {
    await mutate(() => api.rate(movie.id, score), `Você avaliou ${movie.title} com ${score} estrela(s).`);
  }

  async function clearRating(movie) {
    await mutate(() => api.removeRating(movie.id), `Avaliação de ${movie.title} removida.`);
  }

  async function toggleWatchlist(movie) {
    await mutate(() => api.watchlist(movie.id, !movie.watchlisted), movie.watchlisted ? "Filme removido da sua lista." : "Filme adicionado à lista Quero assistir.");
  }

  function openForm(movie) { setActionError(""); setFormMovie(movie); }

  const cardActions = { onEdit: openForm, onDelete: setConfirmDelete, onRate: rateMovie, onRemoveRating: clearRating, onWatchlist: toggleWatchlist, busy };
  const watched = movies.filter((movie) => movie.watchlisted);
  const recommended = recommendations.map((item) => item.movie);

  function card(movie, matchScore) {
    return <MovieCard key={movie.id} movie={movie} {...cardActions} matchScore={matchScore} />;
  }

  function movieGrid(list, empty, scores = null) {
    return list.length ? (
      <div className="movie-grid">{list.map((movie) => card(movie, scores?.get(movie.id)))}</div>
    ) : <div className="empty-state"><Film size={30} /><p>{empty}</p></div>;
  }

  const recScores = new Map(recommendations.map((item) => [item.movie.id, item.score]));

  return (
    <div className="app-shell">
      <header className="site-header"><div className="header-inner container">
        <button className="logo" type="button" onClick={() => setPage("home")} aria-label="CineMatch início"><span className="logo-symbol"><Clapperboard size={22} /></span><span>Cine<span className="accent">Match</span></span></button>
        <nav className="top-nav" aria-label="Navegação principal">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`nav-link ${page === id ? "selected" : ""}`} onClick={() => setPage(id)} aria-current={page === id ? "page" : undefined}><Icon size={17} /><span>{label}</span></button>)}</nav>
        <button type="button" className="btn btn-primary top-add" onClick={() => openForm(null)}><Plus size={17} /> Novo filme</button>
      </div></header>
      <main className="container content">
        {actionError && formMovie === undefined && !confirmDelete && <div className="banner-error" role="alert"><span>{actionError}</span><button aria-label="Fechar erro" type="button" onClick={() => setActionError("")}><X size={17}/></button></div>}
        {notice && <div className="banner-success" role="status"><span>{notice}</span><button aria-label="Fechar aviso" type="button" onClick={() => setNotice("")}><X size={17}/></button></div>}
        {loading && <div className="loading-state" role="status">Carregando seu cinema...</div>}
        {!loading && loadError && <div className="empty-state" role="alert"><h2>Não foi possível carregar os dados</h2><p>{loadError}</p><button className="btn btn-primary" type="button" onClick={() => { setLoading(true); reload(); }}>Tentar novamente</button></div>}
        {!loading && !loadError && page === "home" && <>
          <section className="hero"><div className="hero-glow"/><div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> SEU ESPAÇO DE CINEMA</span><h1>Grandes histórias.<br/><em>Seu próximo favorito.</em></h1><p>Organize seus filmes, registre suas notas e descubra o que assistir com recomendações feitas a partir do seu gosto.</p><div className="hero-actions"><button className="btn btn-primary" type="button" onClick={() => setPage("discover")}>Explorar recomendações <ArrowRight size={17}/></button><button className="btn btn-ghost" type="button" onClick={() => setPage("catalog")}>Ver catálogo</button></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit art-orbit-1"/><div className="art-orbit art-orbit-2"/><div className="art-film"><Clapperboard size={71}/><div className="art-stars">★★★★★</div><small>YOUR MOVIE UNIVERSE</small></div></div></section>
          <section className="stats-grid" aria-label="Estatísticas do catálogo"><div className="stat-card"><span className="stat-icon violet"><Film size={20}/></span><span className="stat-value">{stats.movies}</span><span className="stat-label">Filmes no catálogo</span></div><div className="stat-card"><span className="stat-icon pink"><Star size={20}/></span><span className="stat-value">{stats.rated}</span><span className="stat-label">Filmes avaliados</span></div><div className="stat-card"><span className="stat-icon blue"><Bookmark size={20}/></span><span className="stat-value">{stats.watchlist}</span><span className="stat-label">Quero assistir</span></div><div className="stat-card"><span className="stat-icon amber"><TrendingUp size={20}/></span><span className="stat-value">{stats.average_rating == null ? "—" : stats.average_rating.toFixed(1)}</span><span className="stat-label">Minha nota média</span></div></section>
          <section className="section-block"><div className="section-header"><div><span className="eyebrow">ESCOLHIDOS PARA VOCÊ</span><h2><Sparkles size={24} /> Baseado no seu gosto</h2><p>Quanto mais você avalia, melhores são as sugestões por gênero.</p></div><button type="button" className="text-link" onClick={() => setPage("discover")}>Ver todas <ArrowRight size={17}/></button></div>{recommendations.length ? movieGrid(recommended.slice(0, 4), "", recScores) : <div className="recommendation-hint"><Sparkles size={26}/><div><strong>Sua sessão começa com uma avaliação.</strong><p>Dê notas aos filmes que já assistiu no catálogo para descobrir recomendações.</p></div><button type="button" className="btn btn-outline" onClick={() => setPage("catalog")}>Avaliar filmes <ArrowRight size={15}/></button></div>}</section>
          <section className="section-block featured-section"><div className="section-header"><div><span className="eyebrow">ESCOLHA UM FILME</span><h2><Clapperboard size={24}/> Explore o catálogo</h2></div><button type="button" className="text-link" onClick={() => setPage("catalog")}>Catálogo completo <ArrowRight size={17}/></button></div>{movieGrid(movies.slice(0, 4), "Ainda não há filmes cadastrados.")}</section>
        </>}
        {!loading && !loadError && page === "catalog" && <><div className="page-heading"><div><span className="eyebrow">SUA COLEÇÃO</span><h1>Catálogo de filmes</h1><p>Encontre, avalie e organize os filmes que fazem parte da sua história.</p></div><button type="button" className="btn btn-primary" onClick={() => openForm(null)}><Plus size={17}/> Adicionar filme</button></div><div className="filter-bar"><label className="search-field"><Search size={18}/><input aria-label="Buscar por título" placeholder="Buscar por título..." value={search} onChange={(event) => setSearch(event.target.value)}/></label><label className="genre-filter">Gênero<select aria-label="Filtrar por gênero" value={genre} onChange={(event) => setGenre(event.target.value)}><option value="Todos">Todos</option>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select></label></div><div className="results-line">{filteredMovies.length} {filteredMovies.length === 1 ? "filme encontrado" : "filmes encontrados"}</div>{movieGrid(filteredMovies, "Nenhum filme corresponde a essa busca.")}</>}
        {!loading && !loadError && page === "discover" && <><div className="page-heading"><div><span className="eyebrow">DESCUBRA ALGO NOVO</span><h1>Para você <Sparkles size={30} className="heading-icon"/></h1><p>O sistema compara suas avaliações por gênero e prioriza títulos ainda não avaliados.</p></div></div><div className="discovery-note"><Heart size={21}/><span>As notas de afinidade são médias das suas avaliações por gênero, não avaliações reais do filme. Filmes já avaliados ficam de fora.</span></div>{recommendations.length ? movieGrid(recommended, "", recScores) : <div className="empty-state"><Sparkles size={34}/><h2>Ainda não há recomendações</h2><p>Avalie um filme no catálogo para descobrir outras opções do mesmo gênero.</p><button type="button" className="btn btn-primary" onClick={() => setPage("catalog")}>Ir para o catálogo</button></div>}</>}
        {!loading && !loadError && page === "watchlist" && <><div className="page-heading"><div><span className="eyebrow">SALVOS PARA DEPOIS</span><h1>Quero assistir</h1><p>Seus filmes separados para a próxima sessão. Ao avaliar, eles saem automaticamente da lista.</p></div><span className="count-pill">{watched.length} salvos</span></div>{movieGrid(watched, "Sua lista está vazia. Adicione filmes do catálogo para vê-los aqui.")}</>}
      </main>
      <footer className="site-footer"><div className="container footer-inner"><span><Clapperboard size={18}/> Cine<span className="accent">Match</span></span><span>Projeto Final · C216 Sistemas Distribuídos</span><span>Feito para descobrir boas histórias <Heart size={14}/></span></div></footer>
      {formMovie !== undefined && <MovieForm movie={formMovie} onSave={saveMovie} onClose={() => setFormMovie(undefined)} busy={busy} error={actionError} />}
      {confirmDelete && <div className="modal-overlay" role="presentation"><section className="confirm-panel" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="danger-icon"><X size={23}/></span><h2 id="delete-title">Excluir este filme?</h2><p>"{confirmDelete.title}" e sua avaliação serão excluídos. Essa ação não pode ser desfeita.</p>{actionError && <p className="form-error" role="alert">{actionError}</p>}<div className="modal-footer"><button type="button" className="btn btn-muted" onClick={() => setConfirmDelete(null)}>Cancelar</button><button type="button" className="btn btn-danger" onClick={deleteMovie} disabled={busy}>{busy ? "Excluindo..." : "Excluir definitivamente"}</button></div></section></div>}
    </div>
  );
}
