import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Film, Eye, Star, RotateCcw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Layout } from "@/components/Layout";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "Stats & Insights — CineLog" },
      { name: "description", content: "Dashboards for your viewing habits: rating distribution, genre breakdown, and your most-rewatched films." },
    ],
  }),
});

const GENRE_COLORS = [
  "oklch(0.82 0.14 85)", "oklch(0.65 0.18 265)", "oklch(0.7 0.16 162)",
  "oklch(0.72 0.18 30)", "oklch(0.7 0.2 320)", "oklch(0.78 0.15 200)",
  "oklch(0.68 0.2 15)", "oklch(0.75 0.12 130)", "oklch(0.7 0.17 290)",
  "oklch(0.78 0.15 60)", "oklch(0.72 0.16 220)", "oklch(0.7 0.18 100)",
];

function StatsPage() {
  const { movies } = useMovies();

  const stats = useMemo(() => {
    const watched = movies.filter((m) => m.status === "watched");
    const rated = watched.filter((m) => m.rating != null);
    const avg = rated.length ? rated.reduce((s, m) => s + (m.rating || 0), 0) / rated.length : 0;
    const mostRewatched = [...movies].sort((a, b) => b.rewatch_count - a.rewatch_count)[0];

    const ratingDist = Array.from({ length: 10 }, (_, i) => {
      const r = i + 1;
      return { rating: r, count: rated.filter((m) => Math.round(m.rating!) === r).length };
    });

    const genreMap = new Map<string, number>();
    movies.forEach((m) => genreMap.set(m.genre, (genreMap.get(m.genre) || 0) + 1));
    const genreData = Array.from(genreMap.entries()).map(([name, value]) => ({ name, value }));

    const top5 = [...rated].sort((a, b) => (b.rating! - a.rating!)).slice(0, 5);

    return { watched, avg, mostRewatched, ratingDist, genreData, top5 };
  }, [movies]);

  return (
    <Layout>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Insights</p>
        <h1 className="text-4xl sm:text-5xl font-semibold">Your Viewing Story</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">A panoramic look at what you've watched, loved, and revisited.</p>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Film />} label="Total Movies" value={String(movies.length)} />
        <StatCard icon={<Eye />} label="Total Watched" value={String(stats.watched.length)} />
        <StatCard icon={<Star />} label="Average Rating" value={stats.avg ? stats.avg.toFixed(1) : "—"} />
        <StatCard
          icon={<RotateCcw />}
          label="Most Rewatched"
          value={stats.mostRewatched ? `${stats.mostRewatched.title}` : "—"}
          sub={stats.mostRewatched ? `${stats.mostRewatched.rewatch_count}×` : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Rating Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.ratingDist}>
              <XAxis dataKey="rating" stroke="oklch(0.7 0.02 260)" />
              <YAxis allowDecimals={false} stroke="oklch(0.7 0.02 260)" />
              <Tooltip
                contentStyle={{ background: "oklch(0.21 0.022 260)", border: "1px solid oklch(0.3 0.03 260)", borderRadius: 8 }}
                cursor={{ fill: "oklch(0.28 0.04 260 / 0.4)" }}
              />
              <Bar dataKey="count" fill="oklch(0.82 0.14 85)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Genre Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.genreData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {stats.genreData.map((_, i) => (
                  <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} stroke="oklch(0.16 0.018 260)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "oklch(0.21 0.022 260)", border: "1px solid oklch(0.3 0.03 260)", borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Top 5 Rated">
        {stats.top5.length === 0 ? (
          <p className="text-muted-foreground text-sm">Rate some movies to see your top 5.</p>
        ) : (
          <ol className="space-y-3">
            {stats.top5.map((m, i) => (
              <li key={m.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <span className="text-3xl font-bold text-muted-foreground/50 w-8 text-center" style={{ fontFamily: '"Playfair Display", serif' }}>{i + 1}</span>
                <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                  <div className="w-12 h-16 overflow-hidden rounded-md bg-muted">
                    {m.poster_url && <img src={m.poster_url} alt={m.title} className="h-full w-full object-cover" />}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to="/movies/$id" params={{ id: m.id }} className="font-semibold hover:text-primary truncate block">{m.title}</Link>
                  <p className="text-xs text-muted-foreground">{m.genre} · {m.release_year}</p>
                </div>
                <span className="text-primary font-bold">★ {m.rating!.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        )}
      </ChartCard>
    </Layout>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
        <span className="text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold truncate" style={{ fontFamily: '"Playfair Display", serif' }}>{value}</div>
      {sub && <div className="text-xs text-primary mt-1">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
