import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";

const links = [
  { to: "/", label: "Watchlist" },
  { to: "/topten", label: "My Top 10" },
  { to: "/stats", label: "Stats & Insights" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            Cine<span className="text-primary">Log</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors data-[status=active]:text-primary data-[status=active]:bg-primary/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
