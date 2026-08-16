import { useState, FormEvent, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="surface-raised flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
            <h2 className="text-xl font-semibold">
              {isEdit ? "Edit Movie" : "Add Movie"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4 p-5">
            {!isEdit && (
              <div className="relative">
                <Field label="Search movie (auto-fill from TMDB)">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type a movie title to auto-fill..."
                      className={`${inputCls} pl-9`}
                    />
                    {searching && (
                      <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </Field>

                {showDropdown && !searching && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
                  >
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
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-primary/10"
                        >
                          {r.poster_url ? (
                            <img
                              src={r.poster_url}
                              alt={r.title}
                              className="h-12 w-8 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-12 w-8 shrink-0 rounded bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{r.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.genre} · {r.release_year ?? "Unknown year"}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {!isEdit && (
              <div className="flex shrink-0 items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or fill in manually</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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
                      className="h-24 w-16 rounded-md border border-border object-cover"
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
                  className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105"
                >
                  {isEdit ? "Save changes" : "Add movie"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const inputCls =
  "w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
