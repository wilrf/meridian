# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Meridian** - Interactive Python learning platform with in-browser code execution via Pyodide WebAssembly and cloud progress sync via Supabase.

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run build:manifest   # Regenerate curriculum manifest
npm run lint             # ESLint

# Testing
npm run test             # Run unit tests (vitest)
npm run test:ui          # Run tests with UI
npm run test -- src/features/editor/components/__tests__/LightEditor.test.tsx  # Single test
npm run test:e2e         # Run e2e tests (playwright)
npm run test:e2e:ui      # Run e2e tests with UI

# Storybook
npm run storybook        # Component playground on :6006
```

### Important: Webpack vs Turbopack

This project uses **webpack** (not Turbopack) for the dev server. Next.js 16 defaults to Turbopack, but it has known issues with Tailwind CSS JIT compilation that cause critical layout bugs (utility classes like `w-72`, `flex-shrink-0` not being generated).

```bash
# ✅ CORRECT - Uses webpack (configured in package.json)
npm run dev

# ❌ DON'T DO THIS - Turbopack breaks Tailwind CSS
next dev --turbopack
```

If you see layout issues (sidebar too wide, broken flex layouts), verify the dev server shows `(webpack)` not `(Turbopack)` in the startup message.

## Architecture

### Feature-Based Module Structure

```
src/
├── features/              # Domain-specific modules
│   ├── editor/           # Code editor, Pyodide, syntax highlighting
│   ├── lessons/          # Lesson rendering, markdown plugins
│   ├── projects/         # Project workspace (3-panel layout)
│   ├── progress/         # Progress tracking (client hooks + server utils)
│   ├── auth/             # GitHub OAuth authentication
│   └── navigation/       # Sidebar, dashboard, stats
├── shared/
│   ├── ui/               # Reusable UI components (Button, Card, etc.)
│   └── lib/              # Shared utilities (cn, theme-context)
├── lib/
│   └── supabase/         # Supabase clients (unchanged)
├── app/                  # Next.js App Router
└── content/              # Curriculum markdown + manifest
```

### Import Conventions

Use feature public APIs via barrel exports:
```typescript
// ✅ GOOD - Import from feature barrel
import { CodeRunner, usePyodide } from '@/features/editor'
import { LessonRenderer, getLesson } from '@/features/lessons'
import { Button, ErrorBoundary } from '@/shared/ui'

// ⚠️ Client components importing from features with server-only code
// must import from specific files to avoid bundling fs modules:
import { useLessonContext } from '@/features/lessons/lib/lesson-context'
import { useProgress } from '@/features/progress/hooks/use-progress'
```

### Module Boundaries

| Module | Can Import From |
|--------|-----------------|
| `features/editor` | `shared/*`, `lib/supabase` |
| `features/lessons` | `shared/*`, `features/editor` |
| `features/projects` | `shared/*`, `features/editor`, `features/progress` |
| `features/progress` | `shared/*`, `features/auth`, `lib/supabase` |
| `features/auth` | `shared/*`, `lib/supabase` |
| `features/navigation` | `shared/*`, `features/progress`, `features/auth` |
| `shared/*` | `lib/*` only |
| `app/*` | All features (via public APIs) |

### Content Pipeline

```
content/python/**/*.md → build-manifest.ts → manifest.json
                                ↓
                    ┌───────────┴───────────┐
                    │                       │
            LessonRenderer.tsx      ProjectWorkspace.tsx
                    │                       │
        remark/rehype plugins       Three-panel layout
                    │                       │
        CodeRunner.tsx              ProjectEditor.tsx
```

### Lessons vs Projects

- **Lessons** (`/lessons/[...slug]`): Markdown with embedded code exercises
- **Projects** (`/projects/[...slug]`): Three-panel workspace (Instructions | Editor | Output)

Projects detected by folder name pattern (`*_project_*`) → `isProject: true` in manifest.

### Pyodide Integration

- Web Worker at `public/workers/pyodide.worker.js`
- Context: `usePyodide()` provides `runCode()`, `validateCode()`, `checkExpected()`
- 5-second execution timeout, ~10MB initial download (cached)

## Code Block Syntax

In lesson markdown files:
```markdown
~~~python runnable
print("Hello")          # Editable + runnable
~~~

~~~python exercise id="1.1" expected="42"
print(6 * 7)            # Validates stdout
~~~

~~~python exercise id="1.2" validate="assert result == 100"
# Runs assertion after user code
~~~

~~~python exercise id="1.3" hints="Use a for loop|Remember range()"
# Progressive hints, pipe-separated
~~~
```

## TypeScript

Strict mode with `noUncheckedIndexedAccess: true`:
```typescript
const item = arr[0]      // Type: T | undefined
const value = item ?? '' // Handle undefined explicitly
```

## Theme System

Two themes: Ivory (light) and Velvet (dark).

```tsx
// ✅ GOOD - CSS variables
className="bg-[var(--bg-surface)] text-[var(--text-primary)]"

// ❌ BAD - Hardcoded colors
className="bg-white text-gray-900"
```

Access via `useTheme()` from `@/shared/lib/theme-context`.

## Environment Variables

Required in `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Only `NEXT_PUBLIC_*` variables are exposed to browser.

## Client Components

All components using hooks, browser APIs, or interactivity need the `'use client'` directive:

```typescript
'use client'  // Required at top of file

import { useState } from 'react'
// ...
```

Key client components:
- `shared/ui/MeridianLogo.tsx` - SVG logo component
- `shared/ui/ThemeToggle.tsx` - Theme switcher
- `shared/lib/theme-context.tsx` - Theme provider
- `features/auth/lib/auth-context.tsx` - Auth provider
- All components using `useProgress()`, `usePyodide()`, `useTheme()`

## Common Issues

### Hydration Warnings in Development

React DevTools can cause non-blocking hydration warnings in development mode. These typically appear as:
- "Element type is invalid: expected a string... but got: undefined"
- Warnings about components receiving promises

If the page renders correctly, these are usually safe to ignore in development. For production, ensure:
1. All client components have `'use client'` directive
2. No debug logging code (e.g., fetch calls to localhost ports)
3. Dynamic imports resolve to valid components

### Dynamic Imports

When using `next/dynamic`, ensure the imported module exports what you expect:

```typescript
// ✅ GOOD - Module has default export
const Component = dynamic(() => import('./Component'))

// ✅ GOOD - Named export with explicit extraction
const Component = dynamic(() =>
  import('./module').then(mod => mod.Component)
)

// ❌ BAD - Trying to get named export as default
const Component = dynamic(() =>
  import('./module').then(mod => ({ default: mod.Something }))
)  // Fails if mod.Something is undefined
```

Remove unused dynamic imports—they can cause lazy loading errors even if not rendered.

## Security

- Security headers configured in `next.config.mjs` and `vercel.json`
- Pyodide workers require COOP/COEP headers (configured for `/workers/` path)
- Never commit `.env` files, API keys, or credentials
- Never add debug logging that makes external requests (even to localhost)
