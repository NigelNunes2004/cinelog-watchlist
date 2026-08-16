import type { MovieStatus } from "@/store/MoviesContext";

/* Same amber family — intensity steps only, no other hues */
const styles: Record<MovieStatus, string> = {
  unwatched: "bg-muted text-muted-foreground border-border",
  watching:
    "border-primary/30 text-primary bg-gradient-to-b from-primary/18 to-primary/8",
  watched:
    "border-primary/40 text-primary bg-gradient-to-b from-primary/28 to-primary/12",
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
