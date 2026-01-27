'use client'

import { useMemo } from 'react'
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
 */
export default function StaticCode({ code, language = 'python', className = '' }: StaticCodeProps) {
  const highlightedCode = useMemo(() => {
    // Only tokenize Python - other languages get plain text
    if (language !== 'python') {
      return <code>{code}</code>
    }

    const tokens = tokenize(code)

    return (
      <code>
        {tokens.map((token, i) => {
          const synClass = getTokenClass(token.type)
          if (!synClass) {
            return <span key={i}>{token.value}</span>
          }
          return (
            <span key={i} className={synClass}>
              {token.value}
            </span>
          )
        })}
      </code>
    )
  }, [code, language])

  return (
    <pre className={`static-code ${className}`}>
      {highlightedCode}
    </pre>
  )
}
