'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { usePyodide } from '@/lib/pyodide-context'
import { useLessonContext } from '@/lib/lesson-context'
import HintSystem from './HintSystem'
import CodeEditor from './CodeEditor'

interface CodeRunnerProps {
  initialCode: string
  exerciseId?: string
  expected?: string
  validate?: string
  hints?: string[]
}

// Maximum output length to prevent browser freeze from massive DOM
const MAX_OUTPUT_LENGTH = 10000
const TYPEWRITER_THRESHOLD = 200

function truncateOutput(text: string): string {
  if (text.length <= MAX_OUTPUT_LENGTH) return text
  return text.slice(0, MAX_OUTPUT_LENGTH) + `\n\n... (output truncated, ${text.length - MAX_OUTPUT_LENGTH} more characters)`
}

// Typewriter text component for smooth output reveal
function TypewriterText({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled) {
    return <>{text}</>
  }

  return (
    <>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="output-char"
          style={{ animationDelay: `${i * 15}ms` }}
        >
          {char === '\n' ? <br /> : char}
        </span>
      ))}
    </>
  )
}

// Success particles component
function SuccessParticles({ show, buttonRef }: { show: boolean; buttonRef: React.RefObject<HTMLButtonElement | null> }) {
  const [particles, setParticles] = useState<Array<{ id: number; tx: number; ty: number; color: string }>>([])
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const containerRect = buttonRef.current.closest('.editor-card')?.getBoundingClientRect()

      if (containerRect) {
        setPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        })
      }

      // Generate particles
      const colors = [
        'var(--success-base)',
        'var(--success-strong)',
        'var(--success-light)',
        'var(--accent-glow)',
      ]

      const newParticles = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const distance = 50 + Math.random() * 40
        const colorIndex = Math.floor(Math.random() * colors.length)
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          color: colors[colorIndex] ?? 'var(--success-base)',
        }
      })

      setParticles(newParticles)

      // Clean up particles after animation
      const timer = setTimeout(() => {
        setParticles([])
      }, 900)

      return () => clearTimeout(timer)
    }
  }, [show, buttonRef])

  if (!show || particles.length === 0) return null

  return (
    <div
      className="particles-container"
      style={{ left: position.x, top: position.y }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            backgroundColor: p.color,
            left: 0,
            top: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default function CodeRunner({
  initialCode,
  exerciseId,
  expected,
  validate,
  hints = [],
}: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [showParticles, setShowParticles] = useState(false)
  const [justSucceeded, setJustSucceeded] = useState(false)
  const [outputKey, setOutputKey] = useState(0)
  const outputRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isRunningRef = useRef(false) // Prevent double-click race conditions
  const mountedRef = useRef(true) // Track mount state for async safety
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set()) // Track timeouts for cleanup

  const { state: pyodideState, runCode, checkExpected, validateCode } = usePyodide()

  // Helper to create tracked timeouts that auto-cleanup
  const setTrackedTimeout = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutIdsRef.current.delete(id)
      if (mountedRef.current) {
        callback()
      }
    }, delay)
    timeoutIdsRef.current.add(id)
    return id
  }, [])

  // Track component mount state and cleanup timeouts
  useEffect(() => {
    mountedRef.current = true
    const timeoutIds = timeoutIdsRef.current
    return () => {
      mountedRef.current = false
      // Clear all pending timeouts on unmount
      timeoutIds.forEach(clearTimeout)
      timeoutIds.clear()
    }
  }, [])
  const { lessonId } = useLessonContext()

  const isExercise = Boolean(exerciseId)
  const isPyodideReady = pyodideState.status === 'ready'

  // Calculate editor height with smooth transitions
  const editorHeight = useMemo(() => {
    const lineCount = code.split('\n').length
    return Math.max(120, Math.min(400, lineCount * 24 + 40))
  }, [code])

  // Check if exercise is already completed on mount
  useEffect(() => {
    if (!exerciseId || !lessonId) return

    const checkCompletion = async () => {
      try {
        const response = await fetch(`/api/progress?lessonId=${encodeURIComponent(lessonId)}`)
        if (response.ok && mountedRef.current) {
          const data = await response.json()
          if (data.progress?.exercises?.[exerciseId]?.completed && mountedRef.current) {
            setIsCompleted(true)
            setStatus('success')
          }
        }
      } catch {
        // Ignore errors, just don't show as completed
      }
    }

    checkCompletion()
  }, [exerciseId, lessonId])

  // Show output panel with animation when output changes
  useEffect(() => {
    if (output || isRunning) {
      setShowOutput(true)
    }
  }, [output, isRunning])

  const saveExerciseCompletion = useCallback(async () => {
    if (!exerciseId || !lessonId) return

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeExercise',
          lessonId,
          exerciseId,
        }),
      })
      // Only update state if still mounted
      if (mountedRef.current) {
        setIsCompleted(true)
      }
    } catch {
      // Ignore errors, completion will just not be saved
    }
  }, [exerciseId, lessonId])

  const handleRun = useCallback(async () => {
    // Prevent double-click race conditions
    if (isRunningRef.current) return
    isRunningRef.current = true

    setIsRunning(true)
    setButtonState('loading')
    setOutput('')
    setStatus('idle')
    setJustSucceeded(false)

    try {
      let passed = false
      let resultOutput = ''

      if (isExercise && expected) {
        const result = await checkExpected(code, expected)
        if (!mountedRef.current) return
        resultOutput = result.stdout + (result.message ? `\n${result.message}` : '')
        passed = result.passed
        setStatus(result.passed ? 'success' : 'error')
        if (result.passed && !isCompleted) {
          saveExerciseCompletion()
        }
      } else if (isExercise && validate) {
        const result = await validateCode(code, validate)
        if (!mountedRef.current) return
        resultOutput = result.stdout + (result.message ? `\n${result.message}` : '')
        passed = result.passed
        setStatus(result.passed ? 'success' : 'error')
        if (result.passed && !isCompleted) {
          saveExerciseCompletion()
        }
      } else {
        const result = await runCode(code)
        if (!mountedRef.current) return
        resultOutput = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '')
        setOutput(truncateOutput(resultOutput) || '(No output)')
        setStatus(result.success ? 'idle' : 'error')
        setIsRunning(false)
        setButtonState('idle')
        setOutputKey((k) => k + 1)
        return
      }

      // Update output with new key to trigger typewriter
      setOutput(truncateOutput(resultOutput))
      setOutputKey((k) => k + 1)

      // Handle button state transitions
      if (passed) {
        setButtonState('success')
        setJustSucceeded(true)
        setShowParticles(true)

        // Reset particles
        setTrackedTimeout(() => setShowParticles(false), 900)

        // Reset button after showing success
        setTrackedTimeout(() => {
          setButtonState('idle')
          setJustSucceeded(false)
        }, 2500)
      } else {
        setButtonState('idle')
      }
    } catch (error) {
      setOutput(truncateOutput(`Error: ${error instanceof Error ? error.message : String(error)}`))
      setStatus('error')
      setButtonState('idle')
      setOutputKey((k) => k + 1)
    } finally {
      isRunningRef.current = false
      if (mountedRef.current) {
        setIsRunning(false)
      }
    }
  }, [code, isExercise, expected, validate, isCompleted, checkExpected, validateCode, runCode, saveExerciseCompletion, setTrackedTimeout])

  const handleReset = useCallback(() => {
    setCode(initialCode)
    setOutput('')
    setShowOutput(false)
    setStatus(isCompleted ? 'success' : 'idle')
    setButtonState('idle')
    setJustSucceeded(false)
  }, [initialCode, isCompleted])

  // Stable onChange with micro-debounce built into Monaco
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  const getButtonText = () => {
    if (!isPyodideReady) return pyodideState.loadingProgress || 'Loading Python...'
    return isExercise ? 'Check Answer' : 'Run'
  }

  // Button class based on state
  const buttonClass = useMemo(() => {
    const base = 'btn-check btn-lift relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out overflow-hidden'

    if (buttonState === 'loading' || !isPyodideReady) {
      return `${base} loading bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-not-allowed`
    }

    if (buttonState === 'success') {
      return `${base} success text-white`
    }

    return `${base} bg-[var(--interactive-primary)] text-[var(--text-inverse)] hover:bg-[var(--interactive-primary-hover)] hover:shadow-lg`
  }, [buttonState, isPyodideReady])

  // Card glow style
  const cardClass = useMemo(() => {
    const base = 'editor-card my-8 rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--editor-bg)] relative'

    if (justSucceeded) {
      return `${base} success`
    }

    return base
  }, [justSucceeded])

  // Dynamic glow based on status (persistent, not just on success)
  const cardStyle = useMemo(() => {
    if (justSucceeded) return {} // Let CSS class handle it

    if (!isExercise) return {}
    if (status === 'success' || isCompleted) {
      return {
        boxShadow: '0 0 20px -5px var(--success-base)',
        transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
    if (status === 'error') {
      return {
        boxShadow: '0 0 20px -5px var(--error-base)',
        transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
    return {
      transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }
  }, [isExercise, status, isCompleted, justSucceeded])

  return (
    <div className={cardClass} style={cardStyle}>
      {/* Success particles */}
      <SuccessParticles show={showParticles} buttonRef={buttonRef} />

      {/* Header for exercises */}
      {exerciseId && (
        <div className="px-4 py-3 flex justify-between items-center border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            {/* Status icon with animation */}
            <span
              className={`status-dot w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${status === 'success' || isCompleted
                  ? 'bg-success text-white active'
                  : status === 'error'
                  ? 'bg-error text-white animate-shake'
                  : 'bg-[var(--text-tertiary)] text-white'
                }`}
            >
              {status === 'success' || isCompleted ? (
                <svg
                  className={`w-3.5 h-3.5 ${justSucceeded ? 'status-icon-animate' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : status === 'error' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                '?'
              )}
            </span>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                status === 'success' || isCompleted
                  ? 'text-success'
                  : status === 'error'
                  ? 'text-error'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Exercise {exerciseId}
            </span>
          </div>
          {/* Reset button with hover effect */}
          <button
            onClick={handleReset}
            className={`text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
              hover:bg-[var(--bg-subtle)] active:scale-95
              transition-all duration-150 ease-out
              ${code === initialCode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <svg className="w-3.5 h-3.5 transition-transform hover:rotate-[-45deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>
      )}

      {/* Code Editor with smooth height transition */}
      <div
        className="bg-[var(--editor-bg)] overflow-hidden"
        style={{
          height: `${editorHeight}px`,
          transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          onRun={handleRun}
          height={`${editorHeight}px`}
          ariaLabel={exerciseId ? `Exercise ${exerciseId} code editor` : 'Python code editor'}
        />
      </div>

      {/* Action bar with run button */}
      <div className="px-4 py-3 flex justify-end items-center border-t border-[var(--border-subtle)] bg-[var(--editor-bg)]">
        <button
          ref={buttonRef}
          onClick={handleRun}
          disabled={buttonState === 'loading' || !isPyodideReady}
          className={buttonClass}
        >
          {/* Button text */}
          <span className="btn-text flex items-center gap-2">
            {isPyodideReady && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {getButtonText()}
          </span>

          {/* Loading spinner */}
          <span className="btn-spinner">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>

          {/* Success checkmark */}
          <span className="btn-checkmark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Output panel with CSS grid animation */}
      <div
        ref={outputRef}
        className={`output-panel-grid ${showOutput && (output || isRunning) ? 'expanded' : 'collapsed'}`}
      >
        <div className="output-panel-content">
          <div
            className={`output-panel-inner px-4 py-3 border-t transition-colors duration-300
              ${status === 'success'
                ? 'border-success/30 bg-success/5'
                : status === 'error'
                ? 'border-error/30 bg-error/5'
                : 'border-[var(--border-subtle)] bg-[var(--bg-inset)]'
              }`}
          >
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wide font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Output
            </div>
            {isRunning ? (
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Running...</span>
              </div>
            ) : (
              <pre
                key={outputKey}
                className={`text-sm whitespace-pre-wrap font-mono leading-relaxed transition-colors duration-300 ${
                  status === 'success'
                    ? 'text-success'
                    : status === 'error'
                    ? 'text-error'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                <TypewriterText text={output} enabled={output.length < TYPEWRITER_THRESHOLD} />
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Hints system for exercises */}
      {isExercise && hints.length > 0 && !isCompleted && (
        <HintSystem hints={hints} exerciseId={exerciseId!} />
      )}

      {/* Pyodide loading indicator with progress */}
      {pyodideState.status === 'loading' && (
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-inset)]">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <span>{pyodideState.loadingProgress || 'Loading Python runtime...'}</span>
          </div>
        </div>
      )}

      {pyodideState.status === 'error' && (
        <div className="px-4 py-3 border-t border-error/30 bg-error/5 text-sm text-error flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Failed to load Python: {pyodideState.error}
        </div>
      )}
    </div>
  )
}
