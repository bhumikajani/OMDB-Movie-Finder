
import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setTotalResults(0);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function fetchMovies() {
      setLoading(true);
      setError("");

      try {
        const url =
          `https://www.omdbapi.com/?apikey=${API_KEY}` +
          `&s=${encodeURIComponent(query.trim())}` +
          `&page=${currentPage}&type=movie`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (data.Response === "True") {
          setMovies(data.Search);
          setTotalResults(Number(data.totalResults));
        } else {
          setMovies([]);
          setTotalResults(0);
          setError(data.Error || "No movies found.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to fetch movies. Please try again.");
          setMovies([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [query, currentPage]);

  const totalPages = Math.ceil(totalResults / 10);

  function handleSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    setQuery(e.currentTarget.elements.movieSearch.value);
  }

  return (
    <div className="app">
      <h1>🎬 Movie Search App</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          name="movieSearch"
          type="text"
    
          placeholder="Search movies..."
          key={query}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="message">Loading movies...</p>}
      {!loading && error && <p className="message">{error}</p>}

      {!loading && !error && (
        <>
          <p className="result-count">
            Found {totalResults} results
          </p>

          <div className="movie-grid">
            {movies.map((movie) => (
              <div className="movie-card" key={movie.imdbID}>
                {movie.Poster !== "N/A" ? (
                  <img src={movie.Poster} alt={movie.Title} />
                ) : (
                  <div className="no-poster">No poster available</div>
                )}

                <div className="movie-info">
                  <h3>{movie.Title}</h3>
                  <p>Year: {movie.Year}</p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;