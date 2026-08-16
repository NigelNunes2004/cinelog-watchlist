import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Film, Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/store/AuthContext";
import { AntigravityField } from "@/components/AntigravityField";
import { MagneticButton } from "@/components/PageMotion";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [{ title: "Sign in — CineLog" }],
  }),
});

type Mode = "login" | "signup";

function AuthPage() {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  if (loading || user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AntigravityField />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setSubmitting(false);
          return;
        }
        await signup(email, password, displayName || undefined);
      }
      navigate({ to: "/" });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AntigravityField />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 lg:flex-row lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-md text-center lg:mb-0 lg:text-left"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Your private cinema
          </motion.div>
          <h1 className="text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Every film,
            <br />
            <span className="text-shimmer">your story.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Track what you watch, rate what you love, and curate your personal Top 10 —
            in a watchlist that feels like a theatre lobby at midnight.
          </p>
          <div className="mt-10 hidden gap-8 text-sm lg:flex">
            <Stat label="Private" value="Per account" />
            <Stat label="Refresh" value="20 days" />
            <Stat label="Sync" value="Real-time" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="glass-strong relative overflow-hidden rounded-3xl p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30"
              >
                <Film className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  Cine<span className="text-primary">Log</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "login" ? "Welcome back" : "Start your watchlist"}
                </p>
              </div>
            </div>

            <div className="mb-6 flex rounded-xl bg-black/30 p-1 ring-1 ring-white/10">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className="relative flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-lg bg-primary shadow-lg shadow-primary/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      mode === m ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "login" ? "Sign in" : "Create account"}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Field icon={<User className="h-4 w-4" />} label="Display name">
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="How should we call you?"
                        className={inputCls}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field icon={<Mail className="h-4 w-4" />} label="Email">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </Field>

              <Field icon={<Lock className="h-4 w-4" />} label="Password">
                <input
                  type="password"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
                  className={inputCls}
                />
              </Field>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <MagneticButton
                type="submit"
                disabled={submitting}
                className="premium-btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-12px_oklch(0.84_0.15_88_/_0.65)] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : mode === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </MagneticButton>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sessions stay signed in for up to 20 days.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-primary/80">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm backdrop-blur-md transition focus:outline-none focus:ring-2 focus:ring-primary/40";
