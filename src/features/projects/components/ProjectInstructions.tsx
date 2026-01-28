'use client'

import Link from 'next/link'
import { memo, useRef, useState, useEffect, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import React from 'react'

interface ProjectInstructionsProps {
  /** Markdown content to render */
  content: string
  /** Callback when scrolled past the top */
  onScrollChange?: (scrolledPast: boolean) => void
}

// Custom Blockquote component to handle alerts
const Blockquote = ({ children }: { children: ReactNode }) => {
  const getAlertType = (nodes: ReactNode): { type: string; content: ReactNode } | null => {
    const childrenArray = React.Children.toArray(nodes)
    if (childrenArray.length === 0) return null

    const firstChild = childrenArray[0]

    if (React.isValidElement(firstChild) && firstChild.type === 'p') {
      const pChildren = React.Children.toArray(firstChild.props.children)
      if (pChildren.length > 0 && typeof pChildren[0] === 'string') {
        const text = pChildren[0]
        const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i)

        if (match && match[1]) {
          const type = match[1].toUpperCase()
          const newText = text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s?/i, '')
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
      <div className={`${styles.bg} border-l-4 ${styles.border} p-3 my-4 rounded-r-lg shadow-sm`}>
        <div className={`font-bold ${styles.text} flex items-center gap-2 mb-1 text-xs uppercase tracking-wide`}>
          <span>{styles.icon}</span>
          {alert.type}
        </div>
        <div className="text-[var(--text-secondary)] text-sm">
          {alert.content}
        </div>
      </div>
    )
  }

  return (
    <blockquote className="border-l-4 border-accent pl-3 my-4 italic text-[var(--text-secondary)] bg-[var(--bg-subtle)] py-2 pr-3 rounded-r-lg text-sm">
      {children}
    </blockquote>
  )
}

// Compact markdown components for sidebar-style instructions panel
const instructionComponents: Components = {
  // Handle code blocks
  pre: ({ children }) => {
    // Extract language and text from code element
    let language = ''
    let codeText = ''

    const extractCodeInfo = (child: React.ReactNode): void => {
      if (child && typeof child === 'object' && 'props' in child && child.props) {
        const className = child.props.className as string | undefined
        if (className?.includes('language-')) {
          const match = className.match(/language-(\w+)/)
          if (match?.[1]) language = match[1]
        }
        const extractText = (node: React.ReactNode): void => {
          if (typeof node === 'string') {
            codeText += node
          } else if (Array.isArray(node)) {
            node.forEach(extractText)
          } else if (node && typeof node === 'object' && 'props' in node && node.props) {
            extractText(node.props.children)
          }
        }
        extractText(child.props.children)
      }
    }

    if (Array.isArray(children)) {
      children.forEach(extractCodeInfo)
    } else {
      extractCodeInfo(children)
    }

    // Fallback to standard pre tag for stability

    return (
      <pre className="bg-[var(--editor-bg)] text-[var(--editor-text)] p-3 rounded-lg overflow-x-auto my-3 text-xs">
        <code>{codeText.trim()}</code>
      </pre>
    )
  },

  // Compact headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3 first:mt-0 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-2 border-b border-[var(--border-subtle)] pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-[var(--text-primary)] mt-3 mb-1">
      {children}
    </h4>
  ),

  // Compact paragraphs
  p: ({ children }) => (
    <p className="text-[var(--text-secondary)] leading-relaxed my-2 text-sm">
      {children}
    </p>
  ),

  // Compact lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-2 text-[var(--text-secondary)] text-sm marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-2 text-[var(--text-secondary)] text-sm marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-sm">{children}</li>
  ),

  // Inline code
  code: ({ children, className }) => {
    if (className?.includes('language-')) {
      return <code className={className}>{children}</code>
    }
    return (
      <code className="bg-[var(--bg-subtle)] text-accent px-1 py-0.5 rounded text-[0.85em] font-mono border border-[var(--border-default)]">
        {children}
      </code>
    )
  },

  // Blockquotes with alerts
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,

  // Horizontal rules
  hr: () => <hr className="my-6 border-[var(--border-subtle)]" />,

  // Details/summary for progressive disclosure (hints)
  details: ({ children }) => (
    <details className="my-3 group">
      {children}
    </details>
  ),
  summary: ({ children }) => (
    <summary className="cursor-pointer text-sm font-medium text-[var(--accent-base)] hover:text-[var(--accent-strong)] list-none flex items-center gap-2">
      <svg
        className="w-4 h-4 transition-transform group-open:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      {children}
    </summary>
  ),

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-[var(--border-default)]">
      <table className="min-w-full divide-y divide-[var(--border-default)] text-xs">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 bg-[var(--bg-subtle)] text-left text-xs font-semibold text-[var(--text-secondary)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
      {children}
    </td>
  ),

  // Links
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-accent hover:text-accent-strong underline decoration-accent/30 hover:decoration-accent transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),

  // Strong/bold text
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--text-primary)]">
      {children}
    </strong>
  ),
}

/**
 * ProjectInstructions Component
 *
 * Renders project README markdown content in a scrollable panel.
 * Features:
 * - Compact markdown styling for sidebar display
 * - Independent scroll container
 * - Tracks scroll position for mobile floating button
 * - Progressive disclosure with details/summary
 */
function ProjectInstructionsComponent({
  content,
  onScrollChange,
}: ProjectInstructionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasScrolledPast, setHasScrolledPast] = useState(false)

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onScrollChange) return

    const handleScroll = () => {
      const scrolledPast = container.scrollTop > 100
      if (scrolledPast !== hasScrolledPast) {
        setHasScrolledPast(scrolledPast)
        onScrollChange(scrolledPast)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasScrolledPast, onScrollChange])

  return (
    <div className="project-panel project-instructions-panel">
      <div
        ref={containerRef}
        className="project-instructions-content"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)] hover:text-accent transition-colors mb-6 group w-fit"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={instructionComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

const ProjectInstructions = memo(ProjectInstructionsComponent)
export default ProjectInstructions
