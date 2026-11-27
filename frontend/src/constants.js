export const GENRES = ["Terror", "Ficção científica", "Suspense", "Drama", "Ação", "Animação", "Comédia"];

export const genreLabels = {
  "Terror": "Terror",
  "Ficção científica": "Sci-fi",
  "Suspense": "Suspense",
  "Drama": "Drama",
  "Ação": "Ação",
  "Animação": "Animação",
  "Comédia": "Comédia",
};

export function posterClass(genre) {
  const map = {
    "Terror": "poster-horror",
    "Ficção científica": "poster-scifi",
    "Suspense": "poster-thriller",
    "Drama": "poster-drama",
    "Ação": "poster-action",
    "Animação": "poster-animation",
    "Comédia": "poster-comedy",
  };
  return map[genre] || "poster-default";
}
