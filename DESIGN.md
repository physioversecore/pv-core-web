# Design System — Brutalist Editorial

The public landing pages and marketing surfaces use a **brutalist editorial** design language: thick carbon borders, hard offset shadows, bold mono labels, high-contrast volt/moss accents, and newspaper-style display typography. Internal dashboard pages keep the softer shadcn/ui tokens (`--color-primary`, `--color-secondary`, etc.) for form-heavy workflows.

All tokens and utilities live in `src/app/globals.css` (Tailwind v4 `@theme inline` + `@utility`).

## Palette

| Token | Value | Usage |
|---|---|---|
| `--color-volt` | `#FFF100` | Primary accent — buttons, chips, highlights |
| `--color-volt-deep` | `#F4E700` | Volt hover/active |
| `--color-moss` | `#006D36` | Dark-green section backgrounds |
| `--color-mint` | `#6DFE9C` | Secondary chip/state color |
| `--color-carbon` | `#1B1B1B` | Text, borders, shadows ("ink") |
| `--color-paper` | `#F9F9F9` | Page background |
| `--color-paper-bright` | `#FFFFFF` | Card surfaces |
| `--color-surface` | `#E8E8E8` | Muted fills, skeletons |
| `--color-olive` | `#666000` | Button hover / dark accents |
| `--color-sand` | `#CCC7AA` | Dividers |
| `--color-cyan` | `#8AFFFF` | Rare highlight |

Text shades: `--color-text` `#1B1B1B`, `--color-text-light` `#4A4731`, `--color-text-muted` `#6B6754`.

## Typography

Fonts are **self-hosted via `next/font/google`** in `src/app/layout.tsx` (no external `<link>`, no FOUT). Variable weights, applied as CSS vars on `<body>`.

| Role | Font | CSS var | Tailwind class |
|---|---|---|---|
| Display / headings | **Anybody** | `--font-display-loaded` | `font-display` |
| Sans / body | **Archivo Narrow** | `--font-sans-loaded` | `font-sans` |
| Mono / labels | **Space Grotesk** | `--font-mono-loaded` | `font-mono` |

`@theme inline` wires them into Tailwind:

```css
--font-display: var(--font-display-loaded), "Anybody", ui-sans-serif, system-ui, sans-serif;
--font-sans: var(--font-sans-loaded), "Archivo Narrow", ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-mono-loaded), "Space Grotesk", ui-monospace, monospace;
```

The `DEFAULT_TOKENS.typography` in `src/types/design-tokens.ts` references the same font vars so dynamic theming never overrides them with the old unloaded fonts.

Conventions:
- Headings: `font-display font-extrabold uppercase tracking-tighter`, tight `leading-[0.95]`–`leading-none`.
- Labels/eyebrows: `label-ink` utility (mono, uppercase, `.14em` tracking).
- Display sizes use `clamp()` where they must stay safe on small screens, e.g. `text-[clamp(1.75rem,6vw,3.75rem)]`.

## Core Utilities (`@utility`)

| Utility | Description |
|---|---|
| `card-neo` | White card, `2px` carbon border, `5px 5px 0` hard shadow, `1.25rem` radius |
| `card-neo-hover` | Lift on hover — `translate(-3px,-3px)`, shadow to `8px 8px 0` |
| `btn-volt` | Volt bg, mono uppercase label, carbon border + hard shadow; lift on hover, press on active |
| `btn-carbon` | Carbon bg, white text, volt-ish lift; hover shifts to olive |
| `btn-outline-ink` | Transparent bg, carbon border, volt fill on hover |
| `chip-volt` / `chip-mint` / `chip-sand` | Small mono uppercase badges with carbon border + `2px` shadow |
| `input-neo` | White input, `2px` carbon border, hard shadow, focus lift |
| `label-ink` | Mono uppercase eyebrow label |
| `grid-bg` | Subtle 24px carbon grid lines (light sections) |

`shadow-[4px_4px_0_var(--color-carbon)]`-style hard shadows are also applied inline where a one-off is needed.

## Skeleton / Loading

Skeletons mirror the rendered layout so there is no layout shift:

- `HeroLiveSkeleton` (`src/components/SuspenseFallback.tsx`) — light therapist-row placeholders: `border-2 border-carbon` rows, 42px avatar block, name/specialty lines, volt star + rating block, price + button block.
- `TherapistCardSkeleton` — paper-bright `card-neo` card, 128px avatar (`lg:w-32 lg:h-32`), dark `rounded-full` button block.
- `CardSkeleton` (services page) — `card-neo p-6 animate-pulse` blocks.
- Skeleton fills use `bg-surface border border-carbon`.

Dashboards use `DashboardPageSkeleton` for full-page loading states.

## Error States

`SectionError` (`src/components/SectionError.tsx`) renders in the same brutalist style — `card-neo` panel, `chip-volt` "retrying" badge with a `dot-pulse` indicator while auto-retrying, then a failed state with a volt "Try again" button. See ARCHITECTURE.md → Error Handling for the retry budget mechanics.
