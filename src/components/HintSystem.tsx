'use client'

import { useState } from 'react'

interface HintSystemProps {
  hints: string[]
  exerciseId: string
}

export default function HintSystem({ hints, exerciseId: _exerciseId }: HintSystemProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  if (hints.length === 0) return null

  const hasMoreHints = revealedCount < hints.length
  const revealedHints = hints.slice(0, revealedCount)

  const handleRevealHint = () => {
    if (hasMoreHints) {
      setRevealedCount((prev) => prev + 1)
      setIsExpanded(true)
    }
  }

  return (
    <div className="relative">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />

      <div className="bg-warning-subtle backdrop-blur-sm">
        {/* Hint toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-sm
            text-warning hover:text-warning-strong
            hover:bg-white/5 transition-all duration-200"
        >
          <span className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="font-medium">
              {revealedCount === 0
                ? 'Need a hint?'
                : `Hints (${revealedCount}/${hints.length})`}
            </span>
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Hints content */}
        {isExpanded && (
          <div className="px-5 pb-4 animate-slide-down">
            {revealedHints.length > 0 ? (
              <div className="space-y-2 mb-4">
                {revealedHints.map((hint, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4
                      border border-warning/20 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="font-medium text-warning">
                      Hint {index + 1}:
                    </span>{' '}
                    <span className="text-[var(--output-text)]/80">{hint}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warning/80 mb-4">
                Stuck? Click below to reveal a hint.
              </p>
            )}

            {hasMoreHints && (
              <button
                onClick={handleRevealHint}
                className="px-4 py-2 rounded-xl text-sm font-medium
                  bg-warning/80 hover:bg-warning-strong text-white
                  backdrop-blur-sm border border-warning/30
                  shadow-lg shadow-[var(--warning-base)]/20 hover:shadow-[var(--warning-base)]/30
                  transition-all duration-300
                  hover:scale-[1.02] active:scale-[0.98]"
              >
                {revealedCount === 0
                  ? 'Show Hint'
                  : `Show Next Hint (${hints.length - revealedCount} left)`}
              </button>
            )}

            {!hasMoreHints && revealedCount > 0 && (
              <p className="text-xs text-warning/60">
                No more hints available. Try your best!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
