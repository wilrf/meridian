import type { editor } from 'monaco-editor'

/**
 * Meridian "Ink" Theme
 * 
 * A sophisticated dark theme with deep plum-black backgrounds and warm,
 * muted syntax colors. Designed for extended coding sessions with
 * reduced eye strain while maintaining excellent readability.
 * 
 * Color Philosophy:
 * - Background: Deep plum-black (#0A0910) for depth
 * - Text: Warm off-white (#E0DDD6) for comfort
 * - Accents: Muted, warm tones that don't compete for attention
 * - Highlights: Subtle purple undertones for cohesion
 */

// Theme identifier
export const inkThemeName = 'meridian-ink'

// Color palette - matches CSS variables in globals.css
// Updated for better contrast on dark background
const colors = {
  // Backgrounds
  bg: '#0A0910',
  bgHighlight: '#13111A',
  bgSelection: '#2D2640',
  bgSelectionInactive: '#2D264080',
  bgSelectionHighlight: '#2D264040',
  
  // Text - increased brightness for better visibility
  text: '#E8E5DE',          // Brighter off-white
  textMuted: '#9089A0',     // Brighter muted (was #6E6880)
  textSubtle: '#C4BED0',    // Brighter subtle
  
  // Syntax - increased saturation and brightness for visibility
  keyword: '#DDB8F0',       // Brighter lavender (was #C9A0DC)
  string: '#B8D4A8',        // Brighter sage (was #A8C4A0)
  number: '#E4C8A6',        // Brighter gold (was #D4B896)
  function: '#A8CBE4',      // Brighter blue (was #93B5CF)
  comment: '#9089A0',       // Brighter comment (was #6E6880)
  operator: '#D0C0E0',      // Brighter purple (was #B8A8C8)
  decorator: '#D4BC98',     // Brighter gold (was #B8A07E)
  class: '#E4C8A6',         // Brighter gold (was #D4B896)
  constant: '#DDB8F0',      // Brighter lavender (was #C9A0DC)
  parameter: '#DCD0B8',     // Brighter beige (was #C4B8A0)
  punctuation: '#C4BED0',   // Brighter gray (was #A9A3B3)
  
  // UI elements
  cursor: '#D4C5A9',       // Champagne
  lineNumber: '#6E6880',
  lineNumberActive: '#A9A3B3',
  indentGuide: '#1A1724',
  indentGuideActive: '#2A2533',
  whitespace: '#2A2533',
  bracketMatch: '#D4C5A9',
  
  // Scrollbar
  scrollbar: '#3D364980',
  scrollbarHover: '#56506B80',
  scrollbarActive: '#56506B',
} as const

/**
 * Monaco theme definition
 */
