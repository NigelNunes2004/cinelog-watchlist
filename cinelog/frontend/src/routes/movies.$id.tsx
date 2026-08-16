import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, Crown, RotateCcw, Pencil } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { MovieFormModal } from "@/components/MovieFormModal";
import { FadeItem, MagneticButton, PageMotion } from "@/components/PageMotion";
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
          <Link to="/" className="mt-4 inline-block text-primary">
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
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Watchlist
          </Link>
        </FadeItem>

        <div className="grid gap-10 md:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
          <FadeItem>
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative aspect-[2/3] overflow-hidden rounded-3xl bg-muted shadow-2xl shadow-black/60 glow-ring"
              style={{ transformStyle: "preserve-3d" }}
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
                <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/40">
                  <Crown className="h-4 w-4" /> Top 10 · #{movie.top_ten_rank}
                </div>
              )}
            </motion.div>
          </FadeItem>

          <FadeItem>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {movie.genre} · {movie.release_year}
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {movie.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <StatusBadge status={movie.status} />
              {movie.status === "watched" && movie.rating != null && (
                <span className="flex items-center gap-1.5 text-lg font-semibold text-primary">
                  <Star className="h-5 w-5 fill-current" /> {movie.rating.toFixed(1)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Rewatched {movie.rewatch_count}×
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <MagneticButton
                onClick={() => incrementRewatch(movie.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium backdrop-blur-md hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" /> + Rewatch
              </MagneticButton>
              <MagneticButton
                onClick={() => toggleTopTen(movie.id)}
                className={`premium-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  movie.is_top_ten
                    ? "border border-white/10 bg-white/5 text-foreground hover:bg-destructive/20"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                }`}
              >
                <Crown className="h-4 w-4" />
                {movie.is_top_ten ? "Remove from Top 10" : "Add to Top 10"}
              </MagneticButton>
              <MagneticButton
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5"
              >
                <Pencil className="h-4 w-4" /> Edit
              </MagneticButton>
            </div>

            {movie.favourite_quote && (
              <blockquote className="glass mt-10 rounded-2xl border-l-4 border-primary p-5">
                <p className="text-xl italic" style={{ fontFamily: "var(--font-display)" }}>
                  "{movie.favourite_quote}"
                </p>
              </blockquote>
            )}

            {movie.review && (
              <div className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  My review
                </h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
                  {movie.review}
                </p>
              </div>
            )}

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
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
