import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, X } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { FadeItem, PageMotion } from "@/components/PageMotion";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/topten")({
  component: TopTenPage,
  head: () => ({
    meta: [
      { title: "My Top 10 — CineLog" },
      {
        name: "description",
        content:
          "The ten films that define your taste — ranked, curated, and held up to the light.",
      },
    ],
  }),
});

function TopTenPage() {
  const { movies, setTopTenRank, toggleTopTen } = useMovies();
  const topTen = movies
    .filter((m) => m.is_top_ten && m.top_ten_rank != null)
    .sort((a, b) => a.top_ten_rank! - b.top_ten_rank!);

  const usedRanks = new Set(topTen.map((m) => m.top_ten_rank!));
  const candidates = movies.filter((m) => !m.is_top_ten);

  const handleAssign = (movieId: string, rankStr: string) => {
    if (!movieId || !rankStr) return;
    setTopTenRank(Number(movieId), Number(rankStr));
  };

  return (
    <Layout>
      <PageMotion>
        <FadeItem className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Curated Canon
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
            My <span className="text-shimmer">Top 10</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The films you'd defend at any dinner party. Reorder freely.
          </p>
        </FadeItem>

        <FadeItem className="glass mb-8 rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Assign a movie to a rank</h2>
          <AssignForm candidates={candidates} usedRanks={usedRanks} onAssign={handleAssign} />
        </FadeItem>

        {topTen.length === 0 ? (
          <FadeItem>
            <div className="glass rounded-2xl py-20 text-center text-muted-foreground">
              No Top 10 entries yet. Add some from a movie's detail page.
            </div>
          </FadeItem>
        ) : (
          <ol className="space-y-4">
            {topTen.map((m, i) => {
              const isOne = m.top_ten_rank === 1;
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`group flex items-stretch gap-5 overflow-hidden rounded-2xl transition-shadow ${
                    isOne
                      ? "glass-strong glow-ring bg-gradient-to-r from-primary/20 via-primary/5 to-transparent p-6"
                      : "glass p-4 hover:shadow-[0_20px_40px_-24px_oklch(0.84_0.15_88_/_0.35)]"
                  }`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center font-bold ${
                      isOne ? "w-24 text-7xl text-primary" : "w-16 text-5xl text-muted-foreground/50"
                    }`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m.top_ten_rank}
                  </div>

                  <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                    <div
                      className={`overflow-hidden rounded-xl bg-muted ring-1 ring-white/10 ${
                        isOne ? "h-48 w-32" : "h-36 w-20 sm:w-24"
                      }`}
                    >
                      {m.poster_url ? (
                        <img
                          src={m.poster_url}
                          alt={m.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                          {m.title}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    {isOne && (
                      <span className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                        <Crown className="h-3.5 w-3.5" /> All-time favourite
                      </span>
                    )}
                    <h3
                      className={`truncate font-semibold leading-tight ${isOne ? "text-3xl" : "text-xl"}`}
                      style={isOne ? { fontFamily: "var(--font-display)" } : undefined}
                    >
                      <Link
                        to="/movies/$id"
                        params={{ id: m.id }}
                        className="transition-colors hover:text-primary"
                      >
                        {m.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {m.genre} · {m.release_year}
                    </p>
                    {m.rating != null && (
                      <p
                        className={`mt-1 font-semibold text-primary ${isOne ? "text-lg" : "text-sm"}`}
                      >
                        ★ {m.rating.toFixed(1)}
                      </p>
                    )}
                    {isOne && m.favourite_quote && (
                      <p className="mt-3 line-clamp-2 text-sm italic text-muted-foreground">
                        "{m.favourite_quote}"
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <select
                      value={m.top_ten_rank!}
                      onChange={(e) => setTopTenRank(m.id, Number(e.target.value))}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                        <option key={r} value={r}>
                          #{r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleTopTen(m.id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </PageMotion>
    </Layout>
  );
}

function AssignForm({
  candidates,
  usedRanks,
  onAssign,
}: {
  candidates: ReturnType<typeof useMovies>["movies"];
  usedRanks: Set<number>;
  onAssign: (id: string, rank: string) => void;
}) {
  const [movieId, setMovieId] = useState("");
  const [rank, setRank] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(movieId, rank);
    setMovieId("");
    setRank("");
  };

  const inputCls =
    "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm backdrop-blur-md";

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <select className={inputCls} value={movieId} onChange={(e) => setMovieId(e.target.value)}>
        <option value="">Pick a movie…</option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <select className={inputCls} value={rank} onChange={(e) => setRank(e.target.value)}>
        <option value="">Rank…</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
          <option key={r} value={r}>
            #{r} {usedRanks.has(r) ? "(will replace)" : ""}
          </option>
        ))}
      </select>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={!movieId || !rank}
        className="premium-btn rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        Assign
      </motion.button>
    </form>
  );
}
