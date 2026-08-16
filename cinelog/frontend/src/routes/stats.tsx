import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Film, Eye, Star, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { FadeItem, PageHeader, PageMotion } from "@/components/PageMotion";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "Stats & Insights — CineLog" },
      {
        name: "description",
        content:
          "Dashboards for your viewing habits: rating distribution, genre breakdown, and your most-rewatched films.",
      },
    ],
  }),
});

const GENRE_COLORS = [
  "oklch(0.88 0.11 85)",
  "oklch(0.8 0.125 82)",
  "oklch(0.72 0.115 78)",
  "oklch(0.64 0.1 75)",
  "oklch(0.56 0.085 72)",
  "oklch(0.48 0.07 68)",
  "oklch(0.42 0.055 65)",
  "oklch(0.36 0.04 62)",
];

function StatsPage() {
  const { movies } = useMovies();

  const stats = useMemo(() => {
    const watched = movies.filter((m) => m.status === "watched");
    const rated = watched.filter((m) => m.rating != null);
    const avg = rated.length
      ? rated.reduce((s, m) => s + (m.rating || 0), 0) / rated.length
      : 0;
    const mostRewatched = [...movies].sort((a, b) => b.rewatch_count - a.rewatch_count)[0];

    const ratingDist = Array.from({ length: 10 }, (_, i) => {
      const r = i + 1;
      return { rating: r, count: rated.filter((m) => Math.round(m.rating!) === r).length };
    });

    const genreMap = new Map<string, number>();
    movies.forEach((m) => genreMap.set(m.genre, (genreMap.get(m.genre) || 0) + 1));
    const genreData = Array.from(genreMap.entries()).map(([name, value]) => ({ name, value }));
    const top5 = [...rated].sort((a, b) => b.rating! - a.rating!).slice(0, 5);

    return { watched, avg, mostRewatched, ratingDist, genreData, top5 };
  }, [movies]);

  const cards = [
    {
      icon: <Film className="h-4 w-4" />,
      label: "Total Movies",
      value: String(movies.length),
      intensity: "high" as const,
    },
    {
      icon: <Eye className="h-4 w-4" />,
      label: "Watched",
      value: String(stats.watched.length),
      intensity: "mid" as const,
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "Avg Rating",
      value: stats.avg ? stats.avg.toFixed(1) : "—",
      intensity: "high" as const,
    },
    {
      icon: <RotateCcw className="h-4 w-4" />,
      label: "Most Rewatched",
      value: stats.mostRewatched ? stats.mostRewatched.title : "—",
      sub: stats.mostRewatched ? `${stats.mostRewatched.rewatch_count}×` : undefined,
      intensity: "low" as const,
    },
  ];

  return (
    <Layout>
      <PageMotion>
        <FadeItem>
          <PageHeader
            eyebrow="Analytics"
            title="Your viewing"
            accent="story"
            description="Habits, favourites, and patterns across your collection."
          />
        </FadeItem>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <FadeItem key={card.label}>
              <StatCard {...card} />
            </FadeItem>
          ))}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <FadeItem>
            <ChartCard title="Rating distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.ratingDist}>
                  <XAxis dataKey="rating" stroke="oklch(0.55 0.02 70)" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="oklch(0.55 0.02 70)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.17 0.018 60)",
                      border: "1px solid oklch(0.35 0.025 70)",
                      borderRadius: 8,
                    }}
                    cursor={{ fill: "oklch(0.8 0.125 82 / 0.08)" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.8 0.125 82)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </FadeItem>

          <FadeItem>
            <ChartCard title="Genre breakdown">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.genreData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={96}
                    paddingAngle={2}
                  >
                    {stats.genreData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={GENRE_COLORS[i % GENRE_COLORS.length]}
                        stroke="oklch(0.13 0.016 60)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.17 0.018 60)",
                      border: "1px solid oklch(0.35 0.025 70)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </FadeItem>
        </div>

        <FadeItem>
          <ChartCard title="Top 5 rated">
            {stats.top5.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rate some movies to see your top 5.</p>
            ) : (
              <ol className="space-y-2">
                {stats.top5.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className="w-7 text-center text-2xl font-semibold text-muted-foreground/40"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {i + 1}
                    </span>
                    <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                      <div className="h-14 w-10 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                        {m.poster_url && (
                          <img
                            src={m.poster_url}
                            alt={m.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/movies/$id"
                        params={{ id: m.id }}
                        className="block truncate text-sm font-semibold hover:text-primary"
                      >
                        {m.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {m.genre} · {m.release_year}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">★ {m.rating!.toFixed(1)}</span>
                  </motion.li>
                ))}
              </ol>
            )}
          </ChartCard>
        </FadeItem>
      </PageMotion>
    </Layout>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  intensity,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  intensity: "high" | "mid" | "low";
}) {
  const tones = {
    high: "text-primary icon-amber",
    mid: "text-primary bg-gradient-to-b from-primary/20 to-primary/8 ring-1 ring-primary/25",
    low: "text-primary/80 bg-gradient-to-b from-primary/12 to-primary/5 ring-1 ring-primary/15",
  };

  return (
    <div className="surface rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className={`rounded-md p-1.5 ${tones[intensity]}`}>{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div
        className="mt-3 truncate text-xl font-semibold sm:text-2xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs font-medium text-primary">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface rounded-xl p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-3 w-1 rounded-full grad-amber" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
