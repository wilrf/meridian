'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function AuthButton() {
  const { user, loading, signInWithGithub, signOut } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showDropdown) {
      setShowDropdown(false)
      buttonRef.current?.focus()
    }
  }, [showDropdown])

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDropdown, handleKeyDown])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGithub()
    } catch {
      // Error already logged in auth-context
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    setShowDropdown(false)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-subtle)]">
        <div className="w-6 h-6 rounded-full bg-[var(--border-default)] animate-pulse" />
        <span className="text-sm text-[var(--text-muted)]">Loading...</span>
      </div>
    )
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const name = (user.user_metadata?.full_name as string | undefined) ??
                 (user.user_metadata?.user_name as string | undefined) ??
                 'User'

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="menu"
          aria-label={`User menu for ${name}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors w-full"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-[var(--text-secondary)] truncate flex-1 text-left">
            {name}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
              aria-hidden="true"
            />
            <div
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg z-20 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                <p className="text-sm text-[var(--text-primary)] truncate">{user.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="w-full px-3 py-2 text-sm text-left text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-subtle)] transition-colors w-full disabled:opacity-50"
    >
      <svg className="w-5 h-5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span className="text-sm text-[var(--text-secondary)]">
        {isSigningIn ? 'Signing in...' : 'Sign in with GitHub'}
      </span>
    </button>
  )
}
