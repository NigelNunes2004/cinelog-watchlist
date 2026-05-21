import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/topten")({
  component: TopTenPage,
  head: () => ({
    meta: [
      { title: "My Top 10 — CineLog" },
      { name: "description", content: "The ten films that define your taste — ranked, curated, and held up to the light." },
    ],
  }),
});

function TopTenPage() {
  const { movies, setTopTenRank, toggleTopTen } = useMovies();
  const topTen = movies
    .filter((m) => m.is_top_ten && m.top_ten_rank != null)
    .sort((a, b) => (a.top_ten_rank! - b.top_ten_rank!));

  const usedRanks = new Set(topTen.map((m) => m.top_ten_rank!));
  const candidates = movies.filter((m) => !m.is_top_ten);

  const handleAssign = (movieId: string, rankStr: string) => {
    if (!movieId || !rankStr) return;
    setTopTenRank(movieId, Number(rankStr));
  };

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Curated Canon</p>
        <h1 className="text-4xl sm:text-5xl font-semibold">My Top 10</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          The films you'd defend at any dinner party. Reorder freely.
        </p>
      </section>

      <div className="mb-8 p-5 rounded-xl border border-border bg-card/50">
        <h2 className="text-sm font-semibold mb-3">Assign a movie to a rank</h2>
        <AssignForm candidates={candidates} usedRanks={usedRanks} onAssign={handleAssign} />
      </div>

      {topTen.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No Top 10 entries yet. Add some from a movie's detail page.</div>
      ) : (
        <ol className="space-y-4">
          {topTen.map((m) => {
            const isOne = m.top_ten_rank === 1;
            return (
              <li
                key={m.id}
                className={`group flex items-stretch gap-5 rounded-2xl border transition-all overflow-hidden ${
                  isOne
                    ? "border-primary/60 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent shadow-2xl shadow-primary/20 p-6"
                    : "border-border bg-card p-4 hover:border-primary/40"
                }`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center font-bold ${
                    isOne
                      ? "w-24 text-7xl text-primary"
                      : "w-16 text-5xl text-muted-foreground/60"
                  }`}
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {m.top_ten_rank}
                </div>

                <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                  <div className={`overflow-hidden rounded-lg bg-muted ${isOne ? "w-32 h-48" : "w-20 h-30 sm:w-24 sm:h-36"}`}>
                    {m.poster_url ? (
                      <img src={m.poster_url} alt={m.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{m.title}</div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {isOne && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                      <Crown className="h-3.5 w-3.5" /> All-time favourite
                    </span>
                  )}
                  <h3 className={`font-semibold leading-tight truncate ${isOne ? "text-3xl" : "text-xl"}`} style={isOne ? { fontFamily: '"Playfair Display", serif' } : undefined}>
                    <Link to="/movies/$id" params={{ id: m.id }} className="hover:text-primary transition-colors">{m.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.genre} · {m.release_year}</p>
                  {m.rating != null && (
                    <p className={`mt-1 font-semibold ${isOne ? "text-primary text-lg" : "text-primary text-sm"}`}>
                      ★ {m.rating.toFixed(1)}
                    </p>
                  )}
                  {isOne && m.favourite_quote && (
                    <p className="italic text-muted-foreground mt-3 text-sm line-clamp-2">"{m.favourite_quote}"</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={m.top_ten_rank!}
                    onChange={(e) => setTopTenRank(m.id, Number(e.target.value))}
                    className="bg-secondary border border-border rounded-md px-2 py-1 text-xs"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                      <option key={r} value={r}>#{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleTopTen(m.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Layout>
  );
}

import { useState } from "react";

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
    setMovieId(""); setRank("");
  };

  const inputCls = "bg-secondary border border-border rounded-md px-3 py-2 text-sm";

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
      <select className={inputCls} value={movieId} onChange={(e) => setMovieId(e.target.value)}>
        <option value="">Pick a movie…</option>
        {candidates.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <select className={inputCls} value={rank} onChange={(e) => setRank(e.target.value)}>
        <option value="">Rank…</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
          <option key={r} value={r}>
            #{r} {usedRanks.has(r) ? "(will replace)" : ""}
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
