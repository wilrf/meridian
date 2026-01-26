'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkCodeMeta } from '@/lib/remark-code-meta'
import rehypeHighlight from 'rehype-highlight'
import { rehypeCodeBlocks } from '@/lib/rehype-code-blocks'
import type { Components } from 'react-markdown'
import dynamic from 'next/dynamic'
import ErrorBoundary from './ErrorBoundary'
import { LessonProvider } from '@/lib/lesson-context'
import React, { ReactNode } from 'react'

// Dynamic import CodeRunner to avoid SSR issues
const CodeRunner = dynamic(() => import('./CodeRunner'), {
  ssr: false,
  loading: () => (
    <div className="my-4 h-48 bg-[var(--bg-subtle)] animate-pulse rounded-xl" />
  ),
})

interface LessonRendererProps {
  content: string
  lessonId: string
}

export default function LessonRenderer({ content, lessonId }: LessonRendererProps) {
  return (
    <LessonProvider lessonId={lessonId}>
      <article className="prose prose-neutral max-w-none prose-headings:font-sans prose-headings:text-[var(--text-primary)] prose-p:font-prose prose-p:text-lg prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-a:text-accent hover:prose-a:text-accent-strong prose-li:font-prose prose-li:text-[var(--text-secondary)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkCodeMeta]}
          rehypePlugins={[rehypeHighlight, rehypeCodeBlocks]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </article>
    </LessonProvider>
  )
}

// Custom Blockquote component to handle alerts
const Blockquote = ({ children }: { children: ReactNode }) => {
  // Helper to extract text from children to check for alert patterns
  const getAlertType = (nodes: ReactNode): { type: string; content: ReactNode } | null => {
    const childrenArray = React.Children.toArray(nodes)
    if (childrenArray.length === 0) return null

    const firstChild = childrenArray[0]
    
    // Check if first child is a paragraph (common in markdown)
    if (React.isValidElement(firstChild) && firstChild.type === 'p') {
      const pChildren = React.Children.toArray(firstChild.props.children)
      if (pChildren.length > 0 && typeof pChildren[0] === 'string') {
        const text = pChildren[0]
        const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i)
        
        if (match && match[1]) {
          const type = match[1].toUpperCase()
          // Remove the marker from the text
          const newText = text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s?/i, '')
          
          // Reconstruct the paragraph without the marker
          const newPChildren = [newText, ...pChildren.slice(1)]
          const newFirstChild = React.cloneElement(firstChild as React.ReactElement, {}, newPChildren)
          
          return {
            type,
            content: [newFirstChild, ...childrenArray.slice(1)]
          }
        }
      }
    }
    
    return null
  }

  const alert = getAlertType(children)

  if (alert) {
    const styles = {
      NOTE: { bg: 'bg-info-subtle', border: 'border-info', text: 'text-info-strong', icon: 'ℹ️' },
      TIP: { bg: 'bg-success-subtle', border: 'border-success', text: 'text-success-strong', icon: '💡' },
      IMPORTANT: { bg: 'bg-accent-subtle', border: 'border-accent', text: 'text-accent', icon: '⚡' },
      WARNING: { bg: 'bg-warning-subtle', border: 'border-warning', text: 'text-warning-strong', icon: '⚠️' },
      CAUTION: { bg: 'bg-error-subtle', border: 'border-error', text: 'text-error-strong', icon: '🚫' },
    }[alert.type] || { bg: 'bg-[var(--bg-subtle)]', border: 'border-[var(--border-strong)]', text: 'text-[var(--text-secondary)]', icon: '📝' }

    return (
      <div className={`${styles.bg} border-l-4 ${styles.border} p-4 my-6 rounded-r-lg shadow-sm`}>
        <div className={`font-bold ${styles.text} flex items-center gap-2 mb-1 text-sm uppercase tracking-wide`}>
          <span>{styles.icon}</span>
          {alert.type}
        </div>
        <div className="text-[var(--text-secondary)] font-prose">
          {alert.content}
        </div>
      </div>
    )
  }

  // Default blockquote style
  return (
    <blockquote className="border-l-4 border-accent pl-4 my-6 italic text-[var(--text-secondary)] bg-[var(--bg-subtle)] py-3 pr-4 rounded-r-lg font-prose text-lg">
      {children}
    </blockquote>
  )
}

