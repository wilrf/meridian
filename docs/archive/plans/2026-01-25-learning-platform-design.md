# Python Learning Platform Design

## Overview

A self-hosted, Codecademy-style interactive learning platform for the existing Python curriculum. Built with Next.js, featuring in-browser code execution via Pyodide and file-based progress tracking.

## Goals

- Interactive code execution directly in the browser
- Progress tracking across lessons and exercises
- Project-based learning with validation
- Self-hosted, no external dependencies for core functionality

## Project Location

- **Location:** `/Users/wilfowler/Learning/learn-python-app/`
- **Content strategy:** Symlink `/content/python` → `../python` to keep one source of truth
- **Styling:** Tailwind CSS (Next.js default, utility-first, fast to iterate)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
├─────────────────────────────────────────────────────┤
│  /app                                                │
│    /page.tsx              → Dashboard/home           │
│    /lessons/[...slug]     → Lesson viewer            │
│    /api/progress          → Read/write JSON files    │
├─────────────────────────────────────────────────────┤
│  /content                                            │
│    /python/phase1/...     → Existing .md lessons     │
│    /manifest.json         → Auto-generated index     │
├─────────────────────────────────────────────────────┤
│  /components                                         │
│    CodeEditor.tsx         → Monaco editor (dynamic)  │
│    CodeRunner.tsx         → Pyodide execution        │
│    PyodideProvider.tsx    → Shared Pyodide context   │
│    LessonRenderer.tsx     → Markdown → React         │
│    ProgressSidebar.tsx    → Phase/lesson nav         │
│    ErrorBoundary.tsx      → Crash recovery           │
└─────────────────────────────────────────────────────┘
```

**Note:** Projects workspace (`/projects/[id]`) deferred to v2. Focus v1 on lessons and exercises.

## Key Decisions

### Code Execution: Pyodide (WebAssembly)

- Python runs entirely in the browser via WebAssembly
- No server-side execution needed
- Supports numpy, pandas, scikit-learn for later phases
- Runs in a Web Worker to avoid UI freezing
- ~10MB initial download, cached after first load

**Loading UX:**
- Show skeleton loader while Pyodide initializes
- Display download progress percentage
- "Run" button disabled until ready, shows "Loading Python..."
- Once loaded, persist Pyodide instance across page navigation (React context)

**Package Pre-loading:**
Lessons can declare dependencies in frontmatter:
```yaml
requires: ["numpy", "pandas"]
```

When lesson loads:
1. PyodideProvider checks lesson's `requires` array
2. If packages not already loaded, shows "Loading numpy, pandas..."
3. Calls `pyodide.loadPackage(["numpy", "pandas"])`
4. Once complete, enables Run button

Packages stay loaded for session - subsequent lessons using same packages load instantly.

**Monaco Editor SSR Fix:**
```tsx
// Must use dynamic import - Monaco doesn't work server-side
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse" />
})
```

**Error Boundaries:**
- Wrap `CodeRunner` in React error boundary
- Pyodide crashes show friendly message + "Reset" button
- Catches infinite loops via Web Worker timeout (5 second default)

### Progress Tracking: File-based JSON

```json
{
  "lastUpdated": "2026-01-25T14:30:00Z",
  "lessons": {
    "phase1/01_what_is_python": {
      "status": "completed",
      "completedAt": "2026-01-20T10:00:00Z",
      "exercises": {
        "1.1": { "completed": true, "attempts": 2 },
        "1.2": { "completed": true, "attempts": 1 }
      }
    }
  },
  "projects": {
    "07_number_analyzer": {
      "status": "not_started",
      "code": ""
    }
  }
}
```

- Stored in `/data/progress.json`
- API routes handle read/write operations
- No database needed for single-user self-hosted setup

### Frontend: Next.js + React

- App Router for file-based routing
- Monaco Editor for code editing (VS Code experience)
- react-markdown for rendering lesson content
- gray-matter for parsing Markdown frontmatter

## Lesson Format

Existing Markdown files enhanced with optional frontmatter:

```markdown
---
title: "Variables and Memory"
phase: 1
order: 2
requires: []        # Python packages needed (e.g., ["numpy"])
prev: "01_what_is_python"
next: "03_data_types"
---

