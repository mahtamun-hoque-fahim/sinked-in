# Sinked In — Design Guide

Implementation spec for the design system. No rationale. No marketing copy. Just tokens, patterns, and constraints.

## Color tokens

CSS variables in `app/globals.css` (Tailwind v4 — tokens auto-promote to utilities):

```css
@import "tailwindcss";

@theme {
  /* Surfaces — from BRAIN.md § Visual Identity, palette "Storm Ledger" */
  --color-bg: #0c0f0e;
  --color-surface: #141917;
  --color-surface-elevated: #1c231f;
  --color-border: #212824;

  /* Text */
  --color-text: #eef3f1;
  --color-text-muted: #a9b3ae;
  --color-text-faint: #6d7773;

  /* Brand */
  --color-accent: #3dd6c4;
  --color-accent-hover: #33bfae;
  --color-accent-faint: #3dd6c41a;

  /* Map status colors — SEPARATE semantic set, never reuse brand accent.
     BRAIN.md is explicit: teal is brand-only. These are locked here. */
  --color-status-flooded: #ef4444;    /* red — flooded */
  --color-status-safe: #22c55e;       /* green — safe */
  --color-status-not-in-danger: #eab308; /* amber — flooded but not in danger */

  /* Aid-matching status colors — a second, distinct semantic set from flood status */
  --color-aid-needed: #f97316;        /* orange — needs aid */
  --color-aid-in-progress: #3b82f6;   /* blue — in progress */
  --color-aid-complete: #3dd6c4;      /* accent teal reused ONLY here — aid completion is a brand-adjacent "resolved" state, not a flood-status pin */
}
```

Referenced in Tailwind config:
```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      accent: 'var(--color-accent)',
      'status-flooded': 'var(--color-status-flooded)',
      'status-safe': 'var(--color-status-safe)',
      'status-not-in-danger': 'var(--color-status-not-in-danger)',
      'aid-needed': 'var(--color-aid-needed)',
      'aid-in-progress': 'var(--color-aid-in-progress)',
      'aid-complete': 'var(--color-aid-complete)',
    }
  }
}
```

## Typography

**Families** (loaded via `@fontsource`, not `next/font/google` — matches Fahim's house convention for offline-reliable fonts):
- Display + body: IBM Plex Sans (`--font-plex-sans`) — headings and body copy both, per BRAIN.md
- Mono: JetBrains Mono (`--font-jetbrains-mono`) — numbers, coordinates, status codes, OTP input

**Weights used:**
- Body: 400 (regular), 500 (medium for emphasis)
- Display: 600 (semibold), 700 (bold for hero/report-status headlines)
- Mono: 400, 500

**Size scale** (rem):
| Token | Size | Use |
|---|---|---|
| `text-xs` | 0.75rem | Captions, pin labels, timestamps |
| `text-sm` | 0.875rem | Secondary text, form labels |
| `text-base` | 1rem | Body |
| `text-lg` | 1.125rem | Lead paragraphs, confirmation screen |
| `text-xl` | 1.25rem | h4 |
| `text-2xl` | 1.5rem | h3 |
| `text-3xl` | 1.875rem | h2 |
| `text-4xl` | 2.25rem | h1 |

**Line height:** 1.6 for body, 1.2 for display.

## Spacing scale

Tailwind defaults. Common values: 2 (8px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px).

## Border radius

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | Inputs, badges, OTP digit boxes |
| `rounded-md` | 6px | Buttons (default) |
| `rounded-lg` | 8px | Cards, report panels |
| `rounded-xl` | 12px | Modals, map popup panels |
| `rounded-full` | 9999px | Status pins, avatars |

## Shadows

```css
--shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
--shadow-md: 0 4px 12px rgb(0 0 0 / 0.5);
--shadow-lg: 0 12px 32px rgb(0 0 0 / 0.6);
--shadow-glow: 0 0 24px var(--color-accent-faint);
```

Use sparingly on dark theme — depth comes from surface lightness, not shadow.

## Components

### Button — primary
```tsx
<button className="bg-accent text-bg px-4 py-2 rounded-md font-semibold hover:bg-accent-hover transition-colors">
  Submit report
</button>
```

### Button — secondary
```tsx
<button className="bg-surface text-text px-4 py-2 rounded-md border border-border hover:bg-surface-elevated transition-colors">
  Cancel
</button>
```

### Button — emergency (used only for flooded/needs-aid actions — larger tap target per one-handed constraint)
```tsx
<button className="bg-status-flooded text-white px-6 py-4 rounded-md font-bold text-lg hover:opacity-90 transition-opacity min-h-[56px]">
  I'm flooded — report now
</button>
```

### Input
```tsx
<input className="bg-surface border border-border rounded-md px-3 py-2 text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors min-h-[48px]" />
```

### OTP digit input
```tsx
<input inputMode="numeric" maxLength={1} className="font-mono text-2xl text-center w-12 h-14 bg-surface border border-border rounded-sm text-text focus:border-accent focus:outline-none" />
```

### Card
```tsx
<div className="bg-surface border border-border rounded-lg p-6">
  ...
</div>
```

### Status badge (flood status — uses status-* tokens, never accent)
```tsx
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium bg-status-flooded/15 text-status-flooded">
  FLOODED
</span>
```

### Aid badge (aid-matching status — uses aid-* tokens, a separate set from flood status)
```tsx
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium bg-aid-needed/15 text-aid-needed">
  NEEDS AID
</span>
```

## Animation defaults

- Hover transitions: `transition-colors duration-150 ease-out`
- Modal/drawer enter: `transition-all duration-200 ease-out`
- Map pin drop-in: `transition-all duration-300 ease-out`
- Maximum UI animation: 300ms. Longer feels sluggish, and this app is used under time pressure.

Always wrap motion in `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark mode notes

Dark-first, no light mode (BRAIN.md hard constraint — no exceptions).

- Never use pure black — use `--color-bg` (`#0c0f0e`), avoids halation next to light text
- Never use pure white for text — use `--color-text` (`#eef3f1`)
- Shadows are less effective on dark surfaces; use border + `--color-surface-elevated` for lift

## One-handed / crisis-use constraints (project-specific, not a generic default)

- Minimum tap target: 48px height on all interactive elements, 56px on the primary "report" CTA
- Report submission flow must be completable in under 60 seconds (BRAIN.md hard constraint) — no more than 3 form steps before OTP
- No emojis anywhere — lucide-react icons only, per house rule (Waterborne-enforced)
- Status pin colors must remain distinguishable under direct sunlight/glare — avoid low-contrast pairs; status-flooded (#ef4444) vs status-not-in-danger (#eab308) both need to read clearly against `--color-bg` at small pin size

## Focus indicators

Always visible. Never `outline: none` without a replacement.

```css
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```
