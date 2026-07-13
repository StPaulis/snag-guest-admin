---
name: snag-design-system
description: snag Design System rules for building UI in snag-guest-admin. Use whenever creating or modifying any component, page, style, or visual element — colors, typography, spacing, radii, shadows, motion, status pills, avatars, buttons.
---

# snag Design System

Warm neutrals + one signature orange. Full spec: `docs/design-handoff/HANDOFF.md`.
Tokens are defined once in `src/styles.css` (`@theme`) — **never hardcode hex/rgb in components**.

## Color tokens (Tailwind classes)

| Token | Use |
|---|---|
| `brand-100` | app background, hover rows, active-nav bg |
| `brand-200/300/400` | tints, photo placeholder blocks |
| `brand-500` | gradient start, focus borders |
| `brand-600` | PRIMARY — buttons, links, unread pills, my chat bubbles |
| `brand-700` | hover; active-nav text |
| `brand-800` | press state; text on warn-200 |
| `neutral-200` | fills, borders, their-bubbles, tiles, amenity pills |
| `neutral-300` | captions, timestamps, placeholders |
| `neutral-400` | secondary text, inactive nav |
| `neutral-500` | body text |
| `ink-display` | headings, brand block, big stat values |
| `success-200/700` | paid/active pills, accept button (700 bg) |
| `warn-200` | requested pills + request banners (text = brand-800) |
| `danger-200/500` | cancelled pills, decline outline button |
| `info-200/500` | booked pills |

Status pills (bg/text): paid,active→success-200/success-700 · requested→warn-200/brand-800 ·
booked→info-200/info-500 · cancelled→danger-200/danger-500 · paused→neutral-200/neutral-400.
Use `<StatusPill>` from `components/ui.tsx` — do not re-implement.

## Typography

DM Sans only, weights **400 and 700 only**. Lowercase product voice ("welcome back", "listings",
"view all"). Sizes: 11–13 captions · 14–16 body · 17 panel titles · 19 login CTA · 24 price ·
26–32 headings. Generous line-height (body 16/24).

## Radii & shadows

8px fields/rows · 10px buttons/nav/tiles · 12–14px cards/banners · 20px login card ·
full pills/chips · 50% avatars. Shadows soft warm-gray: card hover `--shadow-card-hover`,
login `--shadow-login`, drawer `--shadow-lg`.

## Motion — restrained, always

150–220ms, `--ease-snag` (`cubic-bezier(.2,0,0,1)`). Press darkens (brand-600 → brand-800).
Listing-card hover: shadow + `translateY(-2px)` only. **No bounces, no scale, no springs.**

## Components (reuse, never fork)

`components/ui.tsx`: `StatusPill`, `Avatar` (initials fallback), `Button`
(primary/accept/declineOutline/ghost), `Card`, `PhotoBlock` (warm color blocks — the design system
ships no photography), `Spinner` (design-system svg). Icons: lucide-react, `size={16-22}`, `strokeWidth={2}`.

## Layout invariants

- Sidebar shell default (248px aside); `navStyle="topnav"` is the alternative.
- <860px: sidebar → off-canvas drawer (220ms slide, scrim `bg-black/40`), mobile top bar 58px.
- <720px: login promo panel hidden.
- Content centered with per-screen `max-width` (dashboard/listings/agreements 1080, listing 920,
  agreement 820, inbox 820, chat 760) and `margin: 0 auto`.
- Card grids: `repeat(auto-fit|auto-fill, minmax(280px,1fr))`; stat cards `minmax(180px,1fr)`.

## Product rules

- Listings are **read-only** — never add edit/create affordances for listings.
- Accept/decline exists ONLY for `requested` agreements, on both agreement detail and chat banner,
  and outcomes must reflect everywhere (dashboard, list, detail, chat) — invalidate via `hooks.ts`.
