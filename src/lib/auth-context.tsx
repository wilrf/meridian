'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user (getUser validates with server, getSession only reads local storage)
    supabase.auth.getUser()
      .then(({ data: { user }, error }) => {
        if (error) {
          console.error('Error getting user:', error)
          setUser(null)
          setSession(null)
        } else {
          setUser(user)
          // Also get session for token access
          return supabase.auth.getSession()
        }
      })
      .then((result) => {
        if (result) {
          setSession(result.data.session)
        }
      })
      .catch((error) => {
        console.error('Error initializing auth:', error)
        setUser(null)
        setSession(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
      signInWithGithub,
      signOut,
    }),
    [user, session, loading, signInWithGithub, signOut]
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