# Lesson Content...

## The Code

~~~python runnable
x = 42
print(x)
~~~

## Exercise 2.1

~~~python exercise id="2.1" expected="42"
# Create a variable called 'answer' and set it to 42
# Then print it

~~~

## Exercise 2.2

~~~python exercise id="2.2" validate="assert a == 2 and b == 1"
# Swap the values of a and b without using a third variable
a = 1
b = 2

~~~
```

**Code Block Parsing:**

Meta strings after the language (e.g., `python runnable`) are parsed by a custom rehype plugin:
- `runnable` - makes block interactive with Run button
- `exercise id="X"` - marks as exercise, tracks completion
- `expected="output"` - validates stdout matches exactly
- `validate="python code"` - runs assertion after user code

This approach uses standard Markdown syntax (no custom `{}`), making lessons portable.

**Custom Rehype Plugin:**
```ts
// lib/rehype-code-blocks.ts
import { visit } from 'unist-util-visit'

// 1. Visits all <code> nodes in the AST
// 2. Parses meta string: "python runnable" → { lang: "python", runnable: true }
// 3. Replaces static <pre><code> with <InteractiveCodeBlock> component
// 4. Passes parsed props: lang, runnable, exerciseId, expected, validate
```

**Navigation:**
- `prev`/`next` in frontmatter for explicit ordering
- Falls back to filesystem order (01_, 02_, etc.) if not specified

## Tech Stack

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "@monaco-editor/react": "^4.6",
    "pyodide": "^0.25",
    "gray-matter": "^4.0",
    "react-markdown": "^9",
    "rehype-highlight": "^7",
    "unist-util-visit": "^5"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^1",
    "@testing-library/react": "^14",
    "tsx": "^4"
  }
}
```

## TypeScript Configuration

```json
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Strict mode catches type errors early. Path aliases keep imports clean (`@/components/...`).

## Testing Strategy

**Test Runner:** Vitest (fast, native ESM support, compatible with React Testing Library)

**What to Test:**
| Layer | What | How |
|-------|------|-----|
| `lib/` | Manifest generation, Markdown parsing, rehype plugin | Unit tests with sample fixtures |
| `components/` | LessonRenderer, ProgressSidebar | React Testing Library |
| `api/` | Progress read/write | Integration tests with temp files |
| Code execution | Pyodide worker | Manual testing (Web Workers hard to unit test) |

**Test Commands:**
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode during development
npm run test:coverage # Coverage report
```

Tests run in CI before merge (if using GitHub Actions later).

## Curriculum Manifest

Auto-generated from filesystem structure at build time:

```json
// Generated: content/manifest.json
{
  "phases": [
    {
      "id": "phase1_foundations",
      "title": "How Computers Think",
      "lessons": [
        {
          "id": "01_what_is_python",
          "title": "What Is Python?",
          "path": "python/phase1_foundations/01_what_is_python.md",
          "exercises": ["1.1", "1.2", "1.3"]
        }
      ]
    }
  ]
}
```

**Generation:**
```json
// package.json scripts
{
  "scripts": {
    "build:manifest": "tsx scripts/build-manifest.ts",
    "prebuild": "npm run build:manifest",
    "dev": "npm run build:manifest && next dev"
  }
}
```

- `scripts/build-manifest.ts` scans `/content/python`, extracts frontmatter, outputs `content/manifest.json`
- Runs automatically before `build` and `dev` via npm lifecycle hooks
- Dashboard and sidebar import manifest as static JSON

## Project Structure

