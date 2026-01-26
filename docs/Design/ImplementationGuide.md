# LearnPython Design System Implementation Guide

## For Claude Code — Existing Project

This document provides instructions for implementing the "Quiet Luxury" design system into the existing LearnPython project. Reference `LearnPython_Design_System_v2.md` for complete specifications.

---

## Overview

### Design System Summary

| Aspect | Value |
|--------|-------|
| **Light Theme** | "Ivory" — warm cream/ivory backgrounds, deep navy accent, soft gold glow |
| **Dark Theme** | "Velvet" — plum-black backgrounds, champagne accent |
| **Editor Theme** | "Ink" — always dark, matches Velvet palette |
| **Typography** | Satoshi (display), Inter (body), JetBrains Mono (code) |
| **Aesthetic** | Quiet luxury — understated, regal, elegant |

### Key Files to Create/Update

```
├── app/globals.css              ← Replace with new design tokens
├── tailwind.config.ts           ← Update with new theme
├── lib/theme-context.tsx        ← Create theme provider
├── lib/utils.ts                 ← Add/update utilities
├── components/ui/               ← Update all UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── Progress.tsx
├── components/editor/
│   └── themes/ink.ts            ← Create Monaco theme
└── public/fonts/                ← Add Satoshi font files
```

---

## Implementation Checklist

Use this checklist to track progress:

```
[ ] Phase 1: Design Tokens
    [ ] Download and add Satoshi font
    [ ] Replace globals.css with new design tokens
    [ ] Update tailwind.config.ts
    [ ] Create/update theme context

[ ] Phase 2: Core Components
    [ ] Update Button component with microinteractions
    [ ] Update Card component with gradient border hover
    [ ] Update Input component with focus glow
    [ ] Update/create Badge component
    [ ] Update/create Progress component

[ ] Phase 3: Editor Theme
    [ ] Create Ink theme for Monaco
    [ ] Update CodeEditor component
    [ ] Update OutputPanel styling

[ ] Phase 4: Layout Updates
    [ ] Update Header with new styling
    [ ] Update Sidebar with new styling
    [ ] Update page backgrounds

[ ] Phase 5: Polish
    [ ] Add subtle gradient backgrounds
    [ ] Implement all microinteractions
    [ ] Test both themes
    [ ] Verify accessibility
```

---

## Phase 1: Design Tokens

### Step 1.1: Add Satoshi Font

Download Satoshi from https://www.fontshare.com/fonts/satoshi

Place files in `public/fonts/`:
- `Satoshi-Variable.woff2`
- `Satoshi-Variable.woff`

### Step 1.2: Update globals.css

Replace the entire contents of `app/globals.css` with the following:

```css
/* ═══════════════════════════════════════════════════════════
   LEARNPYTHON DESIGN SYSTEM — QUIET LUXURY
   Themes: Ivory (Light) & Velvet (Dark)
   ═══════════════════════════════════════════════════════════ */

/* === FONT IMPORTS === */
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* === SATOSHI FONT === */
@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Variable.woff2') format('woff2'),
       url('/fonts/Satoshi-Variable.woff') format('woff');
  font-weight: 400 900;
  font-display: swap;
  font-style: normal;
}

/* ═══════════════════════════════════════════════════════════
   LIGHT MODE — "IVORY"
   Mood: Private library, afternoon light, understated elegance
   ═══════════════════════════════════════════════════════════ */

:root {
  /* === FONTS === */
  --font-display: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* === IVORY PRIMITIVES === */
  --ivory-25:  #FDFCFA;
  --ivory-50:  #F9F8F6;
  --ivory-100: #F1EFE9;
  --ivory-200: #E5E2D9;
  --ivory-300: #D4D0C4;
  --ivory-400: #B8B3A4;
  --ivory-500: #918C7E;
  --ivory-600: #6B635A;
  --ivory-700: #524B42;
  --ivory-800: #3A3530;
  --ivory-900: #2C2825;
  --ivory-950: #1A1816;

  /* === NAVY ACCENT === */
  --navy-50:  #F0F4F8;
  --navy-100: #D9E2EC;
  --navy-200: #BCCCDC;
  --navy-300: #9FB3C8;
  --navy-400: #6E8898;
  --navy-500: #486581;
  --navy-600: #334E68;
  --navy-700: #243B53;
  --navy-800: #1E3A5F;
  --navy-900: #102A43;

  /* === GOLD ACCENT === */
  --gold-300: #D4C5A9;
  --gold-400: #C4B08E;
  --gold-500: #B8A07E;
  --gold-600: #9A8462;

  /* === BACKGROUNDS === */
  --bg-canvas:   var(--ivory-50);
  --bg-surface:  #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-subtle:   var(--ivory-100);
  --bg-muted:    var(--ivory-200);
  --bg-inset:    var(--ivory-25);

  /* === TEXT === */
  --text-primary:   var(--ivory-900);
  --text-secondary: var(--ivory-700);
  --text-tertiary:  var(--ivory-600);
  --text-muted:     var(--ivory-500);
  --text-inverse:   var(--ivory-50);

  /* === BORDERS === */
  --border-subtle:  var(--ivory-100);
  --border-default: var(--ivory-200);
  --border-strong:  var(--ivory-300);
  --border-focus:   var(--navy-600);

  /* === INTERACTIVE === */
  --interactive-primary:        var(--navy-800);
  --interactive-primary-hover:  var(--navy-700);
  --interactive-primary-active: var(--navy-900);
  --interactive-secondary:        var(--ivory-100);
  --interactive-secondary-hover:  var(--ivory-200);

  /* === ACCENT === */
  --accent-subtle: var(--navy-50);
  --accent-light:  var(--navy-100);
  --accent-base:   var(--navy-800);
  --accent-strong: var(--navy-700);
  --accent-glow:   var(--gold-500);

  /* === FEEDBACK === */
  --success-subtle: #F0F7F1;
  --success-light:  #D4E8D8;
  --success-base:   #5E8C6A;
  --success-strong: #436B4D;

  --warning-subtle: #FBF6ED;
  --warning-light:  #F2E4C4;
  --warning-base:   #B8975A;
  --warning-strong: #8C7042;

  --error-subtle:   #FAF0F0;
  --error-light:    #F0D4D6;
  --error-base:     #C4616C;
  --error-strong:   #9B4049;

  --info-subtle:    var(--navy-50);
  --info-light:     var(--navy-100);
  --info-base:      var(--navy-600);
  --info-strong:    var(--navy-700);

  /* === EDITOR (ALWAYS DARK) === */
  --editor-bg:            #0A0910;
  --editor-bg-highlight:  #13111A;
  --editor-bg-selection:  #2D2640;
  --editor-text:          #E0DDD6;
  --editor-text-muted:    #6E6880;
  --editor-gutter-border: #1A1724;

  /* === OUTPUT === */
  --output-bg:      #08060B;
  --output-text:    #E0DDD6;
  --output-success: #8BB396;
  --output-error:   #D98B8B;
  --output-warning: #D4B896;
  --output-border:  #1A1724;

  /* === SYNTAX === */
  --syntax-keyword:   #C9A0DC;
  --syntax-string:    #A8C4A0;
  --syntax-number:    #D4B896;
  --syntax-function:  #93B5CF;
  --syntax-comment:   #6E6880;
  --syntax-operator:  #B8A8C8;
  --syntax-decorator: #B8A07E;

  /* === TIMING === */
  --duration-instant: 75ms;
  --duration-fast:    150ms;
  --duration-normal:  200ms;
  --duration-slow:    300ms;
  --duration-slower:  500ms;

  /* === EASING === */
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === RADII === */
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-2xl:  1.5rem;

  /* === GRADIENTS === */
  --gradient-canvas: linear-gradient(135deg, #F9F8F6 0%, #F7F5F2 50%, #F5F3EF 100%);
  --gradient-button: linear-gradient(180deg, #243B53 0%, #1E3A5F 50%, #1A3456 100%);
}

/* ═══════════════════════════════════════════════════════════
   DARK MODE — "VELVET"
   Mood: Velvet-curtained study at dusk, soft lamplight
   ═══════════════════════════════════════════════════════════ */

[data-theme="dark"] {
  /* === VELVET PRIMITIVES === */
  --velvet-950: #0C0A10;
  --velvet-900: #110E16;
  --velvet-800: #16131C;
  --velvet-700: #1F1B26;
  --velvet-600: #2A2533;
  --velvet-500: #3D3649;
  --velvet-400: #56506B;
  --velvet-300: #7A7290;
  --velvet-200: #A9A3B3;
  --velvet-100: #D4D0DC;
  --velvet-50:  #EDEBE6;

  /* === CHAMPAGNE ACCENT === */
  --champagne-200: #E8DCC4;
  --champagne-300: #D4C5A9;
  --champagne-400: #C4B191;
  --champagne-500: #B09D7A;

  /* === BACKGROUNDS === */
  --bg-canvas:   var(--velvet-950);
  --bg-surface:  var(--velvet-900);
  --bg-elevated: var(--velvet-800);
  --bg-subtle:   var(--velvet-700);
  --bg-muted:    var(--velvet-800);
  --bg-inset:    #08060B;

  /* === TEXT === */
  --text-primary:   var(--velvet-50);
  --text-secondary: var(--velvet-100);
  --text-tertiary:  var(--velvet-200);
  --text-muted:     var(--velvet-400);
  --text-inverse:   var(--velvet-950);

  /* === BORDERS === */
  --border-subtle:  var(--velvet-800);
  --border-default: var(--velvet-700);
  --border-strong:  var(--velvet-600);
  --border-focus:   var(--champagne-300);

  /* === INTERACTIVE === */
  --interactive-primary:        var(--champagne-300);
  --interactive-primary-hover:  var(--champagne-200);
  --interactive-primary-active: var(--champagne-400);
  --interactive-secondary:        var(--velvet-800);
  --interactive-secondary-hover:  var(--velvet-700);

  /* === ACCENT === */
  --accent-subtle: rgba(212, 197, 169, 0.08);
  --accent-light:  rgba(212, 197, 169, 0.15);
  --accent-base:   var(--champagne-300);
  --accent-strong: var(--champagne-200);
  --accent-glow:   var(--champagne-300);

  /* === FEEDBACK (SOFTER) === */
  --success-subtle: rgba(139, 179, 150, 0.1);
  --success-light:  rgba(139, 179, 150, 0.2);
  --success-base:   #8BB396;
  --success-strong: #A8C9B0;

  --warning-subtle: rgba(212, 184, 150, 0.1);
  --warning-light:  rgba(212, 184, 150, 0.2);
  --warning-base:   #D4B896;
  --warning-strong: #E5CEB0;

  --error-subtle:   rgba(217, 139, 139, 0.1);
  --error-light:    rgba(217, 139, 139, 0.2);
  --error-base:     #D98B8B;
  --error-strong:   #E8A8A8;

  --info-subtle:    rgba(147, 181, 207, 0.1);
  --info-light:     rgba(147, 181, 207, 0.2);
  --info-base:      #93B5CF;
  --info-strong:    #B0CAE0;

  /* === GRADIENTS === */
  --gradient-canvas: linear-gradient(135deg, #0C0A10 0%, #0E0B13 50%, #100D16 100%);
  --gradient-button: linear-gradient(180deg, #D9CBAF 0%, #D4C5A9 50%, #CEBFA3 100%);
}

/* ═══════════════════════════════════════════════════════════
   BASE STYLES
   ═══════════════════════════════════════════════════════════ */

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--gradient-canvas);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === FOCUS === */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* === SELECTION === */
::selection {
  background: var(--accent-light);
  color: var(--text-primary);
}

/* === SCROLLBAR === */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-subtle);
}

::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* === CODE BLOCKS === */
pre {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.625;
  background: var(--editor-bg);
  color: var(--editor-text);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

code:not(pre code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--bg-subtle);
  color: var(--text-primary);
  padding: 0.125em 0.375em;
  border-radius: var(--radius-sm);
}

/* ═══════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════ */

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes checkmark-draw {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 16px 4px var(--accent-glow); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes progress-fill {
  0% { transform: scaleX(0); }
  80% { transform: scaleX(1.02); }
  100% { transform: scaleX(1); }
}

@keyframes success-bounce {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* === REDUCED MOTION === */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ═══════════════════════════════════════════════════════════
   UTILITY CLASSES
   ═══════════════════════════════════════════════════════════ */

.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }
.font-mono { font-family: var(--font-mono); }

.animate-fade-in { animation: fade-in var(--duration-normal) var(--ease-out); }
.animate-slide-up { animation: slide-up var(--duration-normal) var(--ease-out); }
.animate-scale-in { animation: scale-in var(--duration-normal) var(--ease-out); }
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
.animate-checkmark { animation: checkmark-draw var(--duration-slow) var(--ease-out) forwards; }
.animate-success { animation: success-bounce 400ms var(--ease-spring); }
```

