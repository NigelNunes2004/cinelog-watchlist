import { Link } from "@tanstack/react-router";
import { Star, Pencil, Trash2, Crown } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useMovies, type Movie, type MovieStatus } from "@/store/MoviesContext";
import { StatusBadge } from "./StatusBadge";
import { MovieFormModal } from "./MovieFormModal";

export function MovieCard({ movie }: { movie: Movie }) {
  const { updateMovie, deleteMovie } = useMovies();
  const [editing, setEditing] = useState(false);

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${movie.title}"?`)) deleteMovie(movie.id);
  };

  return (
    <>
      <motion.div
        className="group relative"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Link
          to="/movies/$id"
          params={{ id: movie.id }}
          className="surface relative block overflow-hidden rounded-xl transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-24px_oklch(0_0_0_/_0.6)]"
        >
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card p-4 text-center text-sm text-muted-foreground">
                {movie.title}
              </div>
            )}
            {movie.is_top_ten && movie.top_ten_rank && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/25 backdrop-blur-sm">
                <Crown className="h-3 w-3 text-primary" /> #{movie.top_ten_rank}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent" />
          </div>

          <div className="space-y-2 border-t border-border/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="line-clamp-1 text-[13px] font-semibold leading-snug"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {movie.title}
              </h3>
              {movie.status === "watched" && movie.rating != null && (
                <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-primary">
                  <Star className="h-3 w-3 fill-current" /> {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {movie.genre}
              <span className="mx-1.5 text-border">·</span>
              {movie.release_year}
            </p>
            <StatusBadge status={movie.status} />
          </div>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <select
            value={movie.status}
            onChange={(e) => updateMovie(movie.id, { status: e.target.value as MovieStatus })}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="unwatched">Unwatched</option>
            <option value="watching">Watching</option>
            <option value="watched">Watched</option>
          </select>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
      {editing && <MovieFormModal movie={movie} onClose={() => setEditing(false)} />}
    </>
  );
}
