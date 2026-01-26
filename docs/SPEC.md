# LearnPython — Product Specification

## What This Is

A self-hosted, interactive learning platform for Python programming. Think Codecademy, but:

- **Runs entirely in your browser** — no server-side execution, no accounts, no tracking
- **Project-based curriculum** — learn by building real things, not toy examples
- **You own everything** — your progress, your code, your data

## Why It Exists

Most coding education falls into two camps:

1. **Video courses** — passive, hard to retain, no feedback loop
2. **Interactive platforms** — great UX, but locked ecosystems with subscriptions

This platform takes the best of interactive learning (immediate feedback, runnable code, progress tracking) and puts it entirely under your control. No cloud dependencies. No monthly fees. Just Python in your browser.

## Core Philosophy

### Learn by Doing, Not Watching

Every lesson centers on writing and running real code. Theory exists to explain *why* the code works — never as filler.

### Projects Over Exercises

Exercises teach syntax. Projects teach thinking. The curriculum is structured around building actual programs:

- A number analyzer
- A text adventure game
- A data visualization dashboard

Each project introduces concepts as you need them, not in arbitrary order.

### Fail Fast, Learn Faster

Errors are features, not bugs. The platform:

- Shows clear, helpful error messages
- Lets you experiment freely (you can't break anything)
- Tracks attempts so you can see your own progress

## Design Principles

### Sleek, Clean, Professional

The UI should feel like a tool built by someone who respects your time:

| Principle | What It Means |
|-----------|---------------|
| **Minimal chrome** | No clutter. The lesson content is the focus. |
| **Generous whitespace** | Breathing room for dense technical content. |
| **Monospace where it matters** | Code is code. Don't stylize it into unreadability. |
| **Muted palette** | Soft grays, subtle accents. Eye-friendly for long sessions. |
| **Fast transitions** | Snappy, not slick. Animations serve function, not flair. |

### No Dark Patterns

- No gamification theater (streaks, badges, leaderboards)
- No artificial urgency
- No guilt for taking breaks
- Progress tracking is for *you*, not for engagement metrics

### Invisible Technology

The user shouldn't know or care that:

- Python runs via WebAssembly
- The editor is Monaco
- Progress is stored in a JSON file

It should just *work*.

## Architecture (Summary)

```
Browser
├── Next.js app (UI, routing, lesson rendering)
├── Monaco Editor (VS Code-quality editing)
├── Pyodide (Python via WebAssembly)
└── Local JSON (progress tracking)
```

No backend servers. No databases. No accounts.

## User Experience

### First Visit

1. Landing page with clear value prop
2. "Start Learning" → jumps directly into first lesson
3. No signup. No email capture. Just learning.

### During a Lesson

```
┌──────────────────────────────────────────────────────────────┐
│  ◀ Previous          Lesson Title               Next ▶      │
├────────────────────────────────┬─────────────────────────────┤
│                                │                             │
│  Lesson content with           │  Code Editor                │
│  explanations, examples,       │  ─────────────────          │
│  and context.                  │  # Your code here           │
│                                │                             │
│  ~~~python                     │                             │
│  print("Hello")                ├─────────────────────────────┤
│  ~~~                           │  Output                     │
│                                │  ─────────────────          │
│  Try it yourself:              │  Hello                      │
│                                │                             │
│  [Exercise block]              │  ✓ Exercise complete        │
│                                │                             │
└────────────────────────────────┴─────────────────────────────┘
```

### Progress Tracking

- Sidebar shows phase/lesson completion
- Checkmarks for completed lessons
- No percentage optimization games — just "done" or "not done"

## What Success Looks Like

A user should be able to:

1. Open the app
2. Learn Python fundamentals in a weekend
3. Build a real project they're proud of
4. Never think about the platform itself — only the code

## Non-Goals

Things this platform explicitly does **not** try to be:

- **A community** — no forums, comments, or social features
- **A credential** — no certificates, badges, or LinkedIn integrations
- **A business** — no analytics, no growth hacking, no monetization
- **Comprehensive** — focused curriculum, not a reference encyclopedia

## Technical Constraints

| Constraint | Reason |
|------------|--------|
| Browser-only execution | Privacy, simplicity, no server costs |
| File-based progress | Works offline, no database needed |
| Markdown lessons | Easy to author, version control friendly |
| Single-user design | Self-hosted means one person, one instance |

## Code Quality Standards

The codebase itself should embody the same values as the product:

### Clean

- No dead code
- No commented-out blocks
- No TODO comments that linger
- Every file has a clear purpose

### Readable

- Self-documenting names
- Small, focused functions
- Types everywhere (strict TypeScript)
- Comments explain *why*, not *what*

### Professional

- Consistent formatting (Prettier)
- Comprehensive error handling
- Graceful degradation
- No console.log debugging in production

### Simple

- Prefer boring technology
- No premature abstraction
- Flat is better than nested
- Dependencies are liabilities — earn their place

## File Organization

```
app/
├── app/              # Next.js routes (pages)
├── components/       # React components (UI)
├── lib/              # Business logic (no React)
├── content/          # Curriculum (Markdown)
└── data/             # User state (progress.json)
```

Every file should have an obvious home. If you're not sure where something goes, the structure is wrong.

---

*The best learning platform is one you forget you're using.*
