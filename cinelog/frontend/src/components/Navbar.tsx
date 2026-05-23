import { Link, useNavigate } from "@tanstack/react-router";
import { Film, LogOut, User } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Watchlist" },
  { to: "/topten", label: "My Top 10" },
  { to: "/stats", label: "Stats & Insights" },
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/auth" });
  };

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
          {user && (
            <UserMenu user={user} onLogout={handleLogout} />
          )}
        </nav>
      </div>
    </header>
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
    <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <User className="h-3.5 w-3.5" />
        <span className="max-w-[120px] truncate">{user.display_name ?? user.email}</span>
      </div>
      <button
        onClick={onLogout}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}
