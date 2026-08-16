import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { FilterBar, defaultFilters, type Filters } from "@/components/FilterBar";
import { MovieFormModal } from "@/components/MovieFormModal";
import { FadeItem, MagneticButton, PageMotion } from "@/components/PageMotion";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/")({
  component: WatchlistPage,
  head: () => ({
    meta: [
      { title: "Watchlist — CineLog" },
      {
        name: "description",
        content:
          "Your full movie watchlist — filter by genre, status, and sort by rating, release year, or date added.",
      },
    ],
  }),
});

function WatchlistPage() {
  const { movies } = useMovies();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [adding, setAdding] = useState(false);

  const visible = useMemo(() => {
    let list = [...movies];
    if (filters.genre !== "all") list = list.filter((m) => m.genre === filters.genre);
    if (filters.status !== "all") list = list.filter((m) => m.status === filters.status);
    list.sort((a, b) => {
      const k = filters.sortBy;
      let av: string | number | null = a[k];
      let bv: string | number | null = b[k];
      if (k === "rating") {
        av = av ?? -1;
        bv = bv ?? -1;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return filters.order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return filters.order === "asc"
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });
    return list;
  }, [movies, filters]);

  return (
    <Layout>
      <PageMotion>
        <FadeItem className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Your Watchlist
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Every film, <span className="text-shimmer">catalogued.</span>
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              <span className="text-foreground/90">{movies.length}</span> films ·{" "}
              <span className="text-foreground/90">
                {movies.filter((m) => m.status === "watched").length}
              </span>{" "}
              watched ·{" "}
              <span className="text-foreground/90">
                {movies.filter((m) => m.status === "watching").length}
              </span>{" "}
              in progress
            </p>
          </div>
          <MagneticButton
            onClick={() => setAdding(true)}
            className="premium-btn inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_40px_-12px_oklch(0.84_0.15_88_/_0.7)] transition"
          >
            <Plus className="h-4 w-4" /> Add Movie
          </MagneticButton>
        </FadeItem>

        <FadeItem className="mb-8">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(defaultFilters)}
          />
        </FadeItem>

        {visible.length === 0 ? (
          <FadeItem>
            <div className="glass rounded-2xl py-24 text-center text-muted-foreground">
              No movies match your filters.
            </div>
          </FadeItem>
        ) : (
          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.045 } },
            }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
          >
            {visible.map((m) => (
              <motion.div
                key={m.id}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.96 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <MovieCard movie={m} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </PageMotion>

      {adding && <MovieFormModal onClose={() => setAdding(false)} />}
    </Layout>
  );
}
