import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { initialMovies } from "@/mock/data";

export type MovieStatus = "unwatched" | "watching" | "watched";

export interface Movie {
  id: string;
  title: string;
  genre: string;
  release_year: number;
  poster_url: string | null;
  status: MovieStatus;
  rating: number | null;
  review: string | null;
  favourite_quote: string | null;
  rewatch_count: number;
  is_top_ten: boolean;
  top_ten_rank: number | null;
  created_at: string;
}

interface Ctx {
  movies: Movie[];
  getMovie: (id: string) => Movie | undefined;
  addMovie: (m: Omit<Movie, "id" | "created_at">) => void;
  updateMovie: (id: string, patch: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  toggleTopTen: (id: string) => void;
  setTopTenRank: (id: string, rank: number | null) => void;
  incrementRewatch: (id: string) => void;
}

const MoviesContext = createContext<Ctx | null>(null);

export function MoviesProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies as Movie[]);

  const value = useMemo<Ctx>(() => ({
    movies,
    getMovie: (id) => movies.find((m) => m.id === id),
    addMovie: (m) => {
      const newMovie: Movie = {
        ...m,
        id: String(Date.now()),
        created_at: new Date().toISOString().slice(0, 10),
      };
      setMovies((prev) => [newMovie, ...prev]);
    },
    updateMovie: (id, patch) => {
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    deleteMovie: (id) => {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    },
    toggleTopTen: (id) => {
      setMovies((prev) => {
        const target = prev.find((m) => m.id === id);
        if (!target) return prev;
        if (target.is_top_ten) {
          return prev.map((m) => (m.id === id ? { ...m, is_top_ten: false, top_ten_rank: null } : m));
        }
        const usedRanks = new Set(prev.filter((m) => m.is_top_ten && m.top_ten_rank).map((m) => m.top_ten_rank!));
        let nextRank: number | null = null;
        for (let i = 1; i <= 10; i++) if (!usedRanks.has(i)) { nextRank = i; break; }
        return prev.map((m) => (m.id === id ? { ...m, is_top_ten: true, top_ten_rank: nextRank } : m));
      });
    },
    setTopTenRank: (id, rank) => {
      setMovies((prev) => prev.map((m) => {
        if (m.id === id) return { ...m, is_top_ten: rank !== null, top_ten_rank: rank };
        // bump any movie currently holding that rank
        if (rank !== null && m.top_ten_rank === rank) return { ...m, top_ten_rank: null, is_top_ten: false };
        return m;
      }));
    },
    incrementRewatch: (id) => {
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, rewatch_count: m.rewatch_count + 1 } : m)));
    },
  }), [movies]);

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}

export function useMovies() {
  const ctx = useContext(MoviesContext);
  if (!ctx) throw new Error("useMovies must be used inside MoviesProvider");
  return ctx;
}