### Step 1.3: Update tailwind.config.ts

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        inset: "var(--bg-inset)",
        
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-muted": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",
        
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "border-focus": "var(--border-focus)",
        
        accent: {
          subtle: "var(--accent-subtle)",
          light: "var(--accent-light)",
          DEFAULT: "var(--accent-base)",
          strong: "var(--accent-strong)",
          glow: "var(--accent-glow)",
        },
        
        interactive: {
          primary: "var(--interactive-primary)",
          "primary-hover": "var(--interactive-primary-hover)",
          secondary: "var(--interactive-secondary)",
          "secondary-hover": "var(--interactive-secondary-hover)",
        },
        
        success: {
          subtle: "var(--success-subtle)",
          light: "var(--success-light)",
          DEFAULT: "var(--success-base)",
          strong: "var(--success-strong)",
        },
        warning: {
          subtle: "var(--warning-subtle)",
          light: "var(--warning-light)",
          DEFAULT: "var(--warning-base)",
          strong: "var(--warning-strong)",
        },
        error: {
          subtle: "var(--error-subtle)",
          light: "var(--error-light)",
          DEFAULT: "var(--error-base)",
          strong: "var(--error-strong)",
        },
        info: {
          subtle: "var(--info-subtle)",
          light: "var(--info-light)",
          DEFAULT: "var(--info-base)",
          strong: "var(--info-strong)",
        },
        
        editor: {
          bg: "var(--editor-bg)",
          text: "var(--editor-text)",
          muted: "var(--editor-text-muted)",
        },
        output: {
          bg: "var(--output-bg)",
          text: "var(--output-text)",
          success: "var(--output-success)",
          error: "var(--output-error)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      transitionDuration: {
        instant: "75ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      boxShadow: {
        glow: "0 0 16px 4px var(--accent-glow)",
        "glow-sm": "0 0 8px 2px var(--accent-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 1.4: Create/Update Theme Context

Create or update `lib/theme-context.tsx`:

```typescript
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("learnpython-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("learnpython-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

---

## Phase 2: Component Updates

### Component: Button

Update `components/ui/Button.tsx` with these key changes:

**Microinteractions to add:**
- `hover:-translate-y-0.5` — Lift on hover
- `hover:shadow-lg hover:shadow-accent-glow/20` — Glow shadow on hover
- `active:translate-y-0 active:scale-[0.98]` — Compress on click
- `transition-all duration-fast ease-out` — Smooth transitions

**Color mappings:**
- Primary: `bg-interactive-primary text-text-inverse`
- Secondary: `bg-subtle border-border-default`
- Ghost: `hover:bg-subtle`

```typescript
// Key variant styles for Button
const variants = {
  primary: `
    bg-interactive-primary text-text-inverse
    hover:bg-interactive-primary-hover
    hover:-translate-y-0.5
    hover:shadow-lg hover:shadow-accent-glow/20
    active:translate-y-0 active:scale-[0.98]
  `,
  secondary: `
    bg-subtle text-text-secondary
    border border-border-default
    hover:bg-interactive-secondary-hover
    hover:border-border-strong
    hover:-translate-y-0.5
    active:translate-y-0 active:scale-[0.98]
  `,
  ghost: `
    text-text-secondary
    hover:bg-subtle hover:text-text-primary
    active:scale-[0.98]
  `,
  danger: `
    bg-error text-white
    hover:bg-error-strong
    hover:-translate-y-0.5
    active:translate-y-0 active:scale-[0.98]
  `,
};
```

### Component: Card

Update `components/ui/Card.tsx` with these key changes:

**Interactive variant with gradient border:**
```typescript
// Add this variant for interactive cards
variant === "interactive" && `
  bg-surface border border-border-subtle cursor-pointer
  hover:-translate-y-0.5 
  hover:shadow-lg hover:shadow-black/5
  hover:border-accent-glow/30
  transition-all duration-normal ease-out
`
```

### Component: Input

Update `components/ui/Input.tsx` with focus glow:

```typescript
// Focus styles
const focusStyles = error
  ? "focus:border-error focus:shadow-[0_0_0_3px_var(--error-subtle)]"
  : "focus:border-border-focus focus:shadow-[0_0_0_3px_var(--accent-subtle)]";
```

### Component: Progress

Update `components/ui/Progress.tsx` with gradient fill:

```typescript
// Progress bar fill with gradient
<div
  className="h-full bg-gradient-to-r from-accent to-accent-strong rounded-full 
             transition-all duration-slow ease-spring origin-left"
  style={{ width: `${value}%` }}
/>
```

---

## Phase 3: Monaco Editor Theme

### Create Ink Theme

Create `components/editor/themes/ink.ts`:

```typescript
import type { editor } from "monaco-editor";

export const inkTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: false,
  rules: [
    { token: "", foreground: "E0DDD6", background: "0A0910" },
    { token: "comment", foreground: "6E6880", fontStyle: "italic" },
    { token: "keyword", foreground: "C9A0DC" },
    { token: "keyword.control", foreground: "C9A0DC" },
    { token: "string", foreground: "A8C4A0" },
    { token: "string.quoted", foreground: "A8C4A0" },
    { token: "number", foreground: "D4B896" },
    { token: "number.float", foreground: "D4B896" },
    { token: "function", foreground: "93B5CF" },
    { token: "function.call", foreground: "93B5CF" },
    { token: "class", foreground: "D4B896" },
    { token: "type", foreground: "D4B896" },
    { token: "variable", foreground: "E0DDD6" },
    { token: "variable.parameter", foreground: "C4B8A0" },
    { token: "operator", foreground: "B8A8C8" },
    { token: "constant", foreground: "C9A0DC" },
    { token: "constant.language", foreground: "C9A0DC" },
    { token: "support.function", foreground: "93B5CF" },
    { token: "decorator", foreground: "B8A07E" },
    { token: "meta.decorator", foreground: "B8A07E" },
    { token: "punctuation", foreground: "A9A3B3" },
    { token: "bracket", foreground: "A9A3B3" },
  ],
  colors: {
    "editor.background": "#0A0910",
    "editor.foreground": "#E0DDD6",
    "editor.lineHighlightBackground": "#13111A",
    "editor.lineHighlightBorder": "#13111A",
    "editor.selectionBackground": "#2D2640",
    "editor.inactiveSelectionBackground": "#2D264080",
    "editorLineNumber.foreground": "#6E6880",
    "editorLineNumber.activeForeground": "#A9A3B3",
    "editorCursor.foreground": "#D4C5A9",
    "editor.selectionHighlightBackground": "#2D264040",
    "editorIndentGuide.background": "#1A1724",
    "editorIndentGuide.activeBackground": "#2A2533",
    "editorWhitespace.foreground": "#2A2533",
    "editorBracketMatch.background": "#2D264060",
    "editorBracketMatch.border": "#D4C5A9",
    "scrollbar.shadow": "#00000000",
    "scrollbarSlider.background": "#3D364980",
    "scrollbarSlider.hoverBackground": "#56506B80",
    "scrollbarSlider.activeBackground": "#56506B",
  },
};

