import type { MovieStatus } from "@/store/MoviesContext";

const styles: Record<MovieStatus, string> = {
  unwatched: "bg-steel/15 text-steel border-steel/30",
  watching: "bg-teal/15 text-teal border-teal/35",
  watched: "bg-rose/15 text-rose border-rose/35",
};

const labels: Record<MovieStatus, string> = {
  unwatched: "Unwatched",
  watching: "Watching",
  watched: "Watched",
};

export function StatusBadge({ status }: { status: MovieStatus }) {
  return (
    <span className={`chip border ${styles[status]}`}>{labels[status]}</span>
  );
}
