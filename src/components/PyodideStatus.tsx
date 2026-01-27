'use client'

import { usePyodide } from '@/lib/pyodide-context'

export default function PyodideStatus() {
  const { state } = usePyodide()

  // Only show status when actively loading or there's an error
  // Don't show anything for 'idle' (before user runs code) or 'ready'
  if (state.status === 'ready' || state.status === 'idle') {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`card shadow-elevated px-5 py-4 ${
          state.status === 'error'
            ? 'border-error bg-error-subtle'
            : 'border-[var(--border-default)]'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          {state.status === 'loading' && (
            <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {state.status === 'error' && (
            <div className="w-10 h-10 rounded-xl bg-error-subtle flex items-center justify-center">
              <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Content */}
          <div>
            <div className={`text-sm font-semibold ${
              state.status === 'error' ? 'text-error-strong' : 'text-[var(--text-primary)]'
            }`}>
              {state.status === 'loading'
                ? 'Loading Python Runtime'
                : 'Python Failed to Load'}
            </div>
            {state.loadingProgress && (
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {state.loadingProgress}
              </div>
            )}
            {state.error && (
              <div className="text-xs text-error mt-0.5">{state.error}</div>
            )}
          </div>
        </div>

        {/* Progress bar for loading */}
        {state.status === 'loading' && (
          <div className="mt-3 h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-pulse-soft w-2/3" />
          </div>
        )}
      </div>
    </div>
  )
}
