import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { useMovies, type Movie, type MovieStatus } from "@/store/MoviesContext";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold">{isEdit ? "Edit Movie" : "Add Movie"}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <Field label="Title *">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Genre">
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls}>
                {(GENRES as string[]).map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Release Year">
              <input type="number" value={release_year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Poster URL (optional)">
            <input value={poster_url ?? ""} onChange={(e) => setPoster(e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as MovieStatus)} className={inputCls}>
              <option value="unwatched">Unwatched</option>
              <option value="watching">Watching</option>
              <option value="watched">Watched</option>
            </select>
          </Field>
          {status === "watched" && (
            <Field label="Rating (1–10)">
              <input type="number" min={1} max={10} step={0.5} value={rating} onChange={(e) => setRating(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
            </Field>
          )}
          <Field label="Review notes">
            <textarea rows={3} value={review ?? ""} onChange={(e) => setReview(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Favourite quote">
            <input value={favourite_quote ?? ""} onChange={(e) => setQuote(e.target.value)} className={inputCls} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">
              {isEdit ? "Save changes" : "Add movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
