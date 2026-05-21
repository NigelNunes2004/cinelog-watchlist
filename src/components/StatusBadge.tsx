import type { MovieStatus } from "@/store/MoviesContext";

const styles: Record<MovieStatus, string> = {
  unwatched: "bg-muted text-muted-foreground border-border",
  watching: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  watched: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
};

const labels: Record<MovieStatus, string> = {
  unwatched: "Unwatched",
  watching: "Watching",
  watched: "Watched",
};

export function StatusBadge({ status }: { status: MovieStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
