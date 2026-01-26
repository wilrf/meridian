# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Overview

**Meridian** - Interactive Python learning platform with in-browser code execution via Pyodide WebAssembly and cloud progress sync via Supabase.

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run build:manifest   # Regenerate curriculum manifest
npm run lint             # ESLint
```

## Directory Structure

```
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # OAuth callback & error
│   │   └── lessons/       # Dynamic lesson pages
│   ├── components/        # React components
│   │   ├── ui/            # Primitive UI components
│   │   └── editor/        # Monaco editor themes
│   ├── lib/               # Utilities & contexts
│   │   ├── supabase/      # Supabase clients
│   │   └── progress/      # Progress store
│   └── content/           # Curriculum
│       └── python/        # Lesson markdown files
├── public/                # Static assets
│   └── workers/           # Pyodide web worker
├── scripts/               # Build scripts
├── data/                  # Local progress (gitignored)
└── [config files]
```

## Architecture

### Code Pipeline

```
content/python/**/*.md → build-manifest.ts → manifest.json
                                ↓
                        LessonRenderer.tsx
                                ↓
                  remark-code-meta.ts + rehype-code-blocks.ts
                                ↓
                        CodeRunner.tsx (Monaco + Pyodide)
```

### Auth & Progress

- `lib/auth-context.tsx` — Authentication state (GitHub OAuth)
- `lib/use-progress.ts` — Routes to cloud (authenticated) or local (anonymous)
- `lib/cloud-progress.ts` — Supabase progress sync
- `lib/progress.ts` — Local file-based progress

### Pyodide Integration

- `public/workers/pyodide.worker.js` — Web Worker loading Pyodide
- `lib/pyodide-context.tsx` — React context with `runCode()`, `validateCode()`
- 5-second execution timeout, ~10MB initial download (cached)

### Theme System

Two themes: Ivory (light) and Velvet (dark).

- CSS variables in `app/globals.css` with `[data-theme="dark"]`
- Use `var(--*)` or semantic Tailwind classes, never hardcoded colors

## Code Block Syntax

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
```

## TypeScript

Strict mode with `noUncheckedIndexedAccess: true`:
```typescript
const item = arr[0]      // Type: T | undefined
const value = item ?? '' // Handle undefined
```

## Security & Deployment

### Environment Variables

- **`.env`** — Local secrets (gitignored)
- **`.env.example`** — Template with variable names only (committed)
- Only `NEXT_PUBLIC_*` prefixed variables are exposed to the browser
- Supabase anon key is safe to expose (designed for client-side use with RLS)

**Required variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Security Headers

Configured in both `next.config.mjs` and `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Pyodide workers require additional COOP/COEP headers (configured separately).

### Never Commit

- `.env` files (except `.env.example`)
- API keys, secrets, tokens
- Database credentials
- Private keys (`*.pem`)

### Vercel Deployment

- **Auto-deploy**: Pushes to `main` trigger production deploys
- **Preview deploys**: PRs get preview URLs automatically
- **Environment variables**: Set in Vercel Dashboard → Settings → Environment Variables
- **GitHub Actions**: CI runs lint, type-check, and build on PRs

### GitHub Best Practices

- **Dependabot**: Enabled for weekly dependency updates
- **Branch protection**: Require PR reviews and CI passing
- **Secret scanning**: Enabled by default on public repos
- **PR template**: Use `.github/PULL_REQUEST_TEMPLATE.md`