export const inkThemeName = "learnpython-ink";
```

### Update CodeEditor Component

In your CodeEditor component, register the theme:

```typescript
import { inkTheme, inkThemeName } from "./themes/ink";

// In your onMount handler:
const handleMount: OnMount = (editor, monaco) => {
  monaco.editor.defineTheme(inkThemeName, inkTheme);
  monaco.editor.setTheme(inkThemeName);
};
```

---

## Phase 4: Layout Updates

### Header Styling

Key classes for the header:
```typescript
className="h-14 border-b border-border-subtle bg-surface/80 backdrop-blur-sm sticky top-0 z-50"
```

### Sidebar Styling

Key classes for the sidebar:
```typescript
// Container
className="w-[280px] h-screen bg-surface border-r border-border-subtle"

// Phase headers
className="text-xs font-medium uppercase tracking-wider text-text-muted"

// Current lesson
className="bg-accent-subtle text-accent font-medium"

// Completed lesson
className="text-text-secondary"
// With checkmark icon in success color

// Upcoming lesson
className="text-text-tertiary"
```

### Page Background

The page background uses a subtle gradient. This is handled in globals.css:
```css
body {
  background: var(--gradient-canvas);
  background-attachment: fixed;
}
```

---

## Phase 5: Exercise Block

### Styling for Exercise Blocks

```typescript
// Light mode
className={`
  border-l-[3px] border-l-navy-600
  bg-accent-subtle
  rounded-lg p-6
`}

