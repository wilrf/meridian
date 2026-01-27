# Meridian Logo Brief

## What is Meridian?

Meridian is an interactive Python learning platform. Users learn to code directly in their browser—no setup required. The platform features:

- **In-browser Python execution** via WebAssembly (Pyodide)
- **Interactive exercises** with automatic validation
- **Progress tracking** synced across devices
- **Structured curriculum** from fundamentals to machine learning

The name "Meridian" evokes navigation and journey—a line of longitude that guides you from one point to another.

## Design Aesthetic

**"Quiet Luxury"** — Think Aesop, Stripe, Linear. Premium but understated.

### Color Palette

| Role | Light Theme (Ivory) | Dark Theme (Velvet) |
|------|---------------------|---------------------|
| Primary Background | `#F9F8F6` warm ivory | `#0A0910` deep ink |
| Surface | `#FFFFFF` | `#141220` |
| Accent | `#1E3A5F` navy | `#1E3A5F` navy |
| Gold accent | `#B8A07E` | `#B8A07E` |
| Text | `#2C2825` warm black | `#E0DDD6` warm white |

### Typography
- Display: Satoshi (geometric sans)
- Body: Inter
- Code: JetBrains Mono

## Logo Direction

**Concept:** Navigation/journey executed with abstract minimalism.

### What it should convey
- Learning as a journey/path
- Navigation, direction, progress
- Premium, modern, tech-forward
- NOT literal (no snakes, graduation caps, books)

### Preferred approaches
1. **Single continuous line/path** — A minimal stroke that suggests movement, possibly forming an abstract "M"
2. **Intersecting lines at a point** — Like coordinates or a waypoint
3. **Circle with meridian arc** — Globe suggestion with single line through it

### Requirements
- Works at 16x16 (favicon), 40x40 (sidebar), and larger
- Looks good on both light and dark backgrounds
- Single color version must work (for monochrome contexts)
- Should feel geometric and precise, not hand-drawn

### What to avoid
- Literal Python snake imagery
- Compass roses or detailed navigation symbols
- Gradients that don't translate to single-color
- Overly complex marks that lose detail at small sizes

## Reference Examples

Brands with similar aesthetic:
- **Linear** — Clean geometric mark
- **Stripe** — Simple, confident
- **Vercel** — Triangle, works everywhere
- **Notion** — Minimal but memorable

## Files

- Color palette and theme: `src/app/globals.css`
- Current placeholder logo: `src/components/ProgressSidebar.tsx` (Python logo SVG)
- Rough concepts: `public/logo-concepts.svg`

## Deliverables Needed

1. Primary logomark (icon only)
2. Wordmark version (logo + "Meridian" text)
3. Favicon versions (16x16, 32x32, 180x180 for Apple)
4. SVG source files
5. Single-color versions (white, black, navy)
