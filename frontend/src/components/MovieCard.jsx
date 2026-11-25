import { Bookmark, Check, Clock3, Pencil, Trash2, X } from "lucide-react";
import { genreLabels, posterClass } from "../constants";
import { Stars } from "./Stars";

export default function MovieCard({ movie, onEdit, onDelete, onRate, onRemoveRating, onWatchlist, busy = false, matchScore }) {
  return (
    <article className="movie-card" data-testid="movie-card">
      <div className={`movie-poster ${posterClass(movie.genre)}`}>
        <span className="poster-topline">CINEMATCH / ARQUIVO</span>
        <span className="poster-decoration" aria-hidden="true">✦</span>
        <div className="poster-content">
          <span className="poster-genre">{genreLabels[movie.genre] || movie.genre}</span>
          <span className="poster-title">{movie.title}</span>
          <span className="poster-year">{movie.year}</span>
        </div>
        {typeof matchScore === "number" && <span className="match-badge">{matchScore.toFixed(1)} / 5 afinidade</span>}
      </div>
      <div className="movie-info">
        <div className="movie-heading">
          <h3>{movie.title}</h3>
          <span className="movie-year">{movie.year}</span>
        </div>
        <div className="movie-meta">
          <span>{movie.genre}</span>
          <span><Clock3 size={13} /> {movie.duration_min} min</span>
        </div>
        <p className="movie-description">{movie.synopsis || "Sem sinopse cadastrada."}</p>
        <div className="rating-row">
          <Stars title={movie.title} score={movie.rating?.score || 0} onRate={(score) => onRate(movie, score)} disabled={busy} />
          {movie.rating && <button className="clear-rating" type="button" onClick={() => onRemoveRating(movie)} disabled={busy} title="Remover nota"><X size={13} /> Limpar</button>}
        </div>
        <div className="movie-actions">
          <button className={`watch-button ${movie.watchlisted ? "active" : ""}`} type="button" onClick={() => onWatchlist(movie)} disabled={busy || Boolean(movie.rating)} aria-label={movie.watchlisted ? `Remover ${movie.title} da lista` : `Adicionar ${movie.title} à lista Quero assistir`} title={movie.rating ? "Filmes avaliados já foram assistidos" : "Quero assistir"}>
            {movie.watchlisted ? <Check size={15} /> : <Bookmark size={15} />}
            {movie.watchlisted ? "Na lista" : "Quero assistir"}
          </button>
          <div className="icon-actions">
            <button type="button" aria-label={`Editar ${movie.title}`} title="Editar filme" onClick={() => onEdit(movie)} disabled={busy}><Pencil size={16} /></button>
            <button type="button" aria-label={`Excluir ${movie.title}`} title="Excluir filme" onClick={() => onDelete(movie)} disabled={busy}><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
