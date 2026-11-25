import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api.movies().then(setMovies).catch((e) => setError(e.message));
  }, []);
  return <><header><h1>CineMatch</h1></header><main className="container"><h2>Catálogo de filmes</h2>{error && <p role="alert">{error}</p>}<section className="movies">{movies.map((movie) => <article className="movie-item" key={movie.id}><h3>{movie.title}</h3><p>{movie.genre} · {movie.year}</p><p>{movie.synopsis}</p></article>)}</section></main></>;
}
