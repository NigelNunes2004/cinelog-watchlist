import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as api from "@/api/movies";
import { useAuth } from "@/store/AuthContext";

export type MovieStatus = "unwatched" | "watching" | "watched";

export interface Movie {
  id: number;
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

export interface StatsData {
  total_movies: number;
  total_watched: number;
  average_rating: number | null;
  most_rewatched: string | null;
  genre_breakdown: { genre: string; count: number }[];
  rating_distribution: { rating: number; count: number }[];
}

interface Ctx {
  movies: Movie[];
  loading: boolean;
  stats: StatsData | null;
  getMovie: (id: number) => Movie | undefined;
  addMovie: (m: Omit<Movie, "id" | "created_at">) => Promise<void>;
  updateMovie: (id: number, patch: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;
  toggleTopTen: (id: number) => Promise<void>;
  setTopTenRank: (id: number, rank: number | null) => Promise<void>;
  incrementRewatch: (id: number) => Promise<void>;
  refreshMovies: () => Promise<void>;
}

const MoviesContext = createContext<Ctx | null>(null);

export function MoviesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);

  const refreshMovies = async () => {
    try {
      setLoading(true);
      const data = await api.getMovies();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setMovies([]);
      setStats(null);
      setLoading(false);
      return;
    }

    refreshMovies();
    fetchStats();
  }, [user?.id, authLoading]);

  const getMovie = (id: number | string) => movies.find((m) => m.id === Number(id));

  const addMovie = async (m: Omit<Movie, "id" | "created_at">) => {
    await api.createMovie(m);
    await refreshMovies();
    await fetchStats();
  };

  const updateMovie = async (id: number, patch: Partial<Movie>) => {
    await api.updateMovie(id, patch);
    await refreshMovies();
    await fetchStats();
  };

  const deleteMovie = async (id: number) => {
    await api.deleteMovie(id);
    await refreshMovies();
    await fetchStats();
  };

  const toggleTopTen = async (id: number) => {
    const movie = movies.find((m) => m.id === id);
    if (!movie) return;
    if (movie.is_top_ten) {
      await api.removeFromTopTen(id);
    } else {
      const usedRanks = new Set(
        movies.filter((m) => m.is_top_ten && m.top_ten_rank).map((m) => m.top_ten_rank!)
      );
      let nextRank: number | null = null;
      for (let i = 1; i <= 10; i++) {
        if (!usedRanks.has(i)) { nextRank = i; break; }
      }
      const currentTopTen = movies
        .filter((m) => m.is_top_ten && m.top_ten_rank)
        .map((m) => ({ movie_id: m.id, rank: m.top_ten_rank! }));
      if (nextRank) {
        await api.updateTopTen([...currentTopTen, { movie_id: id, rank: nextRank }]);
      }
    }
    await refreshMovies();
    await fetchStats();
  };

  const setTopTenRank = async (id: number, rank: number | null) => {
    if (rank === null) {
      await api.removeFromTopTen(id);
    } else {
      const currentTopTen = movies
        .filter((m) => m.is_top_ten && m.top_ten_rank && m.id !== id)
        .map((m) => ({ movie_id: m.id, rank: m.top_ten_rank! }));
      await api.updateTopTen([...currentTopTen, { movie_id: id, rank }]);
    }
    await refreshMovies();
    await fetchStats();
  };

  const incrementRewatch = async (id: number) => {
    const movie = movies.find((m) => m.id === id);
    if (!movie) return;
    await api.updateMovie(id, { rewatch_count: movie.rewatch_count + 1 });
    await refreshMovies();
    await fetchStats();
  };

  return (
    <MoviesContext.Provider value={{
      movies,
      loading,
      stats,
      getMovie,
      addMovie,
      updateMovie,
      deleteMovie,
      toggleTopTen,
      setTopTenRank,
      incrementRewatch,
      refreshMovies,
    }}>
      {children}
    </MoviesContext.Provider>
  );
}

export function useMovies() {
  const ctx = useContext(MoviesContext);
  if (!ctx) throw new Error("useMovies must be used inside MoviesProvider");
  return ctx;
}
