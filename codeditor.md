# Meridian Editor — Technical Specification

## Overview

Meridian is a code editor for a learning platform that prioritizes **perceived performance** through snappy micro-animations. The architecture is inspired by WaterWrite's native macOS approach, adapted for web.

---

## Core Principle

> **Snappy ≠ Smooth**
>
> - Smooth = 300ms ease-in-out (luxurious but laggy)
> - Snappy = 50ms linear (responsive and alive)

Good UX removes friction, not adds transitions.

---

## Animation Timing Standards

| Element | Duration | Easing | Notes |
|---------|----------|--------|-------|
| Character appear | 50ms | linear | Fade from 0 → 1 |
| Cursor movement | 50ms | linear | Position only |
| Cursor blink | 1000ms | step | 48% on, 2% transition, 50% dim |
| Theme switch | 50ms | linear | All colors simultaneously |
| Button hover | 50ms | linear | No transform, color only |
| Button press | 0ms | — | Instant scale(0.98) |
| Focus ring | 50ms | linear | Border color change |

**Hard rule**: Nothing in the typing path exceeds 50ms.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Hidden Layer                      │
│  <textarea> — handles all keyboard input natively    │
│  • Invisible (color: transparent)                    │
│  • No caret (caret-color: transparent)               │
│  • Full width/height of editor area                  │
│  • z-index: 10 (clickable)                           │
└─────────────────────────────────────────────────────┘
                         │
                         │ input event
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Visual Layer                       │
│  <div> containing <span> per character               │
│  • pointer-events: none                              │
│  • New characters get .new class (50ms fade)         │
│  • Selected characters get .selected class           │
│  • Syntax highlighting via span classes              │
└─────────────────────────────────────────────────────┘
                         │
                         │ position calculation
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Cursor Layer                       │
│  <div> absolutely positioned                         │
│  • 2px wide, line-height tall                        │
│  • transition: left 50ms, top 50ms                   │
│  • Custom blink: mostly on, quick dim                │
│  • .active class disables blink while typing         │
└─────────────────────────────────────────────────────┘
```

---

## Cursor Blink Pattern

WaterWrite's cursor is **mostly visible** with a quick dim, not a 50/50 blink:

```css
@keyframes blink {
  0%, 48% { opacity: 1; }
  50%, 100% { opacity: 0.15; }  /* dim, not invisible */
}
```

While typing, blink is disabled (cursor stays solid) and resumes after 400-500ms of inactivity.

---

## Input Handling

```
User types → textarea receives input → render() called
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
          Compare with lastText                           Update cursor position
                    │                                               │
        ┌───────────┴───────────┐                                   │
        │                       │                                   │
   Deletion?              Addition?                                 │
        │                       │                                   │
   Full re-render         Append new chars                          │
        │                  with .new class                          │
        │                       │                                   │
        └───────────┬───────────┘                                   │
                    │                                               │
                    ▼                                               ▼
              Update DOM                                    cursor.style.left/top
                                                           (50ms CSS transition)
```

---

## Performance Targets

| Metric | Target | Acceptable | Failure |
|--------|--------|------------|---------|
| Keystroke → char visible | < 16ms | < 33ms | > 50ms |
| Cursor position update | < 5ms | < 16ms | > 33ms |
| Full re-render (1000 chars) | < 50ms | < 100ms | > 200ms |
| Theme switch | < 50ms | < 100ms | > 150ms |

Measure with Chrome DevTools Performance tab or [Typometer](https://github.com/pavelfatin/typometer).

---

## Syntax Highlighting

Apply via CSS classes on character spans:

```javascript
// During render, detect token type
if (isKeyword(char, context)) {
  className += ' syntax-keyword';
} else if (inString) {
  className += ' syntax-string';
}
```

Token classes:
- `.syntax-keyword` — purple (`#C792EA` dark / `#7C3AED` light)
- `.syntax-string` — green (`#C3E88D` dark / `#16A34A` light)
- `.syntax-number` — orange (`#F78C6C` dark / `#EA580C` light)
- `.syntax-comment` — gray, italic (`#546E7A` dark / `#9CA3AF` light)
- `.syntax-function` — blue (`#82AAFF` dark / `#2563EB` light)

