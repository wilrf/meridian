'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo, useLayoutEffect } from 'react'

// Python keywords for autocomplete
const PYTHON_KEYWORDS = [
  'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'match', 'None', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
]

// Python built-in functions
const PYTHON_BUILTINS = [
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes',
  'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
  'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset',
  'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
  'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
  'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
  'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
  'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip',
]

// Combine and sort all suggestions
const ALL_SUGGESTIONS = [...new Set([...PYTHON_KEYWORDS, ...PYTHON_BUILTINS])].sort()

interface Suggestion {
  value: string
  type: 'keyword' | 'builtin'
}

interface AutocompleteProps {
  /** Current word being typed */
  word: string
  /** Position in pixels from left */
  left: number
  /** Position in pixels from top */
  top: number
  /** Called when a suggestion is selected */
  onSelect: (value: string) => void
  /** Called when autocomplete should be dismissed */
  onDismiss: () => void
  /** Whether the autocomplete is visible */
  visible: boolean
}

// Use a key-based reset pattern by making selectedIndex derived from word
function useSelectedIndex(word: string, maxIndex: number) {
  const [state, setState] = useState({ word, index: 0 })

  // If word changed, reset index
  const currentIndex = state.word === word ? state.index : 0
  const clampedIndex = Math.min(currentIndex, Math.max(0, maxIndex - 1))

  const setIndex = useCallback((updater: number | ((prev: number) => number)) => {
    setState(prev => ({
      word,
      index: typeof updater === 'function' ? updater(prev.word === word ? prev.index : 0) : updater,
    }))
  }, [word])

  return [clampedIndex, setIndex] as const
}

function AutocompleteInner({
  word,
  left,
  top,
  onSelect,
  onDismiss,
  visible,
}: AutocompleteProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Get filtered suggestions based on current word (memoized)
  const suggestions = useMemo<Suggestion[]>(() => {
    if (word.length < 2) return []
    return ALL_SUGGESTIONS
      .filter(s => s.toLowerCase().startsWith(word.toLowerCase()) && s.toLowerCase() !== word.toLowerCase())
      .slice(0, 8)
      .map(value => ({
        value,
        type: PYTHON_KEYWORDS.includes(value) ? 'keyword' as const : 'builtin' as const,
      }))
  }, [word])

  const [selectedIndex, setSelectedIndex] = useSelectedIndex(word, suggestions.length)

  // Scroll selected item into view
  useLayoutEffect(() => {
    const item = itemRefs.current[selectedIndex]
    if (item && listRef.current) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!visible || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + suggestions.length) % suggestions.length)
        break
      case 'Tab':
      case 'Enter':
        e.preventDefault()
        const selected = suggestions[selectedIndex]
        if (selected) {
          onSelect(selected.value)
        }
        break
      case 'Escape':
        e.preventDefault()
        onDismiss()
        break
    }
  }, [visible, suggestions, selectedIndex, onSelect, onDismiss, setSelectedIndex])

  // Attach keyboard listener
  useEffect(() => {
    if (visible && suggestions.length > 0) {
      window.addEventListener('keydown', handleKeyDown, true)
      return () => window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [visible, suggestions.length, handleKeyDown])

  if (!visible || suggestions.length === 0) return null

  return (
    <div
      className="autocomplete-panel"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
      ref={listRef}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.value}
          ref={el => { itemRefs.current[index] = el }}
          className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(suggestion.value)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className={`autocomplete-icon ${suggestion.type}`}>
            {suggestion.type === 'keyword' ? 'K' : 'F'}
          </span>
          <span className="autocomplete-value">
            <span className="autocomplete-match">{word}</span>
            <span className="autocomplete-rest">{suggestion.value.slice(word.length)}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

const Autocomplete = memo(AutocompleteInner)
export default Autocomplete