export const inkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: false,
  rules: [
    // Base text
    { token: '', foreground: colors.text.slice(1), background: colors.bg.slice(1) },
    
    // Comments - italic for distinction
    { token: 'comment', foreground: colors.comment.slice(1), fontStyle: 'italic' },
    { token: 'comment.line', foreground: colors.comment.slice(1), fontStyle: 'italic' },
    { token: 'comment.block', foreground: colors.comment.slice(1), fontStyle: 'italic' },
    { token: 'comment.documentation', foreground: colors.comment.slice(1), fontStyle: 'italic' },
    
    // Keywords - control flow, declarations
    { token: 'keyword', foreground: colors.keyword.slice(1) },
    { token: 'keyword.control', foreground: colors.keyword.slice(1) },
    { token: 'keyword.control.flow', foreground: colors.keyword.slice(1) },
    { token: 'keyword.operator', foreground: colors.operator.slice(1) },
    { token: 'keyword.other', foreground: colors.keyword.slice(1) },
    
    // Storage types (def, class, etc.)
    { token: 'storage', foreground: colors.keyword.slice(1) },
    { token: 'storage.type', foreground: colors.keyword.slice(1) },
    { token: 'storage.modifier', foreground: colors.keyword.slice(1) },
    
    // Strings - all variations
    { token: 'string', foreground: colors.string.slice(1) },
    { token: 'string.quoted', foreground: colors.string.slice(1) },
    { token: 'string.quoted.single', foreground: colors.string.slice(1) },
    { token: 'string.quoted.double', foreground: colors.string.slice(1) },
    { token: 'string.quoted.triple', foreground: colors.string.slice(1) },
    { token: 'string.template', foreground: colors.string.slice(1) },
    { token: 'string.regexp', foreground: colors.string.slice(1) },
    
    // Numbers
    { token: 'number', foreground: colors.number.slice(1) },
    { token: 'number.float', foreground: colors.number.slice(1) },
    { token: 'number.hex', foreground: colors.number.slice(1) },
    { token: 'number.octal', foreground: colors.number.slice(1) },
    { token: 'number.binary', foreground: colors.number.slice(1) },
    { token: 'constant.numeric', foreground: colors.number.slice(1) },
    
    // Functions
    { token: 'function', foreground: colors.function.slice(1) },
    { token: 'function.call', foreground: colors.function.slice(1) },
    { token: 'entity.name.function', foreground: colors.function.slice(1) },
    { token: 'support.function', foreground: colors.function.slice(1) },
    { token: 'support.function.builtin', foreground: colors.function.slice(1) },
    { token: 'meta.function-call', foreground: colors.function.slice(1) },
    
    // Classes and types
    { token: 'class', foreground: colors.class.slice(1) },
    { token: 'type', foreground: colors.class.slice(1) },
    { token: 'entity.name.class', foreground: colors.class.slice(1) },
    { token: 'entity.name.type', foreground: colors.class.slice(1) },
    { token: 'support.class', foreground: colors.class.slice(1) },
    { token: 'support.type', foreground: colors.class.slice(1) },
    
    // Variables
    { token: 'variable', foreground: colors.text.slice(1) },
    { token: 'variable.parameter', foreground: colors.parameter.slice(1) },
    { token: 'variable.other', foreground: colors.text.slice(1) },
    { token: 'variable.language', foreground: colors.constant.slice(1) },
    
    // Operators
    { token: 'operator', foreground: colors.operator.slice(1) },
    { token: 'keyword.operator', foreground: colors.operator.slice(1) },
    
    // Constants
    { token: 'constant', foreground: colors.constant.slice(1) },
    { token: 'constant.language', foreground: colors.constant.slice(1) },
    { token: 'constant.language.boolean', foreground: colors.constant.slice(1) },
    { token: 'constant.language.null', foreground: colors.constant.slice(1) },
    { token: 'constant.other', foreground: colors.constant.slice(1) },
    
    // Built-ins
    { token: 'builtin', foreground: colors.function.slice(1) },
    { token: 'support.variable', foreground: colors.function.slice(1) },
    
    // Decorators
    { token: 'decorator', foreground: colors.decorator.slice(1) },
    { token: 'meta.decorator', foreground: colors.decorator.slice(1) },
    { token: 'tag.decorator', foreground: colors.decorator.slice(1) },
    { token: 'punctuation.decorator', foreground: colors.decorator.slice(1) },
    
    // Punctuation
    { token: 'punctuation', foreground: colors.punctuation.slice(1) },
    { token: 'bracket', foreground: colors.punctuation.slice(1) },
    { token: 'delimiter', foreground: colors.punctuation.slice(1) },
    { token: 'delimiter.bracket', foreground: colors.punctuation.slice(1) },
    { token: 'delimiter.parenthesis', foreground: colors.punctuation.slice(1) },
    { token: 'delimiter.square', foreground: colors.punctuation.slice(1) },
    { token: 'delimiter.curly', foreground: colors.punctuation.slice(1) },
    
    // Python specific tokens
    { token: 'keyword.control.flow.python', foreground: colors.keyword.slice(1) },
    { token: 'constant.language.python', foreground: colors.constant.slice(1) },
    { token: 'storage.type.function.python', foreground: colors.keyword.slice(1) },
    { token: 'storage.type.class.python', foreground: colors.keyword.slice(1) },
    { token: 'meta.function.python', foreground: colors.function.slice(1) },
    { token: 'entity.name.function.python', foreground: colors.function.slice(1) },
    
    // Special
    { token: 'invalid', foreground: 'D98B8B' },
    { token: 'invalid.illegal', foreground: 'D98B8B' },
  ],
  colors: {
    // Editor chrome
    'editor.background': colors.bg,
    'editor.foreground': colors.text,
    
    // Line highlighting
    'editor.lineHighlightBackground': colors.bgHighlight,
    'editor.lineHighlightBorder': '#00000000',
    
    // Selection
    'editor.selectionBackground': colors.bgSelection,
    'editor.inactiveSelectionBackground': colors.bgSelectionInactive,
    'editor.selectionHighlightBackground': colors.bgSelectionHighlight,
    
    // Word highlight
    'editor.wordHighlightBackground': colors.bgSelectionHighlight,
    'editor.wordHighlightStrongBackground': colors.bgSelection,
    
    // Find matches
    'editor.findMatchBackground': colors.bgSelection,
    'editor.findMatchHighlightBackground': colors.bgSelectionHighlight,
    'editor.findMatchBorder': colors.cursor,
    
    // Line numbers
    'editorLineNumber.foreground': colors.lineNumber,
    'editorLineNumber.activeForeground': colors.lineNumberActive,
    
    // Cursor
    'editorCursor.foreground': colors.cursor,
    'editorCursor.background': colors.bg,
    
    // Indent guides
    'editorIndentGuide.background': colors.indentGuide,
    'editorIndentGuide.activeBackground': colors.indentGuideActive,
    
    // Whitespace
    'editorWhitespace.foreground': colors.whitespace,
    
    // Bracket matching
    'editorBracketMatch.background': `${colors.bgSelection}60`,
    'editorBracketMatch.border': colors.bracketMatch,
    
    // Bracket pair colorization
    'editorBracketHighlight.foreground1': colors.punctuation,
    'editorBracketHighlight.foreground2': colors.function,
    'editorBracketHighlight.foreground3': colors.keyword,
    
    // Gutter
    'editorGutter.background': colors.bg,
    'editorGutter.addedBackground': '#8BB396',
    'editorGutter.modifiedBackground': '#D4B896',
    'editorGutter.deletedBackground': '#D98B8B',
    
    // Scrollbar
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': colors.scrollbar,
    'scrollbarSlider.hoverBackground': colors.scrollbarHover,
    'scrollbarSlider.activeBackground': colors.scrollbarActive,
    
    // Overview ruler
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.background': colors.bg,
    
    // Widgets
    'editorWidget.background': colors.bgHighlight,
    'editorWidget.border': colors.indentGuide,
    'editorWidget.foreground': colors.text,
    
    // Suggest widget (autocomplete)
    'editorSuggestWidget.background': colors.bgHighlight,
    'editorSuggestWidget.border': colors.indentGuide,
    'editorSuggestWidget.foreground': colors.text,
    'editorSuggestWidget.selectedBackground': colors.bgSelection,
    'editorSuggestWidget.highlightForeground': colors.cursor,
    
    // Hover widget
    'editorHoverWidget.background': colors.bgHighlight,
    'editorHoverWidget.border': colors.indentGuide,
    'editorHoverWidget.foreground': colors.text,
    
    // Error/Warning
    'editorError.foreground': '#D98B8B',
    'editorWarning.foreground': '#D4B896',
    'editorInfo.foreground': '#93B5CF',
    
    // Input (find/replace)
    'input.background': colors.bg,
    'input.border': colors.indentGuide,
    'input.foreground': colors.text,
    'input.placeholderForeground': colors.textMuted,
    'inputOption.activeBackground': colors.bgSelection,
    'inputOption.activeBorder': colors.cursor,
    
    // Focus border
    'focusBorder': colors.cursor,
  },
}

export default inkTheme
