// @ts-expect-error - JS mock data
import { GENRES } from "@/mock/data";
import { motion } from "motion/react";

export type SortKey = "title" | "rating" | "release_year" | "created_at";
export type Order = "asc" | "desc";

export interface Filters {
  genre: string;
  status: string;
  sortBy: SortKey;
  order: Order;
}

export const defaultFilters: Filters = {
  genre: "all",
  status: "all",
  sortBy: "created_at",
  order: "desc",
};

export function FilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  const sel =
    "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition";
  return (
    <motion.div
      layout
      className="glass flex flex-wrap items-end gap-3 rounded-2xl p-4"
    >
      <Group label="Genre">
        <select
          className={sel}
          value={filters.genre}
          onChange={(e) => onChange({ ...filters, genre: e.target.value })}
        >
          <option value="all">All genres</option>
          {(GENRES as string[]).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Group>
      <Group label="Status">
        <select
          className={sel}
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="all">All statuses</option>
          <option value="unwatched">Unwatched</option>
          <option value="watching">Watching</option>
          <option value="watched">Watched</option>
        </select>
      </Group>
      <Group label="Sort by">
        <select
          className={sel}
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as SortKey })
          }
        >
          <option value="created_at">Date added</option>
          <option value="title">Title</option>
          <option value="rating">Rating</option>
          <option value="release_year">Release year</option>
        </select>
      </Group>
      <Group label="Order">
        <select
          className={sel}
          value={filters.order}
          onChange={(e) =>
            onChange({ ...filters, order: e.target.value as Order })
          }
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </Group>
      <button
        onClick={onClear}
        className="ml-auto rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-primary"
      >
        Clear filters
      </button>
    </motion.div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
