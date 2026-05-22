import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { FilterBar, defaultFilters, type Filters } from "@/components/FilterBar";
import { MovieFormModal } from "@/components/MovieFormModal";
import { useMovies } from "@/store/MoviesContext";

export const Route = createFileRoute("/")({
  component: WatchlistPage,
  head: () => ({
    meta: [
      { title: "Watchlist — CineLog" },
      { name: "description", content: "Your full movie watchlist — filter by genre, status, and sort by rating, release year, or date added." },
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
      let av: any = a[k];
      let bv: any = b[k];
      if (k === "rating") { av = av ?? -1; bv = bv ?? -1; }
      if (typeof av === "string") return filters.order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return filters.order === "asc" ? (av - bv) : (bv - av);
    });
    return list;
  }, [movies, filters]);

  return (
    <Layout>
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Your Watchlist</p>
          <h1 className="text-4xl sm:text-5xl font-semibold">Every film, catalogued.</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {movies.length} films tracked · {movies.filter((m) => m.status === "watched").length} watched · {movies.filter((m) => m.status === "watching").length} in progress
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add Movie
        </button>
      </section>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No movies match your filters.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {visible.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}

      {adding && <MovieFormModal onClose={() => setAdding(false)} />}
    </Layout>
  );
}
