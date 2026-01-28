'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { usePyodide } from '@/lib/pyodide-context'
import { useProgress } from '@/lib/use-progress'
import ResizableDivider from './ResizableDivider'
import ProjectInstructions from './ProjectInstructions'
import ProjectEditor, { type ProjectFile } from './ProjectEditor'
import ProjectOutput from './ProjectOutput'

interface ProjectWorkspaceProps {
  /** Unique project identifier */
  projectId: string
  /** Project instructions (markdown content) */
  content: string
  /** Starter code for main.py */
  starterCode: string
  /** Optional validation code */
  validate?: string
}

// LocalStorage key prefix
const STORAGE_PREFIX = 'meridian_project_'

// Default panel widths
const DEFAULT_INSTRUCTIONS_WIDTH = 280
const DEFAULT_OUTPUT_WIDTH_PERCENT = 25
const MIN_INSTRUCTIONS_WIDTH = 200
const MAX_INSTRUCTIONS_WIDTH = 500
const MIN_OUTPUT_WIDTH_PERCENT = 15
const MAX_OUTPUT_WIDTH_PERCENT = 40

/**
 * ProjectWorkspace Component
 *
 * Main container for the three-panel project layout.
 * Features:
 * - Resizable panels with draggable dividers
 * - Multi-file editor with tabs
 * - Code execution via Pyodide
 * - Auto-save to localStorage
 * - Mobile responsive layout
 */
