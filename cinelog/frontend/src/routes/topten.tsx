import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, X } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { FadeItem, PageHeader, PageMotion } from "@/components/PageMotion";
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
        <FadeItem>
          <PageHeader
            eyebrow="Canon"
            title="My"
            accent="Top 10"
            description="The films you'd defend at any dinner party. Reorder freely."
          />
        </FadeItem>

        <FadeItem className="surface mb-8 rounded-xl p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Assign a rank</h2>
          <AssignForm candidates={candidates} usedRanks={usedRanks} onAssign={handleAssign} />
        </FadeItem>

        {topTen.length === 0 ? (
          <FadeItem>
            <div className="surface rounded-xl py-20 text-center text-muted-foreground">
              No Top 10 entries yet. Add some from a movie's detail page.
            </div>
          </FadeItem>
        ) : (
          <ol className="space-y-3">
            {topTen.map((m, i) => {
              const isOne = m.top_ten_rank === 1;
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className={`flex items-stretch gap-4 overflow-hidden rounded-xl border transition-colors sm:gap-5 ${
                    isOne
                      ? "border-primary/35 bg-gradient-to-r from-primary/10 via-card to-transparent p-5"
                      : "surface p-4 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center font-semibold ${
                      isOne ? "w-16 text-5xl text-primary sm:w-20 sm:text-6xl" : "w-12 text-4xl text-muted-foreground/50"
                    }`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m.top_ten_rank}
                  </div>

                  <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                    <div
                      className={`overflow-hidden rounded-lg bg-muted ring-1 ring-border ${
                        isOne ? "h-40 w-28" : "h-32 w-20 sm:w-22"
                      }`}
                    >
                      {m.poster_url ? (
                        <img
                          src={m.poster_url}
                          alt={m.title}
                          className="h-full w-full object-cover"
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
                      <span className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        <Crown className="h-3.5 w-3.5" /> Favourite
                      </span>
                    )}
                    <h3
                      className={`truncate font-semibold leading-tight ${isOne ? "text-2xl sm:text-3xl" : "text-lg"}`}
                      style={isOne ? { fontFamily: "var(--font-display)" } : undefined}
                    >
                      <Link
                        to="/movies/$id"
                        params={{ id: m.id }}
                        className="hover:text-primary"
                      >
                        {m.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="text-primary">{m.genre}</span> · {m.release_year}
                    </p>
                    {m.rating != null && (
                      <p className="mt-1 text-sm font-semibold text-primary">★ {m.rating.toFixed(1)}</p>
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
                      className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                        <option key={r} value={r}>
                          #{r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleTopTen(m.id)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
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

  const inputCls = "bg-card border border-border rounded-md px-3 py-2 text-sm";

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
            #{r} {usedRanks.has(r) ? "(replace)" : ""}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!movieId || !rank}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        Assign
      </button>
    </form>
  );
}
