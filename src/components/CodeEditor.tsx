'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import type { editor } from 'monaco-editor'
import { MONACO_CDN, getEditorOptions } from './editor/config'
import { inkTheme, inkThemeName } from './editor/themes/ink'

// =============================================================================
// Types
// =============================================================================

interface CodeEditorProps {
  /** The code content */
  value: string
  /** Callback when code changes */
  onChange?: (value: string) => void
  /** Callback when Cmd/Ctrl+Enter is pressed */
  onRun?: () => void
  /** Whether the editor is read-only */
  readOnly?: boolean
  /** Editor height (CSS value) */
  height?: string
  /** Language for syntax highlighting */
  language?: string
  /** Accessible label for the editor */
  ariaLabel?: string
}

type EditorInstance = editor.IStandaloneCodeEditor
type MonacoInstance = typeof import('monaco-editor')

// Lazy import types
type OnMount = (editor: EditorInstance, monaco: MonacoInstance) => void

// =============================================================================
// Loading Skeleton Component
// =============================================================================

interface LoadingSkeletonProps {
  height: string
  lineCount?: number
}

const LoadingSkeleton = memo(function LoadingSkeleton({ 
  height, 
  lineCount = 3 
}: LoadingSkeletonProps) {
  const lines = Array.from({ length: lineCount }, (_, i) => ({
    id: i,
    numberWidth: 'w-4',
    codeWidth: i === 0 ? 'w-48' : i === 1 ? 'w-64' : 'w-32',
    delay: `${i * 100}ms`,
  }))

  return (
    <div 
      className="bg-[var(--editor-bg)] rounded-lg overflow-hidden"
      style={{ height }}
      role="status"
      aria-label="Loading code editor"
    >
      <div className="p-4 space-y-2">
        {lines.map((line) => (
          <div key={line.id} className="flex items-center gap-4">
            <div 
              className={`${line.numberWidth} h-5 rounded bg-[var(--editor-bg-highlight)] animate-pulse`}
              style={{ animationDelay: line.delay }}
            />
            <div 
              className={`${line.codeWidth} h-5 rounded bg-[var(--editor-bg-highlight)] animate-pulse`}
              style={{ animationDelay: line.delay }}
            />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading editor...</span>
    </div>
  )
})

// =============================================================================
// Monaco Loader (Lazy)
// =============================================================================

let monacoPromise: Promise<typeof import('@monaco-editor/react')> | null = null
let loaderConfigured = false

async function loadMonaco() {
  if (!monacoPromise) {
    monacoPromise = import('@monaco-editor/react').then(async (mod) => {
      // Configure CDN only once
      if (!loaderConfigured) {
        mod.loader.config({ paths: { vs: MONACO_CDN.base } })
        loaderConfigured = true
      }
      return mod
    })
  }
  return monacoPromise
}

// =============================================================================
// Main Editor Component
// =============================================================================

function CodeEditorInner({
  value,
  onChange,
  onRun,
  readOnly = false,
  height = '200px',
  language = 'python',
  ariaLabel = 'Code editor',
}: CodeEditorProps) {
  // State
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorInstance | null>(null)
  const onRunRef = useRef(onRun)

  // Keep onRun ref in sync
  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])
  
  // =============================================================================
  // Effects
  // =============================================================================
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Intersection Observer - load Monaco when visible
  useEffect(() => {
    if (!isMounted || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '100px', // Start loading slightly before visible
        threshold: 0 
      }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isMounted])

  // Load Monaco when visible
  useEffect(() => {
    if (!isVisible || isMonacoLoaded) return

    loadMonaco()
      .then((mod) => {
        setEditorComponent(() => mod.default)
        setIsMonacoLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load Monaco:', err)
        setError('Failed to load editor')
      })
  }, [isVisible, isMonacoLoaded])
  
  // Cleanup
  useEffect(() => {
    return () => {
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [])
  
  // =============================================================================
  // Handlers
  // =============================================================================
  
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    
    try {
      // Register and apply theme
      monaco.editor.defineTheme(inkThemeName, inkTheme as editor.IStandaloneThemeData)
      monaco.editor.setTheme(inkThemeName)
      
      // Configure Python
      if (language === 'python') {
        monaco.languages.setLanguageConfiguration('python', {
          comments: { lineComment: '#' },
          brackets: [['{', '}'], ['[', ']'], ['(', ')']],
          autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: "'", close: "'", notIn: ['string'] },
          ],
          indentationRules: {
            increaseIndentPattern: /^.*:\s*$/,
            decreaseIndentPattern: /^\s*(elif|else|except|finally)\b.*:\s*$/,
          },
        })
      }
      
      editor.updateOptions({ ariaLabel })

      // Register Cmd/Ctrl+Enter to run code
      editor.addAction({
        id: 'run-code',
        label: 'Run Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
          onRunRef.current?.()
        },
      })

      requestAnimationFrame(() => setIsReady(true))
    } catch (err) {
      console.error('Failed to initialize editor:', err)
      setError('Failed to initialize editor')
    }
  }, [language, ariaLabel])
  
  const handleChange = useCallback((newValue: string | undefined) => {
    onChange?.(newValue ?? '')
  }, [onChange])
  
  const handleBeforeMount = useCallback((monaco: MonacoInstance) => {
    // Pre-register theme to avoid flash
    monaco.editor.defineTheme(inkThemeName, inkTheme as editor.IStandaloneThemeData)
  }, [])
  
  // =============================================================================
  // Render
  // =============================================================================
  
  const lineCount = Math.min(value.split('\n').length, 5)
  
  // Server-side or not mounted yet
  if (!isMounted) {
    return <LoadingSkeleton height={height} lineCount={lineCount} />
  }
  
  // Error state
  if (error) {
    return (
      <div 
        className="bg-[var(--editor-bg)] rounded-lg overflow-hidden flex items-center justify-center text-[var(--error-base)]"
        style={{ height }}
        role="alert"
      >
        <div className="text-center p-4">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
  
  const options = getEditorOptions(readOnly)
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ height }}
    >
      {/* Loading state while Monaco loads or initializes */}
      {(!isMonacoLoaded || !isReady) && (
        <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
          <LoadingSkeleton height={height} lineCount={lineCount} />
        </div>
      )}
      
      {/* Monaco Editor - only rendered when loaded */}
      {EditorComponent && (
        <div 
          className={`transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          style={{ height }}
        >
          <EditorComponent
            height={height}
            language={language}
            theme={inkThemeName}
            value={value}
            onChange={handleChange}
            onMount={handleEditorMount}
            beforeMount={handleBeforeMount}
            options={options}
            loading={null}
          />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Memoized Export
// =============================================================================

/**
 * CodeEditor Component
 * 
 * A Monaco-based code editor with lazy loading optimizations:
 * - Monaco only loads when the editor becomes visible (Intersection Observer)
 * - SSR-safe with hydration handling
 * - Custom "Ink" theme matching the design system
 * - Accessible with ARIA labels
 */
const CodeEditor = memo(CodeEditorInner)
export default CodeEditor
