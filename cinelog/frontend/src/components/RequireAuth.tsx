import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Film } from "lucide-react";
import { motion } from "motion/react";
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Film className="mb-4 h-10 w-10 text-primary/70" />
          </motion.div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your cinema…</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
