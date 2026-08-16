import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, Crown, RotateCcw, Pencil } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { MovieFormModal } from "@/components/MovieFormModal";
import { FadeItem, PageMotion } from "@/components/PageMotion";
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
        <div className="py-20 text-center">
          <h1 className="text-2xl font-semibold">Movie not found</h1>
          <Link to="/" className="mt-4 inline-block text-teal">
            Back to watchlist
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageMotion>
        <FadeItem>
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Watchlist
          </Link>
        </FadeItem>

        <div className="grid gap-10 md:grid-cols-[minmax(0,340px)_1fr] lg:gap-14">
          <FadeItem>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-2xl shadow-black/40 ring-1 ring-border"
            >
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center text-muted-foreground">
                  {movie.title}
                </div>
              )}
              {movie.is_top_ten && movie.top_ten_rank && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/30 backdrop-blur-sm">
                  <Crown className="h-3.5 w-3.5" /> Top 10 · #{movie.top_ten_rank}
                </div>
              )}
            </motion.div>
          </FadeItem>

          <FadeItem>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-teal" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">
                {movie.genre} · {movie.release_year}
              </p>
            </div>
            <h1 className="text-4xl font-medium leading-tight sm:text-5xl">{movie.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StatusBadge status={movie.status} />
              {movie.status === "watched" && movie.rating != null && (
                <span className="flex items-center gap-1.5 text-lg font-semibold text-rose">
                  <Star className="h-5 w-5 fill-current" /> {movie.rating.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Rewatched {movie.rewatch_count}×
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                onClick={() => incrementRewatch(movie.id)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-teal/40 hover:text-teal"
              >
                <RotateCcw className="h-4 w-4" /> + Rewatch
              </button>
              <button
                onClick={() => toggleTopTen(movie.id)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  movie.is_top_ten
                    ? "border border-border bg-card hover:border-destructive/40 hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:brightness-105"
                }`}
              >
                <Crown className="h-4 w-4" />
                {movie.is_top_ten ? "Remove from Top 10" : "Add to Top 10"}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted/60"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            </div>

            {movie.favourite_quote && (
              <blockquote className="surface mt-10 rounded-xl border-l-[3px] border-l-primary p-5">
                <p className="text-lg italic leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
                  "{movie.favourite_quote}"
                </p>
              </blockquote>
            )}

            {movie.review && (
              <div className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="h-3 w-1 rounded-full bg-teal" />
                  My review
                </h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
                  {movie.review}
                </p>
              </div>
            )}

            <dl className="mt-10 grid grid-cols-2 gap-5 border-t border-border pt-8 sm:grid-cols-4">
              <Stat label="Status" value={movie.status} />
              <Stat label="Rating" value={movie.rating != null ? movie.rating.toFixed(1) : "—"} />
              <Stat label="Rewatches" value={String(movie.rewatch_count)} />
              <Stat label="Added" value={movie.created_at} />
            </dl>
          </FadeItem>
        </div>
      </PageMotion>

      {editing && <MovieFormModal movie={movie} onClose={() => setEditing(false)} />}
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm capitalize">{value}</dd>
    </div>
  );
}