// Custom markdown components
const markdownComponents: Components = {
  // Override pre to handle interactive code blocks
  pre: ({ children, node, ...props }) => {
    // Extract data attributes from the hast node properties
    // react-markdown passes the node but doesn't spread data-* attributes as props directly
    const nodeProps = (node as { properties?: Record<string, unknown> })?.properties ?? {}

    // Check if this is an interactive code block (check both kebab and camel case)
    const dataCodeBlock = nodeProps['data-code-block'] ?? nodeProps['dataCodeBlock']
    const exerciseId = (nodeProps['data-exercise-id'] ?? nodeProps['dataExerciseId']) as
      | string
      | undefined
    const expected = (nodeProps['data-expected'] ?? nodeProps['dataExpected']) as
      | string
      | undefined
    const validate = (nodeProps['data-validate'] ?? nodeProps['dataValidate']) as
      | string
      | undefined
    const hintsJson = (nodeProps['data-hints'] ?? nodeProps['dataHints']) as
      | string
      | undefined
    const hints: string[] = hintsJson ? JSON.parse(hintsJson) : []

    if (dataCodeBlock === 'true') {
      // Extract text content from the code element
      let codeText = ''
      const extractText = (child: React.ReactNode): void => {
        if (typeof child === 'string') {
          codeText += child
        } else if (Array.isArray(child)) {
          child.forEach(extractText)
        } else if (
          child &&
          typeof child === 'object' &&
          'props' in child &&
          child.props
        ) {
          extractText(child.props.children)
        }
      }
      extractText(children)

      return (
        <ErrorBoundary>
          <CodeRunner
            initialCode={codeText.trim()}
            exerciseId={exerciseId}
            expected={expected}
            validate={validate}
            hints={hints}
          />
        </ErrorBoundary>
      )
    }

    // Regular code block
    return (
      <pre
        className="bg-[var(--editor-bg)] text-[var(--editor-text)] p-4 rounded-xl overflow-x-auto shadow-soft my-6"
        {...props}
      >
        {children}
      </pre>
    )
  },

  // Style headings
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold text-[var(--text-primary)] mt-10 mb-6 first:mt-0 tracking-tight font-sans">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-[var(--text-primary)] mt-10 mb-4 border-b border-[var(--border-default)] pb-2 font-sans">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-3 font-sans">{children}</h3>
  ),

  // Style paragraphs
  p: ({ children }) => <p className="text-[var(--text-secondary)] leading-relaxed my-4 font-prose text-lg">{children}</p>,

  // Style lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-2 my-4 text-[var(--text-secondary)] font-prose text-lg marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-2 my-4 text-[var(--text-secondary)] font-prose text-lg marker:text-accent">
      {children}
    </ol>
  ),

  // Style inline code
  code: ({ children, className }) => {
    // If it has a language class, it's a code block (handled by pre)
    if (className?.includes('language-')) {
      return <code className={className}>{children}</code>
    }
    // Inline code
    return (
      <code className="bg-[var(--bg-subtle)] text-accent px-1.5 py-0.5 rounded-md text-[0.9em] font-mono border border-[var(--border-default)] font-medium">
        {children}
      </code>
    )
  },

  // Style blockquotes (handled by custom component)
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,

  // Style horizontal rules
  hr: () => <hr className="my-10 border-[var(--border-default)]" />,

  // Style tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-[var(--border-default)] shadow-soft">
      <table className="min-w-full divide-y divide-[var(--border-default)]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 bg-[var(--bg-subtle)] text-left text-sm font-semibold text-[var(--text-secondary)] font-sans uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)] font-mono">
      {children}
    </td>
  ),
}
