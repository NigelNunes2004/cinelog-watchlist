import type { MovieStatus } from "@/store/MoviesContext";

const styles: Record<MovieStatus, string> = {
  unwatched: "bg-muted text-muted-foreground border-border",
  watching: "bg-primary/10 text-primary border-primary/25",
  watched: "bg-secondary text-foreground/80 border-border",
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