```
learn-python-app/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── layout.tsx               # Shell with nav
│   ├── globals.css              # Tailwind imports
│   ├── lessons/[...slug]/
│   │   └── page.tsx             # Lesson viewer
│   └── api/progress/
│       └── route.ts             # Read/write JSON
├── components/
│   ├── CodeEditor.tsx           # Monaco wrapper (client component)
│   ├── CodeRunner.tsx           # Pyodide execution + output
│   ├── PyodideProvider.tsx      # Context for shared Pyodide instance
│   ├── LessonRenderer.tsx       # Markdown → React
│   ├── ProgressSidebar.tsx      # Phase/lesson navigation
│   ├── LessonNav.tsx            # Prev/Next buttons
│   └── ErrorBoundary.tsx        # Catches Pyodide crashes
├── lib/
│   ├── pyodide.worker.ts        # Web Worker for code execution
│   ├── pyodide-context.tsx      # React context for Pyodide state
│   ├── lessons.ts               # Load/parse Markdown
│   ├── progress.ts              # Progress read/write helpers
│   ├── build-manifest.ts        # Generates curriculum manifest
│   └── rehype-code-blocks.ts    # Custom plugin for interactive blocks
├── content/
│   ├── python -> ../python      # Symlink to existing lessons
│   └── manifest.json            # Auto-generated at build
├── data/
│   └── progress.json            # User progress (gitignored)
├── public/
│   └── pyodide/                 # Optional: self-host WASM files
├── scripts/
│   └── build-manifest.ts        # CLI script for manifest generation
├── __tests__/                   # Test files
│   ├── lib/
│   └── components/
├── tsconfig.json                # TypeScript config (strict mode)
└── vitest.config.ts             # Test runner config
```

## Self-Hosting

**Development:**
```bash
npm run dev          # Hot reload at localhost:3000
```

**Production (local):**
```bash
npm run build        # Generates manifest, builds app
npm run start        # Runs at localhost:3000
```

**Persistent background:**
```bash
# Using PM2
pm2 start npm --name "learn-python" -- start
pm2 save
```

**Important Limitation:**
File-based progress (`/data/progress.json`) requires write access to the filesystem. This works for:
- Local development (`npm run dev`)
- Local production (`npm run start`)
- Self-hosted VPS/server

This will NOT work for:
- Vercel/Netlify (read-only filesystem)
- Static exports

If deploying to a platform without filesystem write access, switch to localStorage (client-side only) or add a database.

## Implementation Phases

### Phase 1: Foundation
1. Initialize Next.js project with Tailwind, TypeScript strict mode
2. Set up project structure and symlink content
3. Create manifest generation script (`scripts/build-manifest.ts`)
4. Build basic layout with sidebar navigation
5. **Test:** Manifest generates correctly from sample lesson

### Phase 2: Lesson Rendering
6. Implement Markdown parsing with gray-matter
7. Create LessonRenderer component
8. Build custom rehype plugin for code blocks (`lib/rehype-code-blocks.ts`)
9. Add prev/next navigation (LessonNav component)
10. **Test:** Lessons render with correct structure, navigation works

### Phase 3: Code Execution
11. Set up Pyodide Web Worker (`lib/pyodide.worker.ts`)
12. Create PyodideProvider context with loading states
13. Build CodeEditor (Monaco) with dynamic import, SSR disabled
14. Build CodeRunner with output display
15. Add ErrorBoundary for crash recovery
16. Implement package pre-loading from lesson `requires`
17. **Test:** Code executes, output displays, errors caught gracefully

### Phase 4: Progress Tracking
18. Create progress API routes (GET/POST `/api/progress`)
19. Build progress context and hooks (`useProgress`)
20. Add completion UI to lessons (checkmarks, "Mark Complete")
21. Build dashboard with phase cards and completion percentages
22. **Test:** Progress persists across page reloads

### Phase 5: Exercise Validation
23. Implement `expected` output matching (exact stdout comparison)
24. Implement `validate` assertion execution (run after user code)
25. Add pass/fail UI feedback (green checkmark / red X with message)
26. Connect exercise completion to progress tracking
27. **Test:** Exercises validate correctly, progress updates on pass

### Phase 6: Polish & QA
28. Add Pyodide loading progress indicator (percentage bar)
29. Style refinements (responsive, dark mode optional)
30. End-to-end test with full Phase 1 curriculum
31. Fix any bugs discovered during testing
32. Write README with setup instructions

## Future Considerations

- Multi-language support (add more curricula)
- Quiz/assessment system
- Spaced repetition for review
- Export progress to shareable format
