import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { FilterBar, defaultFilters, type Filters } from "@/components/FilterBar";
import { MovieFormModal } from "@/components/MovieFormModal";
import { FadeItem, PageHeader, PageMotion } from "@/components/PageMotion";
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

  const watched = movies.filter((m) => m.status === "watched").length;
  const watching = movies.filter((m) => m.status === "watching").length;

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
        <FadeItem>
          <PageHeader
            eyebrow="Collection"
            title="Every film,"
            accent="catalogued."
            description={undefined}
            action={
              <button
                onClick={() => setAdding(true)}
                className="btn-amber inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" /> Add Movie
              </button>
            }
          />
          <div className="-mt-6 mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground">{movies.length}</strong> films
            </span>
            <span className="text-border">|</span>
            <span>
              <strong className="font-semibold text-foreground">{watched}</strong> watched
            </span>
            <span className="text-border">|</span>
            <span>
              <strong className="font-semibold text-foreground">{watching}</strong> in progress
            </span>
          </div>
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
            <div className="surface rounded-xl py-20 text-center text-muted-foreground">
              No movies match your filters.
            </div>
          </FadeItem>
        ) : (
          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.035 } },
            }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
          >
            {visible.map((m) => (
              <motion.div
                key={m.id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
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
