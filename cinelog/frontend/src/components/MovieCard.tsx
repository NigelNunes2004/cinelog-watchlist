import { Link, useNavigate } from "@tanstack/react-router";
import { Star, Pencil, Trash2, Crown } from "lucide-react";
import { useState } from "react";
import { useMovies, type Movie, type MovieStatus } from "@/store/MoviesContext";
import { StatusBadge } from "./StatusBadge";
import { MovieFormModal } from "./MovieFormModal";

export function MovieCard({ movie }: { movie: Movie }) {
  const { updateMovie, deleteMovie } = useMovies();
  const _nav = useNavigate();
  void _nav;
  const [editing, setEditing] = useState(false);

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${movie.title}"?`)) deleteMovie(movie.id);
  };

  return (
    <>
      <div className="group relative">
        <Link
          to="/movies/$id"
          params={{ id: movie.id }}
          className="block overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_oklch(0_0_0/0.7)]"
        >
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary text-muted-foreground text-sm p-4 text-center">
                {movie.title}
              </div>
            )}
            {movie.is_top_ten && movie.top_ten_rank && (
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                <Crown className="h-3 w-3" /> #{movie.top_ten_rank}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight line-clamp-1">{movie.title}</h3>
              {movie.status === "watched" && movie.rating != null && (
                <span className="flex shrink-0 items-center gap-0.5 text-primary text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" /> {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{movie.genre} · {movie.release_year}</p>
            <div className="flex items-center justify-between gap-2 pt-1">
              <StatusBadge status={movie.status} />
            </div>
          </div>
        </Link>

        <div className="px-3 pb-3 flex items-center gap-2">
          <select
            value={movie.status}
            onChange={(e) => updateMovie(movie.id, { status: e.target.value as MovieStatus })}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-secondary border border-border rounded-md px-2 py-1 text-xs"
          >
            <option value="unwatched">Unwatched</option>
            <option value="watching">Watching</option>
            <option value="watched">Watched</option>
          </select>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {editing && <MovieFormModal movie={movie} onClose={() => setEditing(false)} />}
    </>
  );
}
