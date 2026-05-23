import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, FormEvent, useEffect } from 'react'
import { Film, Mail, Lock, User, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
  head: () => ({
    meta: [{ title: 'Sign in — CineLog' }],
  }),
})

type Mode = 'login' | 'signup'

function AuthPage() {
  const { user, loading, login, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/' })
    }
  }, [loading, user, navigate])

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (password.length < 8) {
          setError('Password must be at least 8 characters.')
          setSubmitting(false)
          return
        }
        await signup(email, password, displayName || undefined)
      }
      navigate({ to: '/' })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail
      setError(typeof detail === 'string' ? detail : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.35_0.08_85_/_0.25),transparent_55%)]" />
      <BackgroundGlow />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 lg:flex-row lg:gap-16">
        <BrandPanel />

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <AuthCardHeader mode={mode} />

            <div className="mb-6 flex rounded-lg bg-secondary/60 p-1">
              {(['login', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError(null)
                  }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Field icon={<User className="h-4 w-4" />} label="Display name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we call you?"
                    className={inputCls}
                  />
                </Field>
              )}

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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  className={inputCls}
                />
              </Field>

              {error && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : mode === 'login' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sessions stay signed in for up to 20 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <div className="mb-10 max-w-md text-center lg:mb-0 lg:text-left">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Your private cinema
      </div>
      <h1
        className="text-5xl font-semibold leading-tight sm:text-6xl"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        Every film,
        <br />
        <span className="text-primary">your story.</span>
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Track what you watch, rate what you love, and curate your personal Top 10 —
        all in your own private watchlist.
      </p>
      <StatsRow />
    </div>
  )
}

function AuthCardHeader({ mode }: { mode: Mode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
        <Film className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-lg font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
          Cine<span className="text-primary">Log</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {mode === 'login' ? 'Welcome back' : 'Start your watchlist'}
        </p>
      </div>
    </div>
  )
}

function StatsRow() {
  return (
    <div className="mt-8 hidden gap-6 text-sm text-muted-foreground lg:flex">
      <Stat label="Private" value="Per account" />
      <Stat label="Refresh" value="20 days" />
      <Stat label="Sync" value="Real-time" />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-primary/80">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
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
  )
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
    </>
  )
}

const inputCls =
  'w-full rounded-lg border border-border bg-secondary/50 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition'
