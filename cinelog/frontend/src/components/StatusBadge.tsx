import type { MovieStatus } from "@/store/MoviesContext";

const styles: Record<MovieStatus, string> = {
  unwatched: "bg-white/5 text-muted-foreground border-white/15",
  watching: "bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_16px_-4px_oklch(0.8_0.15_85_/_0.4)]",
  watched: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_16px_-4px_oklch(0.75_0.15_160_/_0.35)]",
};

const labels: Record<MovieStatus, string> = {
  unwatched: "Unwatched",
  watching: "Watching",
  watched: "Watched",
};

export function StatusBadge({ status }: { status: MovieStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
