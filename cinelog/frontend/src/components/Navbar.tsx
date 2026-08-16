import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Film, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Watchlist" },
  { to: "/topten", label: "Top 10" },
  { to: "/stats", label: "Insights" },
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/12 ring-1 ring-primary/20">
            <Film className="h-4 w-4 text-primary" />
          </span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cine<span className="text-primary">Log</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 rounded-full bg-primary/80"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}

          {user && (
            <div className="ml-3 flex items-center gap-2 border-l border-border pl-3">
              <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
                {user.display_name ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
