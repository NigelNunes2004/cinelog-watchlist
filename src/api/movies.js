// Stubbed API. Replace with real Axios calls later.
// All functions return data synchronously from the in-memory store.
import { initialMovies } from "@/mock/data";

let _store = [...initialMovies];

export const listMovies = () => _store;
export const getMovie = (id) => _store.find((m) => m.id === id) || null;
export const createMovie = (movie) => {
  const m = { ...movie, id: String(Date.now()), created_at: new Date().toISOString().slice(0, 10) };
  _store = [m, ..._store];
  return m;
};
export const updateMovie = (id, patch) => {
  _store = _store.map((m) => (m.id === id ? { ...m, ...patch } : m));
  return getMovie(id);
};
export const deleteMovie = (id) => {
  _store = _store.filter((m) => m.id !== id);
};
