'use client'

import Editor, { type OnMount } from '@monaco-editor/react'
import { useState, useEffect, useCallback } from 'react'
import { inkTheme, inkThemeName } from './editor/themes/ink'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = '200px',
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    // Register the Ink theme
    monaco.editor.defineTheme(inkThemeName, inkTheme)
    monaco.editor.setTheme(inkThemeName)

    // Add spacing between line numbers and code content
    editor.updateOptions({
      lineDecorationsWidth: 24,
    })
  }, [])

  if (!mounted) {
    return (
      <div
        className="bg-[var(--editor-bg)] animate-pulse flex items-center justify-center text-[var(--editor-text-muted)] text-sm rounded-lg"
        style={{ height }}
      >
        Loading editor...
      </div>
    )
  }

  return (
    <Editor
      height={height}
      language="python"
      theme="vs-dark" // Will be overridden by Ink theme on mount
      value={value}
      onChange={(val) => onChange?.(val ?? '')}
      onMount={handleEditorMount}
      options={{
        readOnly,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        lineHeight: 24,
        letterSpacing: 0.5,
        padding: { top: 20, bottom: 20 },

        // Appearance
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: false,
        renderWhitespace: 'none',

        // Behavior
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on',
        automaticLayout: true,

        // Features
        quickSuggestions: true,
        parameterHints: { enabled: true },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',

        // Decorations
        lineDecorationsWidth: 24,
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,

        // Context menu
        contextmenu: true,
        links: true,

        // Scrollbar
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          useShadows: false,
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[var(--editor-bg)] text-[var(--editor-text)]">
          Loading editor...
        </div>
      }
    />
  )
}
