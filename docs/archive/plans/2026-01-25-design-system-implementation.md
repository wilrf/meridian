# Design System Implementation Plan

**Date:** 2026-01-25
**Status:** Approved
**Scope:** Align learn-python-app with design docs

---

## Overview

Implement the LearnPython Design System, Implementation Guide, and Themes research doc. Focus on meaningful UI/UX improvements while keeping working infrastructure (react-markdown, file-based progress) intact.

---

## 1. Gamification Removal

**Philosophy:** "Invisible Excellence" — learning is the reward, not points.

### Files to modify:
- `components/StatsBar.tsx` — Remove XP, level, streak displays
- `components/Dashboard.tsx` — Remove gamification stats cards
- `components/CodeRunner.tsx` — Remove XP awards on exercise completion
- `lib/progress.ts` — Simplify to completion tracking only
- `lib/use-progress.ts` — Remove XP/streak hooks

### Files to delete:
- `components/SuccessCelebration.tsx` — Confetti celebration

### What remains:
- Completion checkmarks in sidebar
- "X of Y lessons complete" (informational)
- Exercise correct/incorrect feedback

---

## 2. Theme System

Three themes with CSS variable swapping:

| Theme | Canvas | Surface | Text Primary | Character |
|-------|--------|---------|--------------|-----------|
| Light | `#FAFAF9` | `#FFFFFF` | `#292524` | Warm, readable |
| Dark | `#121212` | `#1E1E1E` | `#E4E4E7` | Material standard |
| Snowy | `#2E3440` | `#3B4252` | `#ECEFF4` | Nord-inspired, gentle |

### Implementation:
- `[data-theme="dark"]` and `[data-theme="snowy"]` CSS selectors
- `lib/theme-context.tsx` — React context with `theme`, `setTheme`
- localStorage persistence with `prefers-color-scheme` fallback
- 200ms transition on theme change
- Code editor stays dark in all themes

### New files:
- `lib/theme-context.tsx`
- `components/ui/ThemeToggle.tsx`

### Modified files:
- `app/globals.css` — Theme variable blocks
- `app/layout.tsx` — ThemeProvider wrapper

---

## 3. UI Primitives

### New directory: `components/ui/`

**Button.tsx:**
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Design token colors, focus-visible ring, disabled states

**Card.tsx:**
- Variants: default, hover
- Uses --bg-surface, --border-default
- Consistent border-radius

**ThemeToggle.tsx:**
- Three-state: Light → Dark → Snowy
- Icons: Sun, Moon, Snowflake (inline SVG)

---

## 4. Design Token Alignment

### Add typography scale to globals.css:
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.333rem;
--text-2xl: 1.777rem;
```

### Cleanup:
- Remove `app/fonts/GeistVF.woff` and `app/fonts/GeistMonoVF.woff`
- Audit components for hardcoded hex values
- Verify WCAG contrast in all themes

---

## What stays unchanged

- Lesson rendering (react-markdown pipeline)
- Progress storage (file-based API)
- Pyodide worker setup
- Exercise validation (minus XP)
- Curriculum content structure

---

## Implementation order

1. Remove gamification (clears the path)
2. Add theme CSS variables (foundation)
3. Create ThemeProvider context
4. Build UI primitives (Button, Card)
5. Add ThemeToggle component
6. Integrate theme toggle into layout
7. Cleanup (fonts, audit tokens)
8. Test all three themes

---

## Success criteria

- [ ] No XP, levels, streaks, or confetti anywhere
- [ ] Theme toggle works and persists across sessions
- [ ] System preference detected on first visit
- [ ] All three themes pass WCAG AA contrast
- [ ] Button and Card components used throughout
- [ ] No hardcoded color values in components