// The same classes work for dark mode due to CSS variables
// border-l will use champagne, bg will use accent-subtle (champagne with opacity)
```

### Success State Animation

```typescript
// When exercise is completed successfully
className="animate-success" // Uses success-bounce keyframe

// Success icon with checkmark draw
<svg className="animate-checkmark">
  <path 
    strokeDasharray="24"
    strokeDashoffset="0" // Animated from 24 to 0
  />
</svg>
```

---

## Quick Reference

### Color Variable Mapping

| Purpose | Light (Ivory) | Dark (Velvet) |
|---------|---------------|---------------|
| Page background | `#F9F8F6` ivory | `#0C0A10` plum-black |
| Card surface | `#FFFFFF` white | `#110E16` deep aubergine |
| Primary text | `#2C2825` warm charcoal | `#EDEBE6` soft ivory |
| Secondary text | `#524B42` taupe | `#D4D0DC` dusty lavender |
| Primary button | `#1E3A5F` deep navy | `#D4C5A9` champagne |
| Accent glow | `#B8A07E` soft gold | `#D4C5A9` champagne |
| Success | `#5E8C6A` muted sage | `#8BB396` soft sage |
| Error | `#C4616C` dusty rose | `#D98B8B` muted coral |

### Typography Classes

| Element | Classes |
|---------|---------|
| Page title | `font-display text-5xl font-bold text-text-primary` |
| Section header | `font-display text-3xl font-semibold text-text-primary` |
| Card title | `font-display text-xl font-semibold text-text-primary` |
| Body text | `font-body text-base text-text-secondary` |
| Small text | `font-body text-sm text-text-tertiary` |
| Caption | `font-body text-xs uppercase tracking-wider text-text-muted` |
| Code | `font-mono text-sm` |

