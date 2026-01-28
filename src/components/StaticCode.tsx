'use client'

import React, { useMemo } from 'react'
import { tokenize, getTokenClass } from '@/lib/python-tokenizer'

interface StaticCodeProps {
  /** The code content */
  code: string
  /** Language (only 'python' uses our tokenizer) */
  language?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * StaticCode Component
 *
 * Renders static (non-editable) code with syntax highlighting.
 * Uses the same Python tokenizer as LightEditor for consistent highlighting.
 * Features line numbers and a language header for better readability.
 */
export default function StaticCode({ code, language = 'python', className = '' }: StaticCodeProps) {
  const lines = useMemo(() => code.split('\n'), [code])

  const highlightedLines = useMemo((): React.ReactNode[][] => {
    if (language !== 'python') {
      // Non-Python: just return each line as a single span
      return lines.map((line, i) => [<span key={i}>{line}</span>])
    }

    // Tokenize the full code, then split into lines
    const tokens = tokenize(code)
    const result: React.ReactNode[][] = []
    let currentLine: React.ReactNode[] = []
    let tokenIndex = 0

    for (const token of tokens) {
      // Handle tokens that span multiple lines (like multiline strings)
      const parts = token.value.split('\n')

      parts.forEach((part, i) => {
        if (i > 0) {
          // Start a new line
          result.push(currentLine)
          currentLine = []
        }

        if (part) {
          const synClass = getTokenClass(token.type)
          if (!synClass) {
            currentLine.push(<span key={`${tokenIndex}-${i}`}>{part}</span>)
          } else {
            currentLine.push(
              <span key={`${tokenIndex}-${i}`} className={synClass}>
                {part}
              </span>
            )
          }
        }
      })
      tokenIndex++
    }

    // Don't forget the last line
    if (currentLine.length > 0 || result.length < lines.length) {
      result.push(currentLine)
    }

    return result
  }, [code, language, lines])

  const languageLabel = language === 'python' ? 'Python' : language

  return (
    <div className={`static-code-wrapper ${className}`}>
      {/* Header */}
      <div className="static-code-header">
        <span className="static-code-lang">{languageLabel}</span>
      </div>

      {/* Code area */}
      <div className="static-code-body">
        {/* Line numbers */}
        <div className="static-code-gutter" aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i} className="static-code-line-number">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code content */}
        <pre className="static-code-content">
          <code>
            {highlightedLines.map((lineElements, i) => (
              <div key={i} className="static-code-line">
                {lineElements.length > 0 ? lineElements : '\u200B'}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
