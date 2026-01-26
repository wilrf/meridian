import type { editor } from 'monaco-editor'

/**
 * LearnPython "Ink" Theme
 *
 * A sophisticated dark theme with plum-black backgrounds and warm,
 * muted syntax colors. Matches the "Velvet" dark mode palette.
 */
export const inkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: false,
  rules: [
    // Base
    { token: '', foreground: 'E0DDD6', background: '0A0910' },

    // Comments - muted purple-gray, italic
    { token: 'comment', foreground: '6E6880', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '6E6880', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '6E6880', fontStyle: 'italic' },

    // Keywords - soft lavender
    { token: 'keyword', foreground: 'C9A0DC' },
    { token: 'keyword.control', foreground: 'C9A0DC' },
    { token: 'keyword.operator', foreground: 'B8A8C8' },

    // Strings - muted sage
    { token: 'string', foreground: 'A8C4A0' },
    { token: 'string.quoted', foreground: 'A8C4A0' },
    { token: 'string.quoted.single', foreground: 'A8C4A0' },
    { token: 'string.quoted.double', foreground: 'A8C4A0' },
    { token: 'string.template', foreground: 'A8C4A0' },

    // Numbers - soft gold
    { token: 'number', foreground: 'D4B896' },
    { token: 'number.float', foreground: 'D4B896' },
    { token: 'number.hex', foreground: 'D4B896' },

    // Functions - dusty blue
    { token: 'function', foreground: '93B5CF' },
    { token: 'function.call', foreground: '93B5CF' },
    { token: 'entity.name.function', foreground: '93B5CF' },
    { token: 'support.function', foreground: '93B5CF' },

    // Classes & Types - soft gold
    { token: 'class', foreground: 'D4B896' },
    { token: 'type', foreground: 'D4B896' },
    { token: 'entity.name.class', foreground: 'D4B896' },
    { token: 'entity.name.type', foreground: 'D4B896' },

    // Variables
    { token: 'variable', foreground: 'E0DDD6' },
    { token: 'variable.parameter', foreground: 'C4B8A0' },
    { token: 'variable.other', foreground: 'E0DDD6' },

    // Operators - muted purple
    { token: 'operator', foreground: 'B8A8C8' },

    // Constants - lavender
    { token: 'constant', foreground: 'C9A0DC' },
    { token: 'constant.language', foreground: 'C9A0DC' },
    { token: 'constant.language.boolean', foreground: 'C9A0DC' },
    { token: 'constant.language.null', foreground: 'C9A0DC' },

    // Built-ins - dusty blue
    { token: 'support.function.builtin', foreground: '93B5CF' },
    { token: 'builtin', foreground: '93B5CF' },

    // Decorators - quiet gold
    { token: 'decorator', foreground: 'B8A07E' },
    { token: 'meta.decorator', foreground: 'B8A07E' },
    { token: 'tag.decorator', foreground: 'B8A07E' },

    // Punctuation
    { token: 'punctuation', foreground: 'A9A3B3' },
    { token: 'bracket', foreground: 'A9A3B3' },
    { token: 'delimiter', foreground: 'A9A3B3' },

    // Python specific
    { token: 'keyword.control.flow.python', foreground: 'C9A0DC' },
    { token: 'constant.language.python', foreground: 'C9A0DC' },
    { token: 'storage.type.function.python', foreground: 'C9A0DC' },
    { token: 'storage.type.class.python', foreground: 'C9A0DC' },
  ],
  colors: {
    // Editor chrome
    'editor.background': '#0A0910',
    'editor.foreground': '#E0DDD6',

    // Line highlighting
    'editor.lineHighlightBackground': '#13111A',
    'editor.lineHighlightBorder': '#13111A',

    // Selection
    'editor.selectionBackground': '#2D2640',
    'editor.inactiveSelectionBackground': '#2D264080',
    'editor.selectionHighlightBackground': '#2D264040',

    // Line numbers
    'editorLineNumber.foreground': '#6E6880',
    'editorLineNumber.activeForeground': '#A9A3B3',

    // Cursor
    'editorCursor.foreground': '#D4C5A9',

    // Indent guides
    'editorIndentGuide.background': '#1A1724',
    'editorIndentGuide.activeBackground': '#2A2533',

    // Whitespace
    'editorWhitespace.foreground': '#2A2533',

    // Bracket matching
    'editorBracketMatch.background': '#2D264060',
    'editorBracketMatch.border': '#D4C5A9',

    // Gutter
    'editorGutter.background': '#0A0910',

    // Scrollbar
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#3D364980',
    'scrollbarSlider.hoverBackground': '#56506B80',
    'scrollbarSlider.activeBackground': '#56506B',

    // Find/Replace
    'editor.findMatchBackground': '#2D264080',
    'editor.findMatchHighlightBackground': '#2D264040',

    // Overview ruler
    'editorOverviewRuler.border': '#00000000',

    // Minimap (disabled but just in case)
    'minimap.background': '#0A0910',
  },
}

export const inkThemeName = 'learnpython-ink'
