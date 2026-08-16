import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Film, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Watchlist" },
  { to: "/topten", label: "My Top 10" },
  { to: "/stats", label: "Stats" },
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
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/5 bg-background/40 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: 18, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30"
          >
            <Film className="h-5 w-5 text-primary" />
          </motion.span>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Cine<span className="text-shimmer">Log</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1.5">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-primary/10 ring-1 ring-primary/25"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
          {user && <UserMenu user={user} onLogout={handleLogout} />}
        </nav>
      </div>
    </motion.header>
  );
}

function UserMenu({
  user,
  onLogout,
}: {
  user: { display_name: string | null; email: string };
  onLogout: () => void;
}) {
  return (
    <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
      <div className="hidden items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-white/10 sm:flex">
        <User className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[120px] truncate">{user.display_name ?? user.email}</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onLogout}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </motion.button>
    </div>
  );
}