For production, use a proper tokenizer (Lezer, TreeSitter via WASM) but keep the visual layer approach.

---

## Color Tokens

### Dark Mode (default)
```css
--bg: #000000;
--surface: #0a0a0a;
--text: #ffffff;
--text-dim: rgba(255, 255, 255, 0.5);
--border: rgba(255, 255, 255, 0.08);
--cursor: #ffffff;
--accent: #4A90D9;
--selection: rgba(74, 144, 217, 0.25);
```

### Light Mode
```css
--bg: #F9F8F6;
--surface: #ffffff;
--text: #1a1a1a;
--text-dim: rgba(0, 0, 0, 0.5);
--border: rgba(0, 0, 0, 0.08);
--cursor: #1E3A5F;
--accent: #1E3A5F;
--selection: rgba(30, 58, 95, 0.15);
```

---

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Code | JetBrains Mono | 16px | 400 |
| UI Labels | Inter | 12-15px | 500-600 |
| Status bar | Inter | 11px | 400 |

Line height for code: `1.8` (comfortable reading, clear line separation)

---

## Component Hierarchy

```
<App>
  <Header>
    <Logo />
    <ThemeToggle />
  </Header>
  
  <EditorContainer>
    <HiddenTextarea />      ← Native input
    <VisualLayer>           ← Character spans
      <Char />
      <Char class="new" />
      <Char class="selected" />
      ...
    </VisualLayer>
    <Cursor />              ← Animated cursor
  </EditorContainer>
  
  <StatusBar>
    <WordCount />
    <CharCount />
    <CursorPosition />
  </StatusBar>
</App>
```

---

## What NOT To Do

| Anti-pattern | Why it fails |
|--------------|--------------|
| React state for each keystroke | Reconciliation adds 10-30ms |
| Custom cursor in React | Can't beat native/CSS timing |
| 300ms transitions | Feels laggy, not luxurious |
| Ease-in-out on typing | Linear feels more responsive |
| requestAnimationFrame for cursor | CSS transitions are GPU-accelerated |
| Syntax highlight before render | Blocks character appearance |
| Debouncing input | Adds latency, feels broken |

---

## Future Enhancements

### Phase 1: Core Editor
- [x] Hidden input + visual layer architecture
- [x] 50ms character animations
- [x] Snappy cursor with custom blink
- [x] Theme switching
- [ ] Line numbers
- [ ] Basic Python syntax highlighting

### Phase 2: IDE Features
- [ ] Multiple file tabs
- [ ] File tree sidebar
- [ ] Search/replace (Cmd+F)
- [ ] Code folding

### Phase 3: Execution
- [ ] Pyodide integration (Python in browser)
- [ ] Output panel with 50ms slide animation
- [ ] Error highlighting (inline, not modal)

### Phase 4: Learning Platform
- [ ] Lesson content alongside editor
- [ ] Step-by-step guidance
- [ ] Progress tracking
- [ ] Hint system

---

## References

- [WaterWrite macOS editor](uploaded Swift file) — Native CATextLayer architecture
- [Pavel Fatin: Typing with Pleasure](https://pavelfatin.com/typing-with-pleasure/) — Latency research
- [Typometer](https://github.com/pavelfatin/typometer) — Latency measurement tool
- [CodeMirror 6](https://codemirror.net/6/) — Production-ready alternative

---

## Summary

The Meridian editor achieves its snappy feel through:

1. **Separation of input and display** — Native textarea for input, custom layer for visuals
2. **50ms linear animations** — Fast enough to feel instant, slow enough to perceive
3. **Custom cursor behavior** — Mostly-on blink, solid while typing
4. **No framework in the hot path** — Vanilla JS for character rendering

This approach delivers sub-16ms perceived latency while maintaining visual polish.