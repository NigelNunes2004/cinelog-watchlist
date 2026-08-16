import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { Film, Mail, Lock, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/store/AuthContext";
import { AntigravityField } from "@/components/AntigravityField";

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
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  if (loading || user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AntigravityField />
        <Loader2 className="relative z-10 h-7 w-7 animate-spin text-primary" />
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

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="hidden lg:block"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Private cinema
            </p>
          </div>
          <h1 className="text-5xl font-medium leading-[1.05] xl:text-6xl">
            Every film,
            <br />
            <span className="italic text-primary/90">your story.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Rate, revisit, and rank the movies that stay with you — in a space built for
            collectors, not checklists.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Meta label="Private" value="Per account" />
            <Meta label="Refresh" value="20 days" />
            <Meta label="Sync" value="Real-time" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <div className="surface-raised rounded-2xl p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-border">
                <Film className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  Cine<span className="text-primary">Log</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`relative rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-md bg-card shadow-sm ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {m === "login" ? "Sign in" : "Sign up"}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
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
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
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
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Sessions stay active for up to 20 days.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
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
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30";
