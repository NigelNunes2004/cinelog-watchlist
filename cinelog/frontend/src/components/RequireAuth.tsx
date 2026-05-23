import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Film } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { MoviesProvider } from '@/store/MoviesContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/auth' })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <motionScreen>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your cinema…</p>
      </motionScreen>
    )
  }

  if (!user) return null

  return <MoviesProvider>{children}</MoviesProvider>
}

function motionScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Film className="mb-4 h-10 w-10 text-primary/60" />
      {children}
    </div>
  )
}
