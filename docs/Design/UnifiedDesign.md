# LearnPython Design System

**Version 2.0** | Quiet Luxury Edition

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Subtle Gradients](#6-subtle-gradients)
7. [Microinteractions](#7-microinteractions)
8. [Component Specifications](#8-component-specifications)
9. [Animation & Motion](#9-animation--motion)
10. [Responsive Design](#10-responsive-design)
11. [Accessibility](#11-accessibility)
12. [Implementation Guide](#12-implementation-guide)
13. [Quality Standards](#13-quality-standards)

---

## 1. Design Philosophy

### Core Principle: Invisible Excellence

The platform should feel like a precision instrument—every element exists for a reason, nothing demands attention that doesn't deserve it. Users should forget they're using software and remember only that they're learning Python.

### Quiet Luxury Aesthetic

Inspired by the sensibility of *Succession*, Brunello Cucinelli, and old-money design philosophy. This isn't minimalism for its own sake—it's restraint born from confidence.

**What Quiet Luxury Means for UI:**

| Principle | Application |
|-----------|-------------|
| **Restraint over flash** | No bright accents demanding attention |
| **Depth over brightness** | Rich, muted tones that feel inherited, not purchased |
| **Sophisticated neutrals** | Soft creams, warm taupes, deep grays |
| **Regal undertones** | Deep indigo, plum, navy—whispered, not shouted |
| **Quality in details** | Subtle gradients, refined microinteractions |

### The Three Pillars

**Respectful Minimalism**
Not minimalism for aesthetics, but minimalism born from respect for the user's time, attention, and intelligence. Every pixel earns its place.

**Functional Beauty**
Beautiful because it works perfectly, not despite functionality. The UI should feel like well-designed typography in a technical book—precise, readable, and quietly elegant.

**Learning-First Design**
Every design decision answers: "Does this help someone learn Python?" If the answer is unclear, remove it.

### Research-Backed Decisions

Our design choices are informed by visual cognition research:

- **Light mode for lesson content**: Studies show positive contrast polarity (dark text on light) improves readability, proofreading accuracy, and cognitive performance
- **Dark code editor**: Developer convention, reduces glare, and provides clear visual separation between learning and coding contexts
- **Warm backgrounds**: Reduce eye strain during extended reading sessions
- **Muted tones**: Lower cognitive load, convey sophistication, feel less fatiguing

---

## 2. Visual Identity

### Aesthetic Direction

**Inspiration Sources:**
- Succession (costume design, interiors)
- Brunello Cucinelli (quiet luxury fashion)
- Aesop (understated premium retail)
- Private libraries and studies
- Japanese wabi-sabi sensibility

**Tone**: Calm, sophisticated, regal, understated, warm
**Not**: Corporate, trendy, flashy, cold, generic

### Brand Personality

| Attribute | Expression |
|-----------|------------|
| **Intelligent** | Clean typography, generous whitespace, purposeful hierarchy |
| **Refined** | Muted color palette, subtle gradients, quality microinteractions |
| **Warm** | Ivory and cream tones, soft shadows, approachable typography |
| **Timeless** | Classic proportions, restrained design, nothing trend-driven |
| **Confident** | Quiet accent colors, no desperate attention-seeking |

### Mood Boards

**Light Mode — "Ivory"**
*A well-appointed private library. Cream linen, leather-bound books, brass reading lamp, afternoon light through tall windows.*

**Dark Mode — "Velvet"**
*A velvet-curtained study at dusk. Deep plum tones, soft lamplight, polished wood, understated luxury.*

---

## 3. Color System

### Design Token Architecture

```
Primitive Tokens (raw color values)
        ↓
Semantic Tokens (purposeful mappings)
        ↓
Component Tokens (specific usage)
```

---

### 3.1 Light Mode — "Ivory"

A warm, sophisticated theme inspired by old-money interiors and quiet luxury aesthetics.

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     LIGHT MODE: "IVORY"
     Warm, paper-inspired palette with regal undertones
     Mood: Private library, afternoon light, understated elegance
     ═══════════════════════════════════════════════════════════ */

  /* === PRIMITIVE TOKENS === */
  
  /* Ivory Scale — Warm cream foundation */
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
  
  /* Navy Accent — Deep, regal, timeless */
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
  
  /* Gold Accent — Quiet opulence, subtle warmth */
  --gold-50:  #FAF6F0;
  --gold-100: #F2EBD9;
  --gold-200: #E6D9B8;
  --gold-300: #D4C5A9;
  --gold-400: #C4B08E;
  --gold-500: #B8A07E;
  --gold-600: #9A8462;
  --gold-700: #7D6A4B;
  --gold-800: #5F5039;
  --gold-900: #423828;

  /* === SEMANTIC TOKENS — LIGHT MODE === */
  
  /* Backgrounds */
  --bg-canvas:     var(--ivory-50);      /* Page background */
  --bg-surface:    #FFFFFF;               /* Cards, panels */
  --bg-elevated:   #FFFFFF;               /* Modals, dropdowns */
  --bg-subtle:     var(--ivory-100);     /* Section backgrounds */
  --bg-muted:      var(--ivory-200);     /* Disabled states */
  --bg-inset:      var(--ivory-25);      /* Recessed areas */
  
  /* Text */
  --text-primary:   var(--ivory-900);    /* Headlines, emphasis */
  --text-secondary: var(--ivory-700);    /* Body text */
  --text-tertiary:  var(--ivory-600);    /* Supporting text */
  --text-muted:     var(--ivory-500);    /* Placeholders */
  --text-inverse:   var(--ivory-50);     /* On dark backgrounds */
  
  /* Borders */
  --border-subtle:  var(--ivory-100);    /* Subtle divisions */
  --border-default: var(--ivory-200);    /* Standard borders */
  --border-strong:  var(--ivory-300);    /* Emphasized borders */
  --border-focus:   var(--navy-600);     /* Focus rings */
  
  /* Interactive Elements */
  --interactive-primary:        var(--navy-800);
  --interactive-primary-hover:  var(--navy-700);
  --interactive-primary-active: var(--navy-900);
  --interactive-secondary:        var(--ivory-100);
  --interactive-secondary-hover:  var(--ivory-200);
  
  /* Accent */
  --accent-subtle:  var(--navy-50);
  --accent-light:   var(--navy-100);
  --accent-base:    var(--navy-800);
  --accent-strong:  var(--navy-700);
  --accent-glow:    var(--gold-500);     /* Hover glow, special moments */

  /* === SEMANTIC FEEDBACK COLORS — LIGHT MODE === */
  /* Muted, sophisticated — not alarming */
  
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
}
```

---

### 3.2 Dark Mode — "Velvet"

A rich, moody theme with plum-black depths and warm champagne accents.

```css
[data-theme="dark"] {
  /* ═══════════════════════════════════════════════════════════
     DARK MODE: "VELVET"
     Deep plum-black with warm champagne accents
     Mood: Velvet-curtained study at dusk, soft lamplight
     ═══════════════════════════════════════════════════════════ */

  /* === PRIMITIVE TOKENS — DARK === */
  
  /* Velvet Scale — Purple-black foundation */
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
  
  /* Champagne Accent — Quiet gold, sophisticated */
  --champagne-50:  #FAF8F3;
  --champagne-100: #F2EDE0;
  --champagne-200: #E8DCC4;
  --champagne-300: #D4C5A9;
  --champagne-400: #C4B191;
  --champagne-500: #B09D7A;
  --champagne-600: #96825F;
  --champagne-700: #7A6A4D;
  --champagne-800: #5E513B;
  --champagne-900: #433929;

  /* === SEMANTIC TOKENS — DARK MODE === */
  
  /* Backgrounds — Plum-black depth */
  --bg-canvas:     var(--velvet-950);    /* Deepest background */
  --bg-surface:    var(--velvet-900);    /* Cards, panels */
  --bg-elevated:   var(--velvet-800);    /* Modals, dropdowns */
  --bg-subtle:     var(--velvet-700);    /* Sections, hover states */
  --bg-muted:      var(--velvet-800);    /* Disabled states */
  --bg-inset:      #08060B;              /* Deeply recessed areas */
  
  /* Text — Warm off-whites */
  --text-primary:   var(--velvet-50);    /* Headlines, emphasis */
  --text-secondary: var(--velvet-100);   /* Body text */
  --text-tertiary:  var(--velvet-200);   /* Supporting text */
  --text-muted:     var(--velvet-400);   /* Placeholders */
  --text-inverse:   var(--velvet-950);   /* On light backgrounds */
  
  /* Borders */
  --border-subtle:  var(--velvet-800);   /* Subtle divisions */
  --border-default: var(--velvet-700);   /* Standard borders */
  --border-strong:  var(--velvet-600);   /* Emphasized borders */
  --border-focus:   var(--champagne-300);/* Focus rings */
  
  /* Interactive Elements */
  --interactive-primary:        var(--champagne-300);
  --interactive-primary-hover:  var(--champagne-200);
  --interactive-primary-active: var(--champagne-400);
  --interactive-secondary:        var(--velvet-800);
  --interactive-secondary-hover:  var(--velvet-700);
  
  /* Accent */
  --accent-subtle:  rgba(212, 197, 169, 0.08);
  --accent-light:   rgba(212, 197, 169, 0.15);
  --accent-base:    var(--champagne-300);
  --accent-strong:  var(--champagne-200);
  --accent-glow:    var(--champagne-300);

  /* === SEMANTIC FEEDBACK COLORS — DARK MODE === */
  /* Softer, warmer for dark backgrounds */
  
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
}
```

---

### 3.3 Code Editor Theme — "Ink"

A dedicated dark theme that harmonizes with both modes, using the same plum-black foundation.

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     CODE EDITOR: "INK"
     Always dark, plum-black foundation matching Velvet
     Warm, muted syntax colors for reduced eye strain
     ═══════════════════════════════════════════════════════════ */
  
  /* Editor Chrome */
  --editor-bg:              #0A0910;     /* Deep plum-black */
  --editor-bg-highlight:    #13111A;     /* Current line */
  --editor-bg-selection:    #2D2640;     /* Selection — purple tint */
  --editor-gutter:          #0A0910;     /* Gutter background */
  --editor-gutter-border:   #1A1724;     /* Gutter separator */
  
  /* Editor Text */
  --editor-text:            #E0DDD6;     /* Default text — warm off-white */
  --editor-text-muted:      #6E6880;     /* Line numbers, comments base */
  
  /* Syntax Highlighting — Muted, sophisticated palette */
  --syntax-keyword:    #C9A0DC;          /* if, for, def, class — soft lavender */
  --syntax-string:     #A8C4A0;          /* String literals — muted sage */
  --syntax-number:     #D4B896;          /* Numeric literals — soft gold */
  --syntax-function:   #93B5CF;          /* Function names — dusty blue */
  --syntax-class:      #D4B896;          /* Class names — soft gold */
  --syntax-variable:   #E0DDD6;          /* Variables — default text */
  --syntax-operator:   #B8A8C8;          /* Operators — muted purple */
  --syntax-comment:    #6E6880;          /* Comments — muted purple-gray */
  --syntax-constant:   #C9A0DC;          /* True, False, None — lavender */
  --syntax-builtin:    #93B5CF;          /* Built-in functions — dusty blue */
  --syntax-decorator:  #B8A07E;          /* Decorators — quiet gold */
  --syntax-parameter:  #C4B8A0;          /* Parameters — warm tan */
}
```

---

### 3.4 Output Panel Theme

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     OUTPUT PANEL
     Terminal-inspired, matching editor darkness
     ═══════════════════════════════════════════════════════════ */
  
  --output-bg:           #08060B;        /* Slightly deeper than editor */
  --output-text:         #E0DDD6;        /* Warm off-white */
  --output-text-muted:   #6E6880;        /* Muted purple-gray */
  --output-success:      #8BB396;        /* Muted sage */
  --output-error:        #D98B8B;        /* Muted coral */
  --output-warning:      #D4B896;        /* Soft gold */
  --output-info:         #93B5CF;        /* Dusty blue */
  --output-border:       #1A1724;        /* Subtle purple border */
}
```

---

### 3.5 Color Usage Summary

| Element | Light "Ivory" | Dark "Velvet" |
|---------|---------------|---------------|
| **Page background** | Warm ivory `#F9F8F6` | Plum-black `#0C0A10` |
| **Card surfaces** | White | Deep aubergine `#110E16` |
| **Primary text** | Warm charcoal `#2C2825` | Soft ivory `#EDEBE6` |
| **Secondary text** | Taupe `#524B42` | Dusty lavender `#D4D0DC` |
| **Primary button** | Deep navy `#1E3A5F` | Champagne `#D4C5A9` |
| **Button hover glow** | Soft gold `#B8A07E` | Champagne `#D4C5A9` |
| **Focus ring** | Navy `#334E68` | Champagne `#D4C5A9` |
| **Success** | Muted sage `#5E8C6A` | Soft sage `#8BB396` |
| **Error** | Dusty rose `#C4616C` | Muted coral `#D98B8B` |
| **Code editor** | Always Ink theme | Always Ink theme |

---

## 4. Typography

### Font Stack

```css
:root {
  /* Display & Headings — Geometric, modern, warm */
  --font-display: 'Satoshi', -apple-system, BlinkMacSystemFont, 
                  'Segoe UI', system-ui, sans-serif;
  
  /* Body — Clean, highly readable */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', system-ui, sans-serif;
  
  /* Code — Designed for programming */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 
               'Cascadia Code', monospace;
}
```

### Why These Fonts

| Font | Role | Rationale |
|------|------|-----------|
| **Satoshi** | Headlines | Geometric but warm; modern without being cold; has personality while remaining understated |
| **Inter** | Body text | Exceptional readability; extensive character set; optimized for screens |
| **JetBrains Mono** | Code | Purpose-built for programming; excellent ligatures; clear differentiation of similar characters |

### Type Scale (1.250 ratio — Major Third)

```css
:root {
  /* Size Scale */
  --text-xs:   0.75rem;     /* 12px — Captions, badges */
  --text-sm:   0.875rem;    /* 14px — Secondary text, labels */
  --text-base: 1rem;        /* 16px — Body text */
  --text-lg:   1.125rem;    /* 18px — Lead paragraphs */
  --text-xl:   1.25rem;     /* 20px — H5, card titles */
  --text-2xl:  1.563rem;    /* 25px — H4 */
  --text-3xl:  1.953rem;    /* 31px — H3 */
  --text-4xl:  2.441rem;    /* 39px — H2 */
  --text-5xl:  3.052rem;    /* 49px — H1 */
  --text-6xl:  3.815rem;    /* 61px — Display */
  
  /* Line Heights */
  --leading-none:    1;
  --leading-tight:   1.2;
  --leading-snug:    1.35;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   1.75;
  
  /* Font Weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
  --weight-black:    900;
  
  /* Letter Spacing */
  --tracking-tighter: -0.04em;
  --tracking-tight:   -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.02em;
  --tracking-wider:   0.04em;
}
```

### Typography Presets

```css
/* Display — Hero headlines */
.text-display {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
}

/* H1 — Page titles */
.text-h1 {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* H2 — Section headers */
.text-h2 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* H3 — Subsection headers */
.text-h3 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* H4 — Card headers */
.text-h4 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* H5 — Small headers */
.text-h5 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

/* Body — Default reading text */
.text-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* Body Large — Lead paragraphs */
.text-body-lg {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

/* Small — Secondary information */
.text-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}

/* Caption — Labels, metadata */
.text-caption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Code Inline */
.text-code-inline {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--bg-subtle);
  color: var(--text-primary);
  padding: 0.125em 0.375em;
  border-radius: 0.25rem;
}

/* Code Block */
.text-code-block {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  tab-size: 4;
}
```

---

## 5. Spacing & Layout

### Spacing Scale (4px base unit)

```css
:root {
  --space-0:    0;
  --space-px:   1px;
  --space-0.5:  0.125rem;   /* 2px */
  --space-1:    0.25rem;    /* 4px */
  --space-1.5:  0.375rem;   /* 6px */
  --space-2:    0.5rem;     /* 8px */
  --space-2.5:  0.625rem;   /* 10px */
  --space-3:    0.75rem;    /* 12px */
  --space-3.5:  0.875rem;   /* 14px */
  --space-4:    1rem;       /* 16px */
  --space-5:    1.25rem;    /* 20px */
  --space-6:    1.5rem;     /* 24px */
  --space-7:    1.75rem;    /* 28px */
  --space-8:    2rem;       /* 32px */
  --space-9:    2.25rem;    /* 36px */
  --space-10:   2.5rem;     /* 40px */
  --space-11:   2.75rem;    /* 44px */
  --space-12:   3rem;       /* 48px */
  --space-14:   3.5rem;     /* 56px */
  --space-16:   4rem;       /* 64px */
  --space-20:   5rem;       /* 80px */
  --space-24:   6rem;       /* 96px */
  --space-28:   7rem;       /* 112px */
  --space-32:   8rem;       /* 128px */
}
```

### Layout Dimensions

```css
:root {
  /* Sidebar */
  --sidebar-width:           280px;
  --sidebar-width-collapsed: 64px;
  
  /* Navigation */
  --nav-height:              56px;
  
  /* Content */
  --content-max-width:       720px;
  --content-padding-x:       var(--space-8);
  
  /* Editor */
  --editor-min-width:        400px;
  --output-panel-height:     200px;
  
  /* Border Radius */
  --radius-sm:   0.25rem;    /* 4px */
  --radius-md:   0.5rem;     /* 8px */
  --radius-lg:   0.75rem;    /* 12px */
  --radius-xl:   1rem;       /* 16px */
  --radius-2xl:  1.5rem;     /* 24px */
  --radius-full: 9999px;
}
```

### Spacing Philosophy

| Context | Spacing |
|---------|---------|
| **Component internal padding** | space-4 to space-6 |
| **Between related elements** | space-2 to space-4 |
| **Between sections** | space-10 to space-16 |
| **Page margins (mobile)** | space-4 to space-6 |
| **Page margins (desktop)** | space-8 to space-12 |
| **Generous whitespace** | When in doubt, add more space |

---

## 6. Subtle Gradients

### Philosophy

Gradients should be felt, not seen. They add depth and dimension without being decorative. All gradients are < 10% color shift.

### Gradient Tokens

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     SUBTLE GRADIENTS
     Imperceptible but textural — adds depth without decoration
     ═══════════════════════════════════════════════════════════ */
  
  /* Page Canvas — Diagonal wash for dimension (2-3% shift) */
  --gradient-canvas-light: linear-gradient(
    135deg,
    #F9F8F6 0%,
    #F7F5F2 50%,
    #F5F3EF 100%
  );
  
  --gradient-canvas-dark: linear-gradient(
    135deg,
    #0C0A10 0%,
    #0E0B13 50%,
    #100D16 100%
  );
  
  /* Primary Button — Within same hue (5% shift) */
  --gradient-button-primary-light: linear-gradient(
    180deg,
    #243B53 0%,
    #1E3A5F 50%,
    #1A3456 100%
  );
  
  --gradient-button-primary-dark: linear-gradient(
    180deg,
    #D9CBAF 0%,
    #D4C5A9 50%,
    #CEBFA3 100%
  );
  
  /* Card Hover — Gradient border that fades in */
  --gradient-border-hover-light: linear-gradient(
    135deg,
    var(--gold-400) 0%,
    var(--gold-300) 50%,
    var(--gold-400) 100%
  );
  
  --gradient-border-hover-dark: linear-gradient(
    135deg,
    var(--champagne-400) 0%,
    var(--champagne-300) 50%,
    var(--champagne-400) 100%
  );
  
  /* Progress Bar — Along fill direction */
  --gradient-progress-light: linear-gradient(
    90deg,
    var(--navy-700) 0%,
    var(--navy-600) 100%
  );
  
  --gradient-progress-dark: linear-gradient(
    90deg,
    var(--champagne-400) 0%,
    var(--champagne-300) 100%
  );
  
  /* Editor Gutter — Vertical wash (extremely subtle) */
  --gradient-gutter: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}
```

### Gradient Usage Examples

```css
/* Page background with subtle gradient */
body {
  background: var(--gradient-canvas-light);
}

[data-theme="dark"] body {
  background: var(--gradient-canvas-dark);
}

/* Primary button with subtle gradient */
.btn-primary {
  background: var(--gradient-button-primary-light);
}

[data-theme="dark"] .btn-primary {
  background: var(--gradient-button-primary-dark);
}

/* Card with gradient border on hover */
.card {
  position: relative;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--gradient-border-hover-light);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.card:hover::before {
  opacity: 1;
}
```

---

## 7. Microinteractions

### Philosophy

Microinteractions make the UI feel alive and responsive. They should be:
- **Subtle** — Never distracting or theatrical
- **Fast** — 150-250ms maximum
- **Purposeful** — Every animation communicates something
- **Accessible** — Respect `prefers-reduced-motion`

### Interaction Catalog

| Element | Trigger | Effect | Duration |
|---------|---------|--------|----------|
| **Buttons** | Hover | Lift (translateY -2px) + soft glow shadow | 150ms |
| **Buttons** | Active/Click | Scale down (0.98) + shadow compress | 75ms |
| **Cards** | Hover | Border gradient fades in + subtle lift | 200ms |
| **Nav items** | Hover | Background fades in + text color shifts | 150ms |
| **Links** | Hover | Underline slides in from left | 200ms |
| **Checkboxes** | Complete | Checkmark draws with stroke animation | 300ms |
| **Progress bar** | Fill | Smooth width + slight overshoot | 500ms |
| **Run button** | Hover | Subtle pulse glow | 1500ms loop |
| **Theme toggle** | Click | Icon rotates smoothly | 300ms |
| **Success state** | Trigger | Soft scale bounce + glow pulse | 400ms |
| **Input focus** | Focus | Border color transition + subtle glow | 150ms |
| **Dropdown** | Open | Scale from 0.95 + fade in | 200ms |

### Implementation Examples

```css
/* ═══════════════════════════════════════════════════════════
   BUTTON MICROINTERACTIONS
   ═══════════════════════════════════════════════════════════ */

.btn {
  position: relative;
  transform: translateY(0);
  transition: 
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

/* Hover — Lift + Glow */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px -2px rgba(30, 58, 95, 0.25),
    0 0 0 1px rgba(184, 160, 126, 0.1); /* Gold glow */
}

[data-theme="dark"] .btn-primary:hover {
  box-shadow: 
    0 4px 12px -2px rgba(212, 197, 169, 0.2),
    0 0 0 1px rgba(212, 197, 169, 0.15);
}

/* Active — Compress */
.btn:active {
  transform: translateY(0) scale(0.98);
  transition-duration: var(--duration-instant);
}

/* ═══════════════════════════════════════════════════════════
   LINK UNDERLINE SLIDE
   ═══════════════════════════════════════════════════════════ */

.link-underline {
  position: relative;
  text-decoration: none;
}

.link-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width var(--duration-normal) var(--ease-out);
}

.link-underline:hover::after {
  width: 100%;
}

/* ═══════════════════════════════════════════════════════════
   CHECKBOX CHECKMARK DRAW
   ═══════════════════════════════════════════════════════════ */

.checkbox-icon {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset var(--duration-slow) var(--ease-out);
}

.checkbox:checked + .checkbox-icon {
  stroke-dashoffset: 0;
}

/* ═══════════════════════════════════════════════════════════
   INPUT FOCUS GLOW
   ═══════════════════════════════════════════════════════════ */

.input {
  border: 1px solid var(--border-default);
  transition: 
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

[data-theme="dark"] .input:focus {
  box-shadow: 0 0 0 3px rgba(212, 197, 169, 0.1);
}

/* ═══════════════════════════════════════════════════════════
   RUN BUTTON PULSE GLOW
   ═══════════════════════════════════════════════════════════ */

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(184, 160, 126, 0);
  }
  50% {
    box-shadow: 0 0 16px 4px rgba(184, 160, 126, 0.15);
  }
}

.btn-run:hover {
  animation: pulse-glow 1.5s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS CELEBRATION
   ═══════════════════════════════════════════════════════════ */

@keyframes success-bounce {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes success-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(94, 140, 106, 0.4);
  }
  100% {
    box-shadow: 0 0 0 12px rgba(94, 140, 106, 0);
  }
}

.success-indicator {
  animation: 
    success-bounce 400ms var(--ease-spring),
    success-glow 600ms var(--ease-out);
}

/* ═══════════════════════════════════════════════════════════
   DROPDOWN SCALE IN
   ═══════════════════════════════════════════════════════════ */

.dropdown-menu {
  transform-origin: top;
  transform: scale(0.95);
  opacity: 0;
  transition: 
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.dropdown-menu[data-open="true"] {
  transform: scale(1);
  opacity: 1;
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR FILL WITH OVERSHOOT
   ═══════════════════════════════════════════════════════════ */

@keyframes progress-fill {
  0% {
    transform: scaleX(0);
  }
  80% {
    transform: scaleX(1.02);
  }
  100% {
    transform: scaleX(1);
  }
}

.progress-bar-fill {
  transform-origin: left;
  animation: progress-fill 500ms var(--ease-spring);
}

/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE ROTATION
   ═══════════════════════════════════════════════════════════ */

.theme-toggle-icon {
  transition: transform var(--duration-slow) var(--ease-spring);
}

.theme-toggle:hover .theme-toggle-icon {
  transform: rotate(15deg);
}

.theme-toggle:active .theme-toggle-icon {
  transform: rotate(-15deg);
}
```

---

## 8. Component Specifications

### 8.1 Button Component

```tsx
// components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium
   transition-all duration-150 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        primary: `
          bg-[var(--interactive-primary)] text-[var(--text-inverse)]
          hover:bg-[var(--interactive-primary-hover)]
          hover:-translate-y-0.5
          hover:shadow-lg hover:shadow-[var(--accent-glow)]/20
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--border-focus)]
        `,
        secondary: `
          bg-[var(--bg-subtle)] text-[var(--text-secondary)]
          border border-[var(--border-default)]
          hover:bg-[var(--interactive-secondary-hover)]
          hover:border-[var(--border-strong)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]
        `,
        ghost: `
          text-[var(--text-secondary)]
          hover:bg-[var(--bg-subtle)]
          hover:text-[var(--text-primary)]
          active:scale-[0.98]
        `,
        danger: `
          bg-[var(--error-base)] text-white
          hover:bg-[var(--error-strong)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--error-base)]
        `,
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
```

### 8.2 Card Component with Gradient Border

```tsx
// components/ui/Card.tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  className,
  variant = "default",
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl transition-all duration-200",
        // Variants
        variant === "default" && "bg-[var(--bg-surface)] border border-[var(--border-subtle)]",
        variant === "elevated" && "bg-[var(--bg-elevated)] shadow-lg shadow-black/5",
        variant === "interactive" && `
          bg-[var(--bg-surface)] border border-[var(--border-subtle)]
          hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5
          cursor-pointer
          before:absolute before:inset-0 before:rounded-xl before:p-px
          before:bg-gradient-to-br before:from-[var(--accent-glow)] before:via-transparent before:to-[var(--accent-glow)]
          before:opacity-0 before:transition-opacity before:duration-200
          hover:before:opacity-100
          before:-z-10
        `,
        // Padding
        padding === "none" && "",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### 8.3 Input with Focus Glow

```tsx
// components/ui/Input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          `w-full h-10 px-3 rounded-lg
           bg-[var(--bg-surface)] text-[var(--text-primary)]
           border transition-all duration-150 ease-out
           placeholder:text-[var(--text-muted)]
           focus:outline-none`,
          error
            ? "border-[var(--error-base)] focus:border-[var(--error-base)] focus:shadow-[0_0_0_3px_var(--error-subtle)]"
            : "border-[var(--border-default)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--accent-subtle)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
```

### 8.4 Split Pane Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back    Phase 1: Fundamentals > Variables                   Next →  │
│  [height: 56px | border-bottom: 1px solid var(--border-default)]       │
├────────────────────────────────┬────────────────────────────────────────┤
│                                │                                        │
│   LESSON CONTENT               │   CODE EDITOR                          │
│   [min-width: 400px]           │   [min-width: 400px]                   │
│   [padding: var(--space-8)]    │   [Monaco Editor — Ink theme]          │
│   [bg: var(--bg-canvas)]       │   [bg: var(--editor-bg)]               │
│                                │                                        │
│   • Markdown rendered          │                                        │
│   • Code examples highlighted  ├────────────────────────────────────────┤
│   • Interactive exercises      │   OUTPUT PANEL                         │
│                                │   [height: 200px or 30%]               │
│                                │   [bg: var(--output-bg)]               │
│                                │   [font: var(--font-mono)]             │
│                                │                                        │
└────────────────────────────────┴────────────────────────────────────────┘
```

### 8.5 Exercise Block

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  EXERCISE                                        [Hint] [Reset] │
│                                                                 │
│  ───────────────────────────────────────────────────────────── │
│                                                                 │
│  Create a variable called `greeting` and assign the string     │
│  "Hello, World!" to it. Then, print the variable.              │
│                                                                 │
│  Expected output:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Hello, World!                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                            [▶ Run Code]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Visual specs (Light Mode):
- Border-left: 3px solid var(--navy-600)
- Background: var(--navy-50)
- Border-radius: var(--radius-lg)
- Padding: var(--space-6)

Visual specs (Dark Mode):
- Border-left: 3px solid var(--champagne-400)
- Background: var(--accent-subtle)
```

### 8.6 Progress Sidebar

```
┌──────────────────────────────────┐
│                                  │
│  LearnPython                     │   [Satoshi, semibold]
│                                  │
│  ─────────────────────────────── │
│                                  │
│  PHASE 1 · FUNDAMENTALS          │   [Caption style, muted]
│                                  │
│  ✓  Variables                    │   [Success color + checkmark]
│  ✓  Data Types                   │
│  →  Operators                    │   [Accent color + medium weight]
│     Strings                      │   [Secondary text color]
│     Lists                        │
│     Dictionaries                 │
│                                  │
│  ─────────────────────────────── │
│                                  │
│  PHASE 2 · CONTROL FLOW          │   [Muted until Phase 1 done]
│                                  │
│     Conditionals                 │
│     Loops                        │
│     Functions                    │
│                                  │
│  ─────────────────────────────── │
│                                  │
│  Progress                        │
│  ████████░░░░░░░░░░░░░░ 33%      │   [Gradient fill]
│                                  │
└──────────────────────────────────┘

Width: 280px
Background: var(--bg-surface)
Border-right: 1px solid var(--border-subtle)
```

### 8.7 Code Editor Configuration

```typescript
// Monaco Editor options for "Ink" theme
const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 14,
  lineHeight: 24,
  letterSpacing: 0.5,
  padding: { top: 20, bottom: 20 },
  
  // Appearance
  theme: 'learnpython-ink',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'line',
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  glyphMargin: false,
  folding: false,
  renderWhitespace: 'none',
  
  // Behavior
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  automaticLayout: true,
  
  // Features
  quickSuggestions: true,
  parameterHints: { enabled: true },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
};

// Custom "Ink" theme definition
monaco.editor.defineTheme('learnpython-ink', {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: 'E0DDD6', background: '0A0910' },
    { token: 'comment', foreground: '6E6880', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'C9A0DC' },
    { token: 'string', foreground: 'A8C4A0' },
    { token: 'number', foreground: 'D4B896' },
    { token: 'function', foreground: '93B5CF' },
    { token: 'class', foreground: 'D4B896' },
    { token: 'variable', foreground: 'E0DDD6' },
    { token: 'operator', foreground: 'B8A8C8' },
    { token: 'constant', foreground: 'C9A0DC' },
    { token: 'builtin', foreground: '93B5CF' },
    { token: 'decorator', foreground: 'B8A07E' },
    { token: 'parameter', foreground: 'C4B8A0' },
  ],
  colors: {
    'editor.background': '#0A0910',
    'editor.foreground': '#E0DDD6',
    'editor.lineHighlightBackground': '#13111A',
    'editor.selectionBackground': '#2D2640',
    'editorLineNumber.foreground': '#6E6880',
    'editorLineNumber.activeForeground': '#A9A3B3',
    'editorCursor.foreground': '#D4C5A9',
    'editor.selectionHighlightBackground': '#2D264040',
    'editorIndentGuide.background': '#1A1724',
    'editorIndentGuide.activeBackground': '#2A2533',
  },
});
```

---

## 9. Animation & Motion

### Timing Tokens

```css
:root {
  /* Durations */
  --duration-instant:  75ms;
  --duration-fast:     150ms;
  --duration-normal:   200ms;
  --duration-slow:     300ms;
  --duration-slower:   500ms;
  
  /* Easing */
  --ease-linear:       linear;
  --ease-in:           cubic-bezier(0.4, 0, 1, 1);
  --ease-out:          cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:       cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce:       cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Keyframe Animations

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Checkmark Draw */
@keyframes checkmark-draw {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}

/* Pulse Glow */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); opacity: 0; }
  50% { box-shadow: 0 0 16px 4px var(--accent-glow); opacity: 0.15; }
}

/* Progress Fill with Overshoot */
@keyframes progress-fill {
  0% { transform: scaleX(0); }
  80% { transform: scaleX(1.02); }
  100% { transform: scaleX(1); }
}

/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Success Bounce */
@keyframes success-bounce {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 10. Responsive Design

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Layout Adaptations

**Desktop (≥1024px)**
- Side-by-side lesson + editor layout
- Progress sidebar visible
- Full navigation with breadcrumbs
- Hover states enabled

**Tablet (768px – 1023px)**
- Stacked layout OR narrower 50/50 split
- Collapsible sidebar (hamburger menu)
- Touch-friendly controls (48px minimum targets)
- Slightly reduced spacing

**Mobile (<768px)**
- Single-column, tabbed interface: Lesson | Code | Output
- Bottom navigation bar
- Full-width components
- Larger touch targets (minimum 44px)
- Swipe gestures for tab switching

---

## 11. Accessibility

### Requirements

| Standard | Requirement |
|----------|-------------|
| **WCAG Level** | AA minimum |
| **Color contrast (body)** | 4.5:1 |
| **Color contrast (large text)** | 3:1 |
| **Color contrast (UI)** | 3:1 |
| **Touch targets** | 44px minimum |
| **Focus indicators** | Visible, 2px ring |

### Focus Styles

```css
/* Focus visible (keyboard only) */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 1rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  z-index: 100;
  border-radius: var(--radius-md);
}

.skip-link:focus {
  top: 1rem;
  left: 1rem;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color Contrast Verification

| Combination | Ratio | Passes |
|-------------|-------|--------|
| Ivory text-primary on bg-canvas | 13.2:1 | ✅ AAA |
| Ivory text-secondary on bg-canvas | 7.8:1 | ✅ AAA |
| Ivory text-tertiary on bg-canvas | 5.2:1 | ✅ AA |
| Velvet text-primary on bg-canvas | 14.1:1 | ✅ AAA |
| Velvet text-secondary on bg-canvas | 10.3:1 | ✅ AAA |
| Navy button text (white) | 8.9:1 | ✅ AAA |
| Champagne button text (dark) | 10.2:1 | ✅ AAA |

---

## 12. Implementation Guide

### 12.1 Project Setup

```bash
# Initialize project
npx create-next-app@latest learn-python --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd learn-python

# Core dependencies
npm install @monaco-editor/react zustand @next/mdx @mdx-js/loader @mdx-js/react

# Syntax highlighting for MDX
npm install rehype-highlight rehype-slug remark-gfm

# UI utilities
npm install clsx tailwind-merge class-variance-authority

# Fonts
npm install @fontsource/inter @fontsource-variable/satoshi @fontsource/jetbrains-mono

# Development
npm install -D @types/mdx
```

### 12.2 Font Setup

```tsx
// app/layout.tsx
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/satoshi';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
```

### 12.3 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        accent: {
          subtle: "var(--accent-subtle)",
          light: "var(--accent-light)",
          DEFAULT: "var(--accent-base)",
          strong: "var(--accent-strong)",
          glow: "var(--accent-glow)",
        },
        success: {
          subtle: "var(--success-subtle)",
          DEFAULT: "var(--success-base)",
          strong: "var(--success-strong)",
        },
        error: {
          subtle: "var(--error-subtle)",
          DEFAULT: "var(--error-base)",
          strong: "var(--error-strong)",
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
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 12.4 CSS Variables (globals.css)

See Section 3 for complete color definitions. Key structure:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Font families */
  --font-display: 'Satoshi Variable', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* All Ivory (Light) tokens here... */
}

[data-theme="dark"] {
  /* All Velvet (Dark) tokens here... */
}

/* Base styles */
body {
  font-family: var(--font-body);
  color: var(--text-secondary);
  background: var(--bg-canvas);
  -webkit-font-smoothing: antialiased;
}

/* Gradient canvas background */
body {
  background-image: var(--gradient-canvas-light);
  background-attachment: fixed;
}

[data-theme="dark"] body {
  background-image: var(--gradient-canvas-dark);
}
```

### 12.5 File Structure

```
learn-python/
├── app/
│   ├── layout.tsx              # Root layout, theme provider
│   ├── page.tsx                # Landing page
│   ├── globals.css             # CSS variables, base styles
│   └── lesson/
│       └── [phase]/[slug]/
│           └── page.tsx        # Dynamic lesson page
│
├── components/
│   ├── ui/                     # Primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   │
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SplitPane.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── editor/                 # Code editor
│   │   ├── CodeEditor.tsx      # Monaco wrapper
│   │   ├── OutputPanel.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── themes/
│   │       └── ink.ts          # Custom Monaco theme
│   │
│   └── lesson/                 # Lesson components
│       ├── LessonContent.tsx
│       ├── ExerciseBlock.tsx
│       ├── ProgressIndicator.tsx
│       └── LessonNavigation.tsx
│
├── lib/
│   ├── utils.ts                # cn() helper
│   ├── pyodide/
│   │   ├── worker.ts           # Web Worker
│   │   └── pyodide-manager.ts
│   ├── progress/
│   │   └── progress-store.ts   # Zustand store
│   └── mdx/
│       └── mdx-components.tsx
│
├── content/                    # Curriculum (MDX)
│   ├── phase-1/
│   │   ├── 01-variables.mdx
│   │   └── ...
│   └── phase-2/
│       └── ...
│
└── public/
    └── fonts/
```

### 12.6 Implementation Order

**Week 1: Foundation**
1. Project setup and dependencies
2. CSS variables (Ivory + Velvet + Ink themes)
3. Tailwind configuration
4. Font loading and typography presets
5. Base layout with theme toggle

**Week 2: Components**
1. Button with microinteractions
2. Card with gradient border hover
3. Input with focus glow
4. Badge, Progress bar
5. Sidebar with navigation

**Week 3: Editor Integration**
1. Monaco Editor with Ink theme
2. Pyodide Web Worker setup
3. Output panel with states
4. Split pane layout

**Week 4: Lesson System**
1. MDX configuration
2. Lesson page template
3. Exercise block with validation
4. Success animations

**Week 5: Polish**
1. All microinteractions refined
2. Subtle gradients implemented
3. Mobile responsive layout
4. Accessibility audit
5. Performance optimization

---

## 13. Quality Standards

### Component Checklist

Before any component is considered complete:

- [ ] **Functional**: Works as specified in all states
- [ ] **Responsive**: Tested at 320px, 768px, 1024px, 1440px
- [ ] **Accessible**: Keyboard navigation, screen reader tested
- [ ] **Themed**: Works in both Ivory and Velvet modes
- [ ] **Animated**: Microinteractions implemented
- [ ] **Performant**: No layout shifts, smooth 60fps animations
- [ ] **Consistent**: Uses design tokens exclusively
- [ ] **Typed**: Full TypeScript coverage, no `any`

### Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| JS Bundle (initial) | < 150KB gzipped |
| Pyodide (lazy) | ~5MB (expected) |

### Anti-Patterns to Avoid

**Design**
- ❌ Bright, saturated colors
- ❌ Visible/obvious gradients
- ❌ Jarring animations
- ❌ Gamification (streaks, badges)
- ❌ Generic illustrations
- ❌ Trendy design choices

**Code**
- ❌ Inline styles
- ❌ Magic numbers
- ❌ Hardcoded colors
- ❌ `any` types
- ❌ Unnecessary dependencies

**UX**
- ❌ Forced account creation
- ❌ Email capture before value
- ❌ Notification spam
- ❌ Social sharing prompts

---

## Appendix: Quick Reference

### Color Palette at a Glance

**Light "Ivory"**
```
Canvas:     #F9F8F6 (warm ivory)
Surface:    #FFFFFF
Text:       #2C2825 / #524B42 / #6B635A
Accent:     #1E3A5F (navy) + #B8A07E (gold glow)
```

**Dark "Velvet"**
```
Canvas:     #0C0A10 (plum-black)
Surface:    #110E16
Text:       #EDEBE6 / #D4D0DC / #A9A3B3
Accent:     #D4C5A9 (champagne)
```

**Editor "Ink"**
```
Background: #0A0910
Text:       #E0DDD6
Keywords:   #C9A0DC (lavender)
Strings:    #A8C4A0 (sage)
Numbers:    #D4B896 (gold)
Functions:  #93B5CF (dusty blue)
```

### Typography Quick Reference

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Display | Satoshi | 61px | Bold |
| H1 | Satoshi | 49px | Bold |
| H2 | Satoshi | 39px | Semibold |
| H3 | Satoshi | 31px | Semibold |
| Body | Inter | 16px | Normal |
| Small | Inter | 14px | Normal |
| Code | JetBrains Mono | 14px | Normal |

### Animation Quick Reference

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 150ms | ease-out |
| Button click | 75ms | ease-out |
| Card hover | 200ms | ease-out |
| Focus ring | 150ms | ease-out |
| Page transition | 200ms | ease-out |
| Success celebration | 400ms | spring |

---

*This document is the single source of truth for LearnPython's design system. The aesthetic is "quiet luxury" — regal, elegant, understated. When in doubt, choose restraint over flash, depth over brightness, and quality over quantity.*