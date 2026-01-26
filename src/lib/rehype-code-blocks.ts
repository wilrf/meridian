import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

export interface CodeBlockMeta {
  lang: string
  runnable: boolean
  exerciseId: string | null
  expected: string | null
  validate: string | null
  hints: string[]
}

/**
 * Parse a quoted value from a meta string, handling escaped quotes
 * Returns the unescaped value or null if not found
 */
function parseQuotedValue(metaString: string, key: string): string | null {
  // Match key="value" or key='value', handling escaped quotes
  // Pattern: key="(content with possible \"escaped\" quotes)"
  const doubleQuotePattern = new RegExp(`${key}="((?:[^"\\\\]|\\\\.)*)"`)
  const singleQuotePattern = new RegExp(`${key}='((?:[^'\\\\]|\\\\.)*)'`)

  const doubleMatch = metaString.match(doubleQuotePattern)
  if (doubleMatch?.[1]) {
    // Unescape any escaped quotes
    return doubleMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }

  const singleMatch = metaString.match(singleQuotePattern)
  if (singleMatch?.[1]) {
    return singleMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
  }

  return null
}

/**
 * Check if a flag exists in the meta string (not part of a quoted value)
 */
function hasFlag(metaString: string, flag: string): boolean {
  // Remove all quoted values to avoid false matches inside strings
  const withoutQuotes = metaString.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'(?:[^'\\]|\\.)*'/g, "''")
  // Check for the flag as a whole word
  return new RegExp(`\\b${flag}\\b`).test(withoutQuotes)
}

/**
 * Extract language from meta string (first word before any flags)
 */
function extractLanguage(metaString: string): string {
  const match = metaString.match(/^(\w+)/)
  return match?.[1] ?? ''
}

/**
 * Parse code block meta string
 * Examples:
 *   "python runnable" → { lang: "python", runnable: true }
 *   "python exercise id=\"1.1\" expected=\"42\"" → { lang: "python", exerciseId: "1.1", expected: "42" }
 *   "python exercise id=\"1.1\" hints=\"Use a loop|Try range()\"" → { ..., hints: ["Use a loop", "Try range()"] }
 */
export function parseCodeMeta(metaString: string): CodeBlockMeta {
  const lang = extractLanguage(metaString)

  const meta: CodeBlockMeta = {
    lang,
    runnable: false,
    exerciseId: null,
    expected: null,
    validate: null,
    hints: [],
  }

  // Check for runnable flag (not inside quotes)
  if (hasFlag(metaString, 'runnable')) {
    meta.runnable = true
  }

  // Check for exercise flag (not inside quotes)
  if (hasFlag(metaString, 'exercise')) {
    meta.runnable = true // exercises are always runnable

    // Parse id="value" with escaped quote support
    meta.exerciseId = parseQuotedValue(metaString, 'id')

    // Parse expected="value"
    meta.expected = parseQuotedValue(metaString, 'expected')

    // Parse validate="value" (may contain code with quotes)
    meta.validate = parseQuotedValue(metaString, 'validate')

    // Parse hints="hint1|hint2|hint3"
    const hintsValue = parseQuotedValue(metaString, 'hints')
    if (hintsValue) {
      // Split by pipe and filter out empty strings
      meta.hints = hintsValue
        .split('|')
        .map((h) => h.trim())
        .filter(Boolean)
    }
  }

  return meta
}

/**
 * Rehype plugin that transforms code blocks with meta strings into
 * custom components with data attributes for client-side enhancement
 */
export function rehypeCodeBlocks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // Look for <pre><code> elements
      if (node.tagName !== 'pre') return

      const codeElement = node.children.find(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'code'
      )

      if (!codeElement) return

      // Get the class name (e.g., "language-python")
      const className = codeElement.properties?.className
      let lang = ''
      if (Array.isArray(className)) {
        const langClass = className.find(
          (c): c is string => typeof c === 'string' && c.startsWith('language-')
        )
        if (langClass) {
          lang = langClass.replace('language-', '')
        }
      }

      // Get meta string from data attribute (set by remark-code-meta plugin)
      const metaString = (codeElement.properties?.['data-meta'] as string) ?? ''

      // Parse the meta string
      const fullMeta = `${lang} ${metaString}`.trim()
      const meta = parseCodeMeta(fullMeta)

      // Only transform Python code blocks that are runnable or exercises
      if (meta.lang !== 'python' || (!meta.runnable && !meta.exerciseId)) {
        return
      }

      // Add data attributes to the pre element for client-side enhancement
      node.properties = {
        ...node.properties,
        'data-code-block': 'true',
        'data-lang': meta.lang,
        'data-runnable': meta.runnable ? 'true' : 'false',
        'data-exercise-id': meta.exerciseId ?? undefined,
        'data-expected': meta.expected ?? undefined,
        'data-validate': meta.validate ?? undefined,
        'data-hints': meta.hints.length > 0 ? JSON.stringify(meta.hints) : undefined,
        className: [
          ...(Array.isArray(node.properties?.className)
            ? node.properties.className
            : []),
          'interactive-code-block',
        ],
      }
    })
  }
}

export default rehypeCodeBlocks
