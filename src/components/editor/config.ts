import type { editor } from 'monaco-editor'

/**
 * Monaco Editor Configuration
 * 
 * Centralized configuration for consistent editor behavior across the app.
 * Optimized for Python code editing with performance in mind.
 */

// CDN configuration for Monaco loader
// Version must match the version bundled by @monaco-editor/react
export const MONACO_CDN = {
  base: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
  version: '0.55.1',
} as const

/**
 * Base editor options optimized for code learning
 * These options prioritize readability and smooth interaction
 */
export const baseEditorOptions: editor.IStandaloneEditorConstructionOptions = {
  // Typography - matches design system
  fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", monospace',
  fontSize: 14,
  lineHeight: 24,
  fontLigatures: true,
  fontWeight: '400',
  
  // Spacing
  padding: { top: 16, bottom: 16 },
  lineDecorationsWidth: 16,
  lineNumbersMinChars: 3,
  
  // Appearance - clean and minimal
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'line',
  lineNumbers: 'on',
  glyphMargin: false,
  folding: false,
  renderWhitespace: 'none',
  guides: {
    indentation: true,
    bracketPairs: false,
    highlightActiveIndentation: true,
  },
  
  // Cursor - smooth and visible
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  cursorStyle: 'line',
  cursorWidth: 2,
  
  // Scrolling - butter smooth
  smoothScrolling: true,
  mouseWheelScrollSensitivity: 1,
  fastScrollSensitivity: 5,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    verticalSliderSize: 10,
    horizontalSliderSize: 10,
    alwaysConsumeMouseWheel: false,
  },
  
  // Editing behavior
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  wrappingStrategy: 'advanced',
  autoClosingBrackets: 'languageDefined',
  autoClosingQuotes: 'languageDefined',
  autoIndent: 'full',
  formatOnPaste: false,
  formatOnType: false,
  
  // IntelliSense - helpful but not intrusive
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  parameterHints: { enabled: true },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: 'currentDocument',
  suggest: {
    showIcons: true,
    showStatusBar: false,
    preview: true,
    previewMode: 'subwordSmart',
    filterGraceful: true,
    localityBonus: true,
    shareSuggestSelections: false,
    snippetsPreventQuickSuggestions: false,
  },
  
  // Performance optimizations
  automaticLayout: true,
  renderValidationDecorations: 'off',
  occurrencesHighlight: 'off',
  selectionHighlight: false,
  codeLens: false,
  // @ts-expect-error - Monaco types inconsistency
  lightbulb: { enabled: 'off' },
  stickyScroll: { enabled: false },
  inlayHints: { enabled: 'off' },
  bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
  
  // UI elements
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  contextmenu: true,
  links: true,
  
  // Hover - delayed to avoid distraction
  hover: {
    enabled: true,
    delay: 500,
    sticky: false,
  },
  
  // Accessibility
  accessibilitySupport: 'auto',
  ariaLabel: 'Python code editor',
}

/**
 * Read-only editor options
 * Extends base options with read-only specific settings
 */
export const readOnlyEditorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...baseEditorOptions,
  readOnly: true,
  domReadOnly: true,
  cursorStyle: 'underline',
  cursorBlinking: 'solid',
  renderLineHighlight: 'none',
  contextmenu: false,
  quickSuggestions: false,
  parameterHints: { enabled: false },
  suggest: { showIcons: false },
  hover: { enabled: false },
}

/**
 * Get editor options based on mode
 */
export function getEditorOptions(readOnly: boolean): editor.IStandaloneEditorConstructionOptions {
  return readOnly ? readOnlyEditorOptions : baseEditorOptions
}
