'use client'

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { tokenize, getTokenClass, type Token } from '@/lib/python-tokenizer'
import { Autocomplete } from './Autocomplete'

interface LightEditorProps {
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
  /** Accessible label for the editor */
  ariaLabel?: string
}

interface FontMetrics {
  charWidth: number
  lineHeight: number
}

/**
 * Hook to measure font metrics dynamically (like Monaco/CodeMirror).
 * Creates a hidden measuring element to get the actual rendered character width
 * and line height from the browser's font rendering engine.
 */
function useFontMetrics(containerRef: React.RefObject<HTMLElement | null>): FontMetrics {
  const [metrics, setMetrics] = useState<FontMetrics>({ charWidth: 8.4, lineHeight: 24.5 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create a hidden measuring element with the same font styles as the editor
    const measurer = document.createElement('span')
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre;
      font-family: var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 14px;
      line-height: 1.75;
    `
    // Use a series of characters to get accurate average width
    // For monospace fonts, all characters should be the same width
    measurer.textContent = 'X'.repeat(100)
    container.appendChild(measurer)

    // Measure the actual rendered dimensions
    const rect = measurer.getBoundingClientRect()
    const charWidth = rect.width / 100
    const lineHeight = rect.height

    // Clean up
    container.removeChild(measurer)

    // Only update if values are reasonable (prevents flash of wrong values)
    if (charWidth > 0 && lineHeight > 0) {
      setMetrics({ charWidth, lineHeight })
    }
  }, [containerRef])

  return metrics
}

function LightEditorInner({
  value,
  onChange,
  onRun,
  readOnly = false,
  height = '200px',
  ariaLabel = 'Python code editor',
}: LightEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [lastText, setLastText] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isTyping, setIsTyping] = useState(false)
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [autocompleteState, setAutocompleteState] = useState({
    visible: false,
    word: '',
    left: 0,
    top: 0,
    startIndex: 0,
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onRunRef = useRef(onRun)

  // Measure font metrics dynamically (like Monaco/CodeMirror)
  const fontMetrics = useFontMetrics(containerRef)

  // Keep onRun ref current
  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
    setLastText(value)
  }, [value])

  // Calculate current line and column from cursor position
  const getCursorInfo = useCallback((text: string, position: number) => {
    const before = text.substring(0, position)
    const lines = before.split('\n')
    const line = lines.length - 1
    const col = lines[lines.length - 1]?.length ?? 0
    return { line, col }
  }, [])

  // Get current word at cursor for autocomplete
  const getCurrentWord = useCallback((text: string, position: number) => {
    let start = position
    while (start > 0 && /[a-zA-Z_]/.test(text[start - 1] || '')) {
      start--
    }
    return {
      word: text.slice(start, position),
      startIndex: start,
    }
  }, [])

  // Update cursor position
  const updateCursor = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value
    const pos = textarea.selectionStart
    const { line, col } = getCursorInfo(text, pos)

    // Calculate pixel positions using measured font metrics (like Monaco/CodeMirror)
    const x = col * fontMetrics.charWidth
    const y = line * fontMetrics.lineHeight

    setCursorPosition({ x, y })

    // Track selection
    if (textarea.selectionStart !== textarea.selectionEnd) {
      setSelectionRange({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      })
    } else {
      setSelectionRange(null)
    }

    // Check for autocomplete
    const { word, startIndex } = getCurrentWord(text, pos)
    if (word.length >= 2 && !readOnly) {
      setAutocompleteState({
        visible: true,
        word,
        left: col * fontMetrics.charWidth,
        top: y + fontMetrics.lineHeight + 4,
        startIndex,
      })
    } else {
      setAutocompleteState(prev => ({ ...prev, visible: false }))
    }

    // Set typing state for cursor animation
    setIsTyping(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 400)
  }, [getCursorInfo, getCurrentWord, readOnly, fontMetrics])

  // Handle input change
  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea || readOnly) return

    const newValue = textarea.value
    setLastText(prev => {
      // Only update lastText if content actually changed
      if (prev !== newValue) {
        onChange?.(newValue)
        return newValue
      }
      return prev
    })
    updateCursor()
  }, [onChange, updateCursor, readOnly])

  // Handle keydown
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Hide autocomplete on most navigation keys
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      setAutocompleteState(prev => ({ ...prev, visible: false }))
    }

    // Let autocomplete handle these keys when visible
    if (autocompleteState.visible && ['ArrowDown', 'ArrowUp', 'Tab', 'Enter', 'Escape'].includes(e.key)) {
      // Autocomplete component handles these via window event listener
      return
    }

    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea || readOnly) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end)
      textarea.value = newValue
      textarea.selectionStart = textarea.selectionEnd = start + 4
      onChange?.(newValue)
      setLastText(newValue)
      updateCursor()
    }

    // Cmd/Ctrl+Enter to run
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onRunRef.current?.()
    }

    // Schedule cursor update
    requestAnimationFrame(updateCursor)
  }, [onChange, updateCursor, readOnly, autocompleteState.visible])

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((suggestion: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { startIndex, word } = autocompleteState
    const before = textarea.value.substring(0, startIndex)
    const after = textarea.value.substring(startIndex + word.length)
    const newValue = before + suggestion + after

    textarea.value = newValue
    textarea.selectionStart = textarea.selectionEnd = startIndex + suggestion.length
    onChange?.(newValue)
    setLastText(newValue)
    setAutocompleteState(prev => ({ ...prev, visible: false }))
    textarea.focus()
    updateCursor()
  }, [autocompleteState, onChange, updateCursor])

  // Handle autocomplete dismiss
  const handleAutocompleteDismiss = useCallback(() => {
    setAutocompleteState(prev => ({ ...prev, visible: false }))
    textareaRef.current?.focus()
  }, [])

  // Render tokens to HTML
  const renderedTokens = useMemo(() => {
    if (!isMounted) return null

    const tokens = tokenize(value)
    const oldLen = lastText.length
    const isGrowing = value.length > oldLen

    let charIndex = 0
    const elements: React.ReactNode[] = []

    tokens.forEach((token, tokenIndex) => {
      const synClass = getTokenClass(token.type)

      for (let i = 0; i < token.value.length; i++) {
        const char = token.value[i]!
        const currentCharIndex = charIndex
        const isNew = isGrowing && currentCharIndex >= oldLen
        const isSelected = selectionRange && currentCharIndex >= selectionRange.start && currentCharIndex < selectionRange.end

        if (char === '\n') {
          elements.push(<br key={`${tokenIndex}-${i}`} />)
        } else {
          let className = 'light-char'
          if (isNew && char !== ' ') className += ' new'
          if (isSelected) className += ' selected'
          if (synClass) className += ` ${synClass}`

          elements.push(
            <span key={`${tokenIndex}-${i}`} className={className}>
              {char === '<' ? '<' : char === '>' ? '>' : char === '&' ? '&' : char}
            </span>
          )
        }
        charIndex++
      }
    })

    return elements
  }, [value, lastText, selectionRange, isMounted])

  // Render line numbers
  const lineNumbers = useMemo(() => {
    const lines = value.split('\n')
    const { line: currentLine } = getCursorInfo(value, textareaRef.current?.selectionStart ?? 0)
    const minLines = Math.max(lines.length, 5)

    return Array.from({ length: minLines }, (_, i) => (
      <div
        key={i}
        className={`light-line-number ${i === currentLine ? 'active' : ''}`}
      >
        {i + 1}
      </div>
    ))
  }, [value, getCursorInfo])

  // Focus textarea when clicking on editor
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button')) {
      textareaRef.current?.focus()
    }
  }, [])

  // Cleanup typing timer
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  // SSR placeholder
  if (!isMounted) {
    return (
      <div
        className="light-editor-skeleton"
        style={{ height }}
        role="status"
        aria-label="Loading code editor"
      >
        <div className="light-editor-skeleton-lines">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="light-editor-skeleton-line" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="light-editor-skeleton-number" />
              <div className="light-editor-skeleton-code" style={{ width: i === 0 ? '45%' : i === 1 ? '70%' : '35%' }} />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading editor...</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="light-editor"
      style={{ height }}
      onClick={handleContainerClick}
    >
      {/* Line numbers */}
      <div className="light-editor-gutter">
        {lineNumbers}
      </div>

      {/* Editor content */}
      <div className="light-editor-content">
        {/* Hidden textarea for input */}
        <textarea
          ref={textareaRef}
          className="light-editor-input"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onClick={updateCursor}
          onSelect={updateCursor}
          onFocus={updateCursor}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-multiline="true"
          role="textbox"
        />

        {/* Visual layer with syntax highlighting */}
        <div ref={visualRef} className="light-editor-visual" aria-hidden="true">
          {renderedTokens}
          {/* Cursor - inside visual layer so it inherits same positioning */}
          <div
            className={`light-editor-cursor ${isTyping ? 'active' : ''}`}
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              height: `${fontMetrics.lineHeight}px`,
            }}
          />
        </div>

        {/* Autocomplete dropdown */}
        <Autocomplete
          word={autocompleteState.word}
          left={autocompleteState.left}
          top={autocompleteState.top}
          onSelect={handleAutocompleteSelect}
          onDismiss={handleAutocompleteDismiss}
          visible={autocompleteState.visible}
        />
      </div>
    </div>
  )
}

/**
 * LightEditor Component
 *
 * A lightweight textarea-based code editor with Python syntax highlighting.
 * Designed as a fast, snappy replacement for Monaco Editor.
 *
 * Features:
 * - Character-by-character syntax highlighting
 * - Smooth 50ms cursor transitions
 * - Selection highlighting
 * - Line numbers with active line indication
 * - Tab inserts 4 spaces
 * - Cmd/Ctrl+Enter to run code
 * - Python autocomplete for keywords and built-ins
 */
const LightEditor = memo(LightEditorInner)
export default LightEditor