### Microinteraction Classes

| Effect | Classes |
|--------|---------|
| Button lift | `hover:-translate-y-0.5` |
| Button glow | `hover:shadow-lg hover:shadow-accent-glow/20` |
| Button press | `active:translate-y-0 active:scale-[0.98]` |
| Card lift | `hover:-translate-y-0.5 hover:shadow-lg` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-border-focus` |
| Input glow | `focus:shadow-[0_0_0_3px_var(--accent-subtle)]` |

### Animation Classes

| Animation | Class |
|-----------|-------|
| Fade in | `animate-fade-in` |
| Slide up | `animate-slide-up` |
| Scale in | `animate-scale-in` |
| Pulse glow | `animate-pulse-glow` |
| Spinner | `animate-spin` |
| Checkmark draw | `animate-checkmark` |
| Success bounce | `animate-success` |

---

## Testing Checklist

After implementation, verify:

```
[ ] Light mode displays warm ivory backgrounds
[ ] Dark mode displays plum-black backgrounds
[ ] Theme toggle works and persists
[ ] Button hover shows lift + glow effect
[ ] Button click shows scale-down effect
[ ] Input focus shows colored ring
[ ] Cards lift on hover (interactive variant)
[ ] Progress bar has gradient fill
[ ] Code editor uses Ink theme
[ ] Output panel uses dark styling
[ ] All text is readable (contrast check)
[ ] Animations respect prefers-reduced-motion
[ ] Fonts load correctly (Satoshi, Inter, JetBrains Mono)
```

---

## Troubleshooting

### Fonts not loading
- Ensure Satoshi files are in `public/fonts/`
- Check file names match exactly: `Satoshi-Variable.woff2`
- Verify @font-face declaration in globals.css

### Theme not switching
- Check `data-theme` attribute is being set on `<html>`
- Ensure ThemeProvider wraps the app in layout.tsx
- Verify localStorage key: `learnpython-theme`

### Colors look wrong
- Verify CSS variables are defined in :root
- Check dark mode variables are inside `[data-theme="dark"]`
- Ensure Tailwind config uses `var(--token-name)` syntax

### Animations not working
- Check keyframes are defined in globals.css
- Verify animation classes in Tailwind config
- Test without `prefers-reduced-motion` media query

---

*Reference `LearnPython_Design_System_v2.md` for complete specifications.*