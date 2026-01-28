'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Suppress AuthSessionMissingError - it's expected when not logged in
    // but Supabase logs it internally before we can catch it
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      const message = args[0]
      if (
        typeof message === 'string' &&
        message.includes('AuthSessionMissingError')
      ) {
        return // Suppress this specific error
      }
      originalError.apply(console, args)
    }

    // Get initial session explicitly (don't rely solely on onAuthStateChange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      // Even on error, stop showing loading state
      setLoading(false)
    }).finally(() => {
      console.error = originalError
    })

    // Subscribe to future auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setError(null)
      // Don't set loading here since initial load is handled above
    })

    return () => {
      console.error = originalError // Ensure restoration on cleanup
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGithub = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error signing in with GitHub:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      error,
      signInWithGithub,
      signOut,
    }),
    [user, session, loading, error, signInWithGithub, signOut]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
