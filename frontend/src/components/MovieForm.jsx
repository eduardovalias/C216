import { X } from "lucide-react";
import { useState } from "react";
import { GENRES } from "../constants";

const empty = { title: "", genre: "Terror", year: new Date().getFullYear(), duration_min: 110, synopsis: "" };

export default function MovieForm({ movie, onSave, onClose, busy, error }) {
  const [form, setForm] = useState(movie ? {
    title: movie.title,
    genre: movie.genre,
    year: movie.year,
    duration_min: movie.duration_min,
    synopsis: movie.synopsis,
  } : empty);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "year" || name === "duration_min" ? Number(value) : value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading"><div><span className="eyebrow">SEU CATÁLOGO</span><h2 id="form-title">{movie ? "Editar filme" : "Adicionar filme"}</h2></div><button type="button" className="modal-close" aria-label="Fechar formulário" onClick={onClose}><X size={20}/></button></div>
        <form onSubmit={submit} className="movie-form">
          <label>Título do filme<input name="title" required maxLength={120} autoFocus value={form.title} onChange={change} placeholder="Ex.: O Grande Truque" /></label>
          <div className="field-row"><label>Gênero<select name="genre" value={form.genre} onChange={change}>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select></label><label>Ano<input name="year" type="number" min="1888" max="2100" required value={form.year} onChange={change} /></label></div>
          <label>Duração em minutos<input name="duration_min" type="number" min="30" max="350" required value={form.duration_min} onChange={change} /></label>
          <label>Sinopse<textarea name="synopsis" rows={3} maxLength={600} value={form.synopsis} onChange={change} placeholder="Sobre o que é o filme?" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-footer"><button type="button" className="btn btn-muted" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Salvando..." : movie ? "Salvar alterações" : "Cadastrar filme"}</button></div>
        </form>
      </section>
    </div>
  );
}