export default function ProjectWorkspace({
  projectId,
  content,
  starterCode,
  validate,
}: ProjectWorkspaceProps) {
  // Panel sizes
  const [instructionsWidth, setInstructionsWidth] = useState(DEFAULT_INSTRUCTIONS_WIDTH)
  const [outputWidthPercent, setOutputWidthPercent] = useState(DEFAULT_OUTPUT_WIDTH_PERCENT)

  // File state
  const [files, setFiles] = useState<ProjectFile[]>([
    { id: 'main', name: 'main.py', content: starterCode }
  ])
  const [activeFileId, setActiveFileId] = useState('main')

  // Output state
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [hasError, setHasError] = useState(false)

  // Progress state
  const [isCompleted, setIsCompleted] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Mobile state
  const [showMobileRequirements, setShowMobileRequirements] = useState(false)
  const [hasScrolledPast, setHasScrolledPast] = useState(false)

  // Refs
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  // Pyodide context
  const { state: pyodideState, runCode, validateCode } = usePyodide()
  const isPyodideReady = pyodideState.status === 'ready'

  // Progress context
  const { progress } = useProgress()

  // Storage key for this project
  const storageKey = useMemo(() => `${STORAGE_PREFIX}${projectId}`, [projectId])

  // Load saved files from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.files && Array.isArray(parsed.files)) {
          setFiles(parsed.files)
          if (parsed.activeFileId) {
            setActiveFileId(parsed.activeFileId)
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey])

  // Save files to localStorage (debounced)
  const saveToLocalStorage = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          files,
          activeFileId,
          savedAt: new Date().toISOString(),
        }))
      } catch {
        // Ignore localStorage errors
      }
    }, 500)
  }, [files, activeFileId, storageKey])

  // Save when files change
  useEffect(() => {
    saveToLocalStorage()
  }, [files, activeFileId, saveToLocalStorage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Check if project is already completed
  useEffect(() => {
    if (progress?.lessons[projectId]?.status === 'completed') {
      setIsCompleted(true)
    }
  }, [progress, projectId])

  // Save project completion
  const saveProjectCompletion = useCallback(async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeLesson',
          lessonId: projectId,
        }),
      })
      setIsCompleted(true)
    } catch {
      // Ignore errors, completion will just not be saved
    }
  }, [projectId])

  // Handle file content change
  const handleFileChange = useCallback((fileId: string, content: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, content } : f
    ))
  }, [])

  // Handle active file change
  const handleActiveFileChange = useCallback((fileId: string) => {
    setActiveFileId(fileId)
  }, [])

  // Handle adding a new file
  const handleAddFile = useCallback((name: string) => {
    const id = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()

    // Check for duplicate
    if (files.some(f => f.name === name || f.id === id)) {
      return
    }

    const newFile: ProjectFile = {
      id,
      name,
      content: `# ${name}\n\n`,
    }

    setFiles(prev => [...prev, newFile])
    setActiveFileId(id)
  }, [files])

  // Handle closing a file
  const handleCloseFile = useCallback((fileId: string) => {
    if (files.length <= 1) return

    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)

      // If we're closing the active file, switch to another
      if (fileId === activeFileId && newFiles.length > 0) {
        setActiveFileId(newFiles[0]?.id ?? 'main')
      }

      return newFiles
    })
  }, [files.length, activeFileId])

  // Handle running code
  const handleRun = useCallback(async () => {
    if (isRunning || !isPyodideReady) return

    setIsRunning(true)
    setOutput('')
    setHasError(false)
    setExecutionTime(null)

    const startTime = performance.now()

    try {
      // Get main.py content (or active file if main doesn't exist)
      const mainFile = files.find(f => f.name === 'main.py') ?? files.find(f => f.id === activeFileId)
      if (!mainFile) {
        setOutput('Error: No file to run')
        setHasError(true)
        return
      }

      const result = await runCode(mainFile.content)

      const endTime = performance.now()
      setExecutionTime(Math.round(endTime - startTime))

      if (result.success) {
        setOutput(result.stdout || '(No output)')
        setHasError(false)
      } else {
        setOutput(result.stdout + (result.stderr ? `\nError: ${result.stderr}` : ''))
        setHasError(true)
      }
    } catch (error) {
      const endTime = performance.now()
      setExecutionTime(Math.round(endTime - startTime))
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setHasError(true)
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, isPyodideReady, files, activeFileId, runCode])

  // Handle clearing output
  const handleClearOutput = useCallback(() => {
    setOutput('')
    setExecutionTime(null)
    setHasError(false)
  }, [])

  // Handle project submission with validation
  const handleSubmit = useCallback(async () => {
    if (isRunning || isValidating || !isPyodideReady || !validate) return

    setIsValidating(true)
    setOutput('')
    setHasError(false)
    setExecutionTime(null)

    const startTime = performance.now()

    try {
      // Get main.py content
      const mainFile = files.find(f => f.name === 'main.py') ?? files.find(f => f.id === activeFileId)
      if (!mainFile) {
        setOutput('Error: No file to run')
        setHasError(true)
        return
      }

      const result = await validateCode(mainFile.content, validate)

      const endTime = performance.now()
      setExecutionTime(Math.round(endTime - startTime))

      if (result.passed) {
        setOutput(result.stdout + '\n\n' + result.message)
        setHasError(false)
        // Mark project as completed
        if (!isCompleted) {
          saveProjectCompletion()
        }
      } else {
        setOutput(result.stdout + (result.message ? `\n\n${result.message}` : ''))
        setHasError(true)
      }
    } catch (error) {
      const endTime = performance.now()
      setExecutionTime(Math.round(endTime - startTime))
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setHasError(true)
    } finally {
      setIsValidating(false)
    }
  }, [isRunning, isValidating, isPyodideReady, validate, files, activeFileId, validateCode, isCompleted, saveProjectCompletion])

  // Handle instructions panel resize
  const handleInstructionsResize = useCallback((delta: number) => {
    setInstructionsWidth(prev => {
      const newWidth = prev + delta
      return Math.max(MIN_INSTRUCTIONS_WIDTH, Math.min(MAX_INSTRUCTIONS_WIDTH, newWidth))
    })
  }, [])

  // Handle output panel resize
  const handleOutputResize = useCallback((delta: number) => {
    if (!workspaceRef.current) return

    const totalWidth = workspaceRef.current.offsetWidth
    const deltaPercent = (delta / totalWidth) * 100

    setOutputWidthPercent(prev => {
      // Output resize is inverted (dragging left makes it bigger)
      const newPercent = prev - deltaPercent
      return Math.max(MIN_OUTPUT_WIDTH_PERCENT, Math.min(MAX_OUTPUT_WIDTH_PERCENT, newPercent))
    })
  }, [])

  // Handle reset to default panel sizes
  const handleResetInstructionsWidth = useCallback(() => {
    setInstructionsWidth(DEFAULT_INSTRUCTIONS_WIDTH)
  }, [])

  const handleResetOutputWidth = useCallback(() => {
    setOutputWidthPercent(DEFAULT_OUTPUT_WIDTH_PERCENT)
  }, [])

  // Handle scroll change from instructions panel
  const handleInstructionsScrollChange = useCallback((scrolledPast: boolean) => {
    setHasScrolledPast(scrolledPast)
  }, [])

  // Handle mobile requirements button
  const handleMobileRequirementsClick = useCallback(() => {
    // Scroll instructions panel to top
    const instructionsPanel = document.querySelector('.project-instructions-content')
    if (instructionsPanel) {
      instructionsPanel.scrollTop = 0
    }
    setShowMobileRequirements(true)
  }, [])

  // CSS custom properties for panel sizes
  const workspaceStyle = useMemo(() => ({
    '--instructions-width': `${instructionsWidth}px`,
    '--output-width': `${outputWidthPercent}%`,
  } as React.CSSProperties), [instructionsWidth, outputWidthPercent])

  return (
    <div
      ref={workspaceRef}
      className="project-workspace"
      style={workspaceStyle}
    >
      {/* Instructions Panel */}
      <ProjectInstructions
        content={content}
        onScrollChange={handleInstructionsScrollChange}
      />

      {/* Divider: Instructions | Editor */}
      <ResizableDivider
        onResize={handleInstructionsResize}
        onReset={handleResetInstructionsWidth}
        orientation="vertical"
        className="hidden md:flex"
      />

      {/* Editor Panel */}
      <ProjectEditor
        files={files}
        activeFileId={activeFileId}
        onChange={handleFileChange}
        onActiveFileChange={handleActiveFileChange}
        onAddFile={handleAddFile}
        onCloseFile={handleCloseFile}
        onRun={handleRun}
        isRunning={isRunning}
        isPyodideReady={isPyodideReady}
      />

      {/* Divider: Editor | Output */}
      <ResizableDivider
        onResize={handleOutputResize}
        onReset={handleResetOutputWidth}
        orientation="vertical"
        className="hidden md:flex"
      />

      {/* Output Panel */}
      <ProjectOutput
        output={output}
        isRunning={isRunning || isValidating}
        executionTime={executionTime}
        onClear={handleClearOutput}
        hasError={hasError}
        // Validation props
        hasValidation={!!validate}
        isCompleted={isCompleted}
        onSubmit={handleSubmit}
        isPyodideReady={isPyodideReady}
      />

      {/* Mobile floating requirements button */}
      <button
        onClick={handleMobileRequirementsClick}
        className={`project-mobile-requirements-btn ${hasScrolledPast ? 'visible' : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Requirements
      </button>

      {/* Pyodide loading indicator */}
      {pyodideState.status === 'loading' && (
        <div className="fixed bottom-4 right-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg px-4 py-2 shadow-lg flex items-center gap-3 text-sm z-50">
          <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[var(--text-secondary)]">
            {pyodideState.loadingProgress || 'Loading Python...'}
          </span>
        </div>
      )}

      {pyodideState.status === 'error' && (
        <div className="fixed bottom-4 right-4 bg-error-subtle border border-error rounded-lg px-4 py-2 shadow-lg flex items-center gap-3 text-sm z-50">
          <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-error">Failed to load Python</span>
        </div>
      )}
    </div>
  )
}
