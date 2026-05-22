import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, Crown, RotateCcw, Pencil } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { MovieFormModal } from "@/components/MovieFormModal";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/movies/$id")({
  component: MovieDetailPage,
  head: () => ({
    meta: [
      { title: "Movie — CineLog" },
      { name: "description", content: "Movie details, rating, review, and rewatch history." },
    ],
  }),
});

function MovieDetailPage() {
  const { id } = useParams({ from: "/movies/$id" });
  const { getMovie, incrementRewatch, toggleTopTen } = useMovies();
  const movie = getMovie(id);
  const [editing, setEditing] = useState(false);

  if (!movie) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold">Movie not found</h1>
          <Link to="/" className="text-primary mt-4 inline-block">Back to watchlist</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Watchlist
      </Link>

      <div className="grid md:grid-cols-[minmax(0,360px)_1fr] gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted shadow-2xl shadow-black/50">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground p-6 text-center">{movie.title}</div>
            )}
            {movie.is_top_ten && movie.top_ten_rank && (
              <div className="absolute -top-3 -left-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-xl">
                <Crown className="h-4 w-4" /> Top 10 · #{movie.top_ten_rank}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">{movie.genre} · {movie.release_year}</p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">{movie.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <StatusBadge status={movie.status} />
            {movie.status === "watched" && movie.rating != null && (
              <span className="flex items-center gap-1.5 text-primary text-lg font-semibold">
                <Star className="h-5 w-5 fill-current" /> {movie.rating.toFixed(1)} <span className="text-muted-foreground text-sm font-normal">/ 10</span>
              </span>
            )}
            <span className="text-sm text-muted-foreground">Rewatched {movie.rewatch_count}×</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => incrementRewatch(movie.id)}
              className="inline-flex items-center gap-2 rounded-md bg-secondary border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/70"
            >
              <RotateCcw className="h-4 w-4" /> + Rewatch
            </button>
            <button
              onClick={() => toggleTopTen(movie.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                movie.is_top_ten
                  ? "bg-secondary border border-border text-foreground hover:bg-destructive/20"
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              }`}
            >
              <Crown className="h-4 w-4" />
              {movie.is_top_ten ? "Remove from Top 10" : "Add to Top 10"}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          </div>

          {movie.favourite_quote && (
            <blockquote className="mt-10 border-l-4 border-primary pl-5 py-2">
              <p className="text-xl italic" style={{ fontFamily: '"Playfair Display", serif' }}>"{movie.favourite_quote}"</p>
            </blockquote>
          )}

          {movie.review && (
            <div className="mt-8">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">My review</h2>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">{movie.review}</p>
            </div>
          )}

          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-border">
            <Stat label="Status" value={movie.status} />
            <Stat label="Rating" value={movie.rating != null ? movie.rating.toFixed(1) : "—"} />
            <Stat label="Rewatches" value={String(movie.rewatch_count)} />
            <Stat label="Added" value={movie.created_at} />
          </dl>
        </div>
      </div>

      {editing && <MovieFormModal movie={movie} onClose={() => setEditing(false)} />}
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</dt>
      <dd className="mt-1 text-sm capitalize">{value}</dd>
    </div>
  );
}
