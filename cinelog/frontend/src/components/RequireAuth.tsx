import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Film } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { AntigravityField } from "@/components/AntigravityField";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <AntigravityField />
        <div className="relative z-10 flex flex-col items-center">
          <Film className="mb-4 h-8 w-8 text-primary/70" />
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your cinema…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
