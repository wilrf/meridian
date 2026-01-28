'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ProjectOutputProps {
  /** Console output text */
  output: string
  /** Whether code is currently running */
  isRunning: boolean
  /** Execution time in milliseconds */
  executionTime?: number | null
  /** Callback to clear output */
  onClear: () => void
  /** Whether there was an error */
  hasError?: boolean
  /** Whether this project has validation */
  hasValidation?: boolean
  /** Whether the project is completed */
  isCompleted?: boolean
  /** Callback to submit project for validation */
  onSubmit?: () => void
  /** Whether Pyodide is ready */
  isPyodideReady?: boolean
}

/**
 * ProjectOutput Component
 *
 * Console output panel for the project workspace.
 * Features:
 * - Auto-scrolls to bottom on new output
 * - Copy output to clipboard
 * - Clear output button
 * - Execution time display
 * - Error highlighting
 */
export default function ProjectOutput({
  output,
  isRunning,
  executionTime,
  onClear,
  hasError = false,
  hasValidation = false,
  isCompleted = false,
  onSubmit,
  isPyodideReady = false,
}: ProjectOutputProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [output])

  // Copy output to clipboard
  const handleCopy = useCallback(async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [output])

  // Format execution time
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="project-panel project-output-panel">
      {/* Header */}
      <div className="project-output-header">
        <div className="project-output-title">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Output
        </div>

        <div className="project-output-actions">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="project-output-btn"
            title={copied ? 'Copied!' : 'Copy output'}
            disabled={!output}
          >
            {copied ? (
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="project-output-btn"
            title="Clear output"
            disabled={!output && !isRunning}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="project-output-content">
        {isRunning ? (
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Running...</span>
          </div>
        ) : output ? (
          <pre className={hasError ? 'project-output-error' : ''}>
            {output}
          </pre>
        ) : (
          <div className="text-[var(--text-muted)] italic">
            Run your code to see output here
          </div>
        )}
      </div>

      {/* Footer with execution time and submit button */}
      <div className="project-output-footer">
        <div className="flex items-center gap-2">
          {(executionTime !== null && executionTime !== undefined && !isRunning) && (
            hasError ? (
              <span className="text-error flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Error
              </span>
            ) : (
              <span className="text-success flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Success
              </span>
            )
          )}
          {(executionTime !== null && executionTime !== undefined && !isRunning) && (
            <span className="text-[var(--text-muted)]">{formatTime(executionTime)}</span>
          )}
        </div>

        {/* Submit button for projects with validation */}
        {hasValidation && onSubmit && (
          <button
            onClick={onSubmit}
            disabled={isRunning || !isPyodideReady}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
              ${isCompleted
                ? 'bg-success text-white'
                : 'bg-[var(--interactive-primary)] text-[var(--text-inverse)] hover:bg-[var(--interactive-primary-hover)]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isCompleted ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </>
            ) : isRunning ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Validating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Project
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
