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
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
      >
        <Link
          to="/movies/$id"
          params={{ id: movie.id }}
          className="glass relative block overflow-hidden rounded-2xl transition-shadow duration-500 hover:shadow-[0_28px_50px_-24px_oklch(0.84_0.15_88_/_0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 glow-ring" />
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary p-4 text-center text-sm text-muted-foreground">
                {movie.title}
              </div>
            )}
            {movie.is_top_ten && movie.top_ten_rank && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/40"
              >
                <Crown className="h-3 w-3" /> #{movie.top_ten_rank}
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="line-clamp-2 text-xs text-white/80">Open details →</p>
            </div>
          </div>
          <div className="space-y-2 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-semibold leading-tight">{movie.title}</h3>
              {movie.status === "watched" && movie.rating != null && (
                <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" /> {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {movie.genre} · {movie.release_year}
            </p>
            <div className="flex items-center justify-between gap-2 pt-1">
              <StatusBadge status={movie.status} />
            </div>
          </div>
        </Link>

        <div className="mt-2 flex items-center gap-2 px-1">
          <select
            value={movie.status}
            onChange={(e) => updateMovie(movie.id, { status: e.target.value as MovieStatus })}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs backdrop-blur-md transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="unwatched">Unwatched</option>
            <option value="watching">Watching</option>
            <option value="watched">Watched</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.div>
      {editing && <MovieFormModal movie={movie} onClose={() => setEditing(false)} />}
    </>
  );
}
