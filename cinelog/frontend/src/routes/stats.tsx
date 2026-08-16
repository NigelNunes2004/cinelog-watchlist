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
import { FadeItem, PageMotion } from "@/components/PageMotion";
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
  "oklch(0.84 0.15 88)",
  "oklch(0.65 0.18 280)",
  "oklch(0.7 0.16 162)",
  "oklch(0.72 0.18 30)",
  "oklch(0.7 0.2 320)",
  "oklch(0.78 0.15 200)",
  "oklch(0.68 0.2 15)",
  "oklch(0.75 0.12 130)",
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

  return (
    <Layout>
      <PageMotion>
        <FadeItem className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Insights
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
            Your Viewing <span className="text-shimmer">Story</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A panoramic look at what you've watched, loved, and revisited.
          </p>
        </FadeItem>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: <Film />, label: "Total Movies", value: String(movies.length) },
            { icon: <Eye />, label: "Total Watched", value: String(stats.watched.length) },
            {
              icon: <Star />,
              label: "Average Rating",
              value: stats.avg ? stats.avg.toFixed(1) : "—",
            },
            {
              icon: <RotateCcw />,
              label: "Most Rewatched",
              value: stats.mostRewatched ? stats.mostRewatched.title : "—",
              sub: stats.mostRewatched ? `${stats.mostRewatched.rewatch_count}×` : undefined,
            },
          ].map((card, i) => (
            <FadeItem key={card.label}>
              <StatCard {...card} delay={i} />
            </FadeItem>
          ))}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <FadeItem>
            <ChartCard title="Rating Distribution">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.ratingDist}>
                  <XAxis dataKey="rating" stroke="oklch(0.7 0.02 260)" />
                  <YAxis allowDecimals={false} stroke="oklch(0.7 0.02 260)" />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.03 265 / 0.95)",
                      border: "1px solid oklch(0.4 0.05 265 / 0.4)",
                      borderRadius: 12,
                    }}
                    cursor={{ fill: "oklch(0.28 0.04 260 / 0.4)" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.84 0.15 88)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </FadeItem>

          <FadeItem>
            <ChartCard title="Genre Breakdown">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.genreData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {stats.genreData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={GENRE_COLORS[i % GENRE_COLORS.length]}
                        stroke="oklch(0.09 0.02 265)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.03 265 / 0.95)",
                      border: "1px solid oklch(0.4 0.05 265 / 0.4)",
                      borderRadius: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </FadeItem>
        </div>

        <FadeItem>
          <ChartCard title="Top 5 Rated">
            {stats.top5.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rate some movies to see your top 5.</p>
            ) : (
              <ol className="space-y-3">
                {stats.top5.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span
                      className="w-8 text-center text-3xl font-bold text-muted-foreground/40"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {i + 1}
                    </span>
                    <Link to="/movies/$id" params={{ id: m.id }} className="shrink-0">
                      <div className="h-16 w-12 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10">
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
                        className="block truncate font-semibold hover:text-primary"
                      >
                        {m.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {m.genre} · {m.release_year}
                      </p>
                    </div>
                    <span className="font-bold text-primary">★ {m.rating!.toFixed(1)}</span>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass group rounded-2xl p-5 transition"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary transition group-hover:scale-110 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        {label}
      </div>
      <div
        className="mt-3 truncate text-2xl font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-primary">{sub}</div>}
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}
