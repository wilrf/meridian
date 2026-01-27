/**
 * Python Tokenizer
 *
 * A lightweight tokenizer for Python syntax highlighting.
 * Designed for the LightEditor component as a Monaco replacement.
 */

export interface Token {
  type: 'keyword' | 'function' | 'string' | 'number' | 'comment' | 'operator' | 'decorator' | 'text'
  value: string
}

// Python 3.x keywords
const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'match', 'None', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
])

// Python built-in functions
const BUILTINS = new Set([
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes',
  'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
  'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset',
  'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
  'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
  'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
  'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
  'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip',
])

// Operator characters
const OPERATORS = new Set('+-*/%=<>!&|^~@():[]{},.;')

/**
 * Tokenize Python source code
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < text.length) {
    const char = text[i]!

    // Decorator (@ at start of line or after whitespace)
    if (char === '@' && (i === 0 || /[\n\s]/.test(text[i - 1] || ''))) {
      let j = i + 1
      // Match decorator name
      while (j < text.length && /[a-zA-Z0-9_.]/.test(text[j]!)) {
        j++
      }
      if (j > i + 1) {
        tokens.push({ type: 'decorator', value: text.slice(i, j) })
        i = j
        continue
      }
    }

    // Comment (# to end of line)
    if (char === '#') {
      let end = text.indexOf('\n', i)
      if (end === -1) end = text.length
      tokens.push({ type: 'comment', value: text.slice(i, end) })
      i = end
      continue
    }

    // Triple-quoted strings (""" or ''')
    if (
      (char === '"' && text.slice(i, i + 3) === '"""') ||
      (char === "'" && text.slice(i, i + 3) === "'''")
    ) {
      const quote = text.slice(i, i + 3)
      let j = i + 3
      while (j < text.length) {
        if (text.slice(j, j + 3) === quote) {
          j += 3
          break
        }
        if (text[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: text.slice(i, j) })
      i = j
      continue
    }

    // Single/double quoted strings
    if (char === '"' || char === "'") {
      const quote = char
      let j = i + 1
      while (j < text.length && text[j] !== quote) {
        if (text[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: text.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Numbers (including floats, hex, binary, octal)
    if (/\d/.test(char) || (char === '.' && /\d/.test(text[i + 1] || ''))) {
      let j = i
      // Check for hex, binary, octal prefix
      if (char === '0' && /[xXbBoO]/.test(text[i + 1] || '')) {
        j += 2
        while (j < text.length && /[0-9a-fA-F_]/.test(text[j]!)) j++
      } else {
        // Regular number (including floats with e notation)
        while (j < text.length && /[\d._eE+-]/.test(text[j]!)) {
          // Handle e+ or e- notation
          if (/[eE]/.test(text[j]!) && /[+-]/.test(text[j + 1] || '')) {
            j += 2
          } else {
            j++
          }
        }
      }
      tokens.push({ type: 'number', value: text.slice(i, j) })
      i = j
      continue
    }

    // Identifiers (keywords, builtins, variables)
    if (/[a-zA-Z_]/.test(char)) {
      let j = i
      while (j < text.length && /[a-zA-Z0-9_]/.test(text[j]!)) j++
      const word = text.slice(i, j)
      let type: Token['type'] = 'text'
      if (KEYWORDS.has(word)) {
        type = 'keyword'
      } else if (BUILTINS.has(word)) {
        type = 'function'
      }
      tokens.push({ type, value: word })
      i = j
      continue
    }

    // Operators and punctuation
    if (OPERATORS.has(char)) {
      // Check for multi-character operators
      const twoChar = text.slice(i, i + 2)
      const threeChar = text.slice(i, i + 3)

      if (['**=', '//=', '>>=', '<<=', '...'].includes(threeChar)) {
        tokens.push({ type: 'operator', value: threeChar })
        i += 3
        continue
      }

      if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '**', '//', '<<', '>>', '->'].includes(twoChar)) {
        tokens.push({ type: 'operator', value: twoChar })
        i += 2
        continue
      }

      tokens.push({ type: 'operator', value: char })
      i++
      continue
    }

    // Whitespace and other text
    tokens.push({ type: 'text', value: char })
    i++
  }

  return tokens
}

/**
 * Get CSS class for a token type
 */
export function getTokenClass(type: Token['type']): string {
  switch (type) {
    case 'keyword':
      return 'syn-keyword'
    case 'function':
      return 'syn-function'
    case 'string':
      return 'syn-string'
    case 'number':
      return 'syn-number'
    case 'comment':
      return 'syn-comment'
    case 'operator':
      return 'syn-operator'
    case 'decorator':
      return 'syn-decorator'
    default:
      return ''
  }
}
