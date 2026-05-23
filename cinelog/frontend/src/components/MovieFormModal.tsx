import { useState, FormEvent, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { useMovies, type Movie, type MovieStatus } from "@/store/MoviesContext";
import { searchTMDB, type TMDBResult } from "@/api/movies";

// @ts-expect-error - JS mock data
import { GENRES } from "@/mock/data";

export function MovieFormModal({
  movie,
  onClose,
}: {
  movie?: Movie;
  onClose: () => void;
}) {
  const { addMovie, updateMovie } = useMovies();
  const isEdit = !!movie;

  const [title, setTitle] = useState(movie?.title ?? "");
  const [genre, setGenre] = useState(movie?.genre ?? "Drama");
  const [release_year, setYear] = useState(movie?.release_year ?? new Date().getFullYear());
  const [poster_url, setPoster] = useState(movie?.poster_url ?? "");
  const [status, setStatus] = useState<MovieStatus>(movie?.status ?? "unwatched");
  const [rating, setRating] = useState<number | "">(movie?.rating ?? "");
  const [review, setReview] = useState(movie?.review ?? "");
  const [favourite_quote, setQuote] = useState(movie?.favourite_quote ?? "");

  // TMDB search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced TMDB search (via backend /search proxy)
  useEffect(() => {
    if (!query.trim() || isEdit) {
      setResults([]);
      setShowDropdown(false);
      setSearchError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const data = await searchTMDB(query);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
        setSearchError("Search failed. Make sure the backend is running.");
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isEdit]);

  // Auto-fill form when user picks a TMDB result
  const handlePick = (result: TMDBResult) => {
    setTitle(result.title);
    setGenre(result.genre);
    if (result.release_year) setYear(result.release_year);
    if (result.poster_url) setPoster(result.poster_url);
    setQuery("");
    setShowDropdown(false);
    setResults([]);
    setSearchError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      genre,
      release_year: Number(release_year),
      poster_url: poster_url.trim() || null,
      status,
      rating: status === "watched" && rating !== "" ? Number(rating) : null,
      review: review.trim() || null,
      favourite_quote: favourite_quote.trim() || null,
      rewatch_count: movie?.rewatch_count ?? 0,
      is_top_ten: movie?.is_top_ten ?? false,
      top_ten_rank: movie?.top_ten_rank ?? null,
    };
    if (isEdit && movie) updateMovie(movie.id, payload);
    else addMovie(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="text-xl font-semibold">{isEdit ? "Edit Movie" : "Add Movie"}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 gap-4 p-5">

          {/* TMDB Search — only show when adding, not editing */}
          {!isEdit && (
            <div className="relative">
              <Field label="Search movie (auto-fill from TMDB)">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a movie title to auto-fill..."
                    className={`${inputCls} pl-9`}
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </Field>

              {/* Dropdown results */}
              {showDropdown && !searching && (
                <div className="absolute z-50 w-full mt-1 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                  {searchError ? (
                    <p className="px-3 py-2 text-sm text-destructive">{searchError}</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No movies found.</p>
                  ) : (
                    results.map((r) => (
                      <button
                        key={r.tmdb_id}
                        type="button"
                        onClick={() => handlePick(r)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary text-left transition-colors"
                      >
                        {r.poster_url ? (
                          <img
                            src={r.poster_url}
                            alt={r.title}
                            className="w-8 h-12 object-cover rounded shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-12 bg-muted rounded shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.genre} · {r.release_year ?? "Unknown year"}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {!isEdit && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or fill in manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
          <Field label="Title *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Genre">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className={inputCls}
              >
                {(GENRES as string[]).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Release Year">
              <input
                type="number"
                value={release_year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Poster URL (optional)">
            <div className="space-y-2">
              <input
                value={poster_url ?? ""}
                onChange={(e) => setPoster(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
              {poster_url && (
                <img
                  src={poster_url}
                  alt="poster preview"
                  className="w-16 h-24 object-cover rounded-lg border border-border"
                />
              )}
            </div>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MovieStatus)}
              className={inputCls}
            >
              <option value="unwatched">Unwatched</option>
              <option value="watching">Watching</option>
              <option value="watched">Watched</option>
            </select>
          </Field>

          {status === "watched" && (
            <Field label="Rating (1–10)">
              <input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={rating}
                onChange={(e) =>
                  setRating(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Review notes">
            <textarea
              rows={3}
              value={review ?? ""}
              onChange={(e) => setReview(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Favourite quote">
            <input
              value={favourite_quote ?? ""}
              onChange={(e) => setQuote(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
            >
              {isEdit ? "Save changes" : "Add movie"}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}