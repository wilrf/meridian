'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePyodide } from '@/lib/pyodide-context'
import { useLessonContext } from '@/lib/lesson-context'
import HintSystem from './HintSystem'

// Dynamic import to avoid SSR issues with Monaco
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-36 bg-editor-bg/90 backdrop-blur-sm rounded-xl animate-pulse flex items-center justify-center text-editor-text-muted text-sm">
      Loading editor...
    </div>
  ),
})

interface CodeRunnerProps {
  initialCode: string
  exerciseId?: string
  expected?: string
  validate?: string
  hints?: string[]
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

  const { state: pyodideState, runCode, checkExpected, validateCode } = usePyodide()
  const { lessonId } = useLessonContext()

  const isExercise = Boolean(exerciseId)
  const isPyodideReady = pyodideState.status === 'ready'

  // Check if exercise is already completed on mount
  useEffect(() => {
    if (!exerciseId || !lessonId) return

    const checkCompletion = async () => {
      try {
        const response = await fetch(`/api/progress?lessonId=${encodeURIComponent(lessonId)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.progress?.exercises?.[exerciseId]?.completed) {
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

  const saveExerciseCompletion = async () => {
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
      setIsCompleted(true)
    } catch {
      // Ignore errors, completion will just not be saved
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setStatus('idle')

    try {
      if (isExercise && expected) {
        // Check expected output
        const result = await checkExpected(code, expected)
        setOutput(result.stdout + (result.message ? `\n${result.message}` : ''))
        setStatus(result.passed ? 'success' : 'error')
        if (result.passed && !isCompleted) {
          saveExerciseCompletion()
        }
      } else if (isExercise && validate) {
        // Run validation assertion
        const result = await validateCode(code, validate)
        setOutput(result.stdout + (result.message ? `\n${result.message}` : ''))
        setStatus(result.passed ? 'success' : 'error')
        if (result.passed && !isCompleted) {
          saveExerciseCompletion()
        }
      } else {
        // Just run the code
        const result = await runCode(code)
        const combinedOutput = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '')
        setOutput(combinedOutput || '(No output)')
        setStatus(result.success ? 'idle' : 'error')
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput('')
    setStatus(isCompleted ? 'success' : 'idle')
  }

  const getButtonText = () => {
    if (isRunning) return 'Running...'
    if (!isPyodideReady) return pyodideState.loadingProgress || 'Loading Python...'
    return isExercise ? 'Check Answer' : 'Run'
  }

  const glowColor = status === 'success' || isCompleted
    ? 'shadow-[0_0_15px_-5px_var(--success-base)]'
    : status === 'error'
    ? 'shadow-[0_0_15px_-5px_var(--error-base)]'
    : ''

  return (
    <div
      className={`my-8 rounded-2xl overflow-hidden transition-all duration-300
        border border-[var(--border-subtle)]
        bg-[var(--editor-bg)]
        ${isExercise && glowColor ? glowColor : ''}
      `}
    >
        {/* Header for exercises */}
        {exerciseId && (
          <div
            className="px-4 py-3 flex justify-between items-center
              border-b border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-2.5">
              {/* Status icon */}
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  transition-all duration-300
                  ${status === 'success' || isCompleted
                    ? 'bg-success text-white'
                    : status === 'error'
                    ? 'bg-error text-white'
                    : 'bg-[var(--text-tertiary)] text-white'
                  }`}
              >
                {status === 'success' || isCompleted ? '✓' : status === 'error' ? '✗' : '?'}
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
            {code !== initialCode && (
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]
                  flex items-center gap-1.5 px-2 py-1 rounded-md
                  hover:bg-[var(--bg-subtle)] transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            )}
          </div>
        )}

        {/* Code Editor */}
        <div className="bg-[var(--editor-bg)]">
          <CodeEditor
            value={code}
            onChange={setCode}
            height={`${Math.max(120, Math.min(400, code.split('\n').length * 22 + 32))}px`}
          />
        </div>

        {/* Action bar with run button */}
        <div className="px-4 py-3 flex justify-end items-center border-t border-[var(--border-subtle)] bg-[var(--editor-bg)]">
          <button
            onClick={handleRun}
            disabled={isRunning || !isPyodideReady}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isRunning || !isPyodideReady
                ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--interactive-primary)] text-[var(--text-inverse)] hover:bg-[var(--interactive-primary-hover)]'
              }`}
          >
            {getButtonText()}
          </button>
        </div>

        {/* Output panel */}
        {(output || isRunning) && (
          <div
            className={`px-4 py-3 border-t transition-colors duration-200
              ${status === 'success'
                ? 'border-success/30 bg-success/5'
                : status === 'error'
                ? 'border-error/30 bg-error/5'
                : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)]'
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
                <div className="w-3.5 h-3.5 border-2 border-[var(--text-tertiary)] border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </div>
            ) : (
              <pre
                className={`text-sm whitespace-pre-wrap font-mono leading-relaxed ${
                  status === 'success'
                    ? 'text-success'
                    : status === 'error'
                    ? 'text-error'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {output}
              </pre>
            )}
          </div>
        )}

        {/* Hints system for exercises */}
        {isExercise && hints.length > 0 && !isCompleted && (
          <HintSystem hints={hints} exerciseId={exerciseId!} />
        )}

        {/* Pyodide loading indicator */}
        {pyodideState.status === 'loading' && (
          <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-[var(--text-tertiary)] border-t-transparent rounded-full animate-spin" />
            <span>{pyodideState.loadingProgress || 'Loading Python runtime...'}</span>
          </div>
        )}

        {pyodideState.status === 'error' && (
          <div className="px-4 py-3 border-t border-error/30 bg-error/5 text-sm text-error">
            Failed to load Python: {pyodideState.error}
          </div>
        )}
      </div>
  )
}
