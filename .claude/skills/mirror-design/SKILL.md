---
name: mirror-design
description: Workflow for implementing a new Claude-design handoff bundle (standalone HTML prototype + HANDOFF/README spec) as real screens in snag-guest-admin. Use when the user shares a design handoff, prototype HTML, new screens, or asks to "mirror" a design.
---

# Mirror a design handoff into snag-guest-admin

Design handoffs arrive as a bundle: a self-contained clickable `*.html` prototype + a `README`/
`HANDOFF.md` spec (tokens, per-screen layout, behavior, data entities). The prototype's internal
runtime is reference-only — NEVER copy its code. Recreate in this codebase's patterns.

## Workflow

1. **Archive the bundle**: copy it to `docs/design-handoff/<feature-name>/` so the spec is
   versioned with the code. Read the spec fully before writing any code.

2. **Diff the tokens**: compare the spec's design tokens against `src/styles.css` `@theme`.
   New tokens → add to `@theme` (keep the naming scheme: `--color-<family>-<step>`). Changed
   tokens → flag to the user before overwriting; other screens depend on them.

3. **Map data first, UI second**: list the entities/fields the design needs. For each:
   - Already in a view-model (`src/api/models.ts`)? Reuse.
   - Missing? Extend the view-model + `GuestAdminApi` interface, then implement in BOTH
     `src/api/real.ts` (existing snag-api admin endpoints — check `docs/API_MAPPING.md` and the
     staging Swagger at /docs) and `src/api/mock.ts` (realistic prototype-matching data).
   - No backend support at all? Implement mock-only, add the gap to `docs/API_MAPPING.md` §Gaps.

4. **Build screens** following the snag-design-system skill:
   - Reuse `components/ui.tsx` primitives; add new primitives there only if ≥2 screens need them.
   - One file per screen in `src/pages/`, route added to `App.tsx`, nav (if any) to `layouts/Shell.tsx`.
   - Data via new hooks in `src/hooks.ts` (TanStack Query, invalidation on mutations).
   - Match the spec's exact px values (max-widths, paddings, radii, font sizes) — it is high-fidelity.

5. **Behavior parity**: implement every item in the spec's "Interactions & Behavior" section —
   cross-links, filters, optimistic-feeling updates, scroll-to-top on navigation, drawer close.

6. **Verify** (definition of done):
   - `npm run build` passes.
   - Mock mode (`VITE_USE_MOCKS=true`) walks the full flow with realistic data.
   - Responsive: check the spec's breakpoints (portal defaults: 860px drawer, 720px login promo).
   - Side-by-side spot-check vs the prototype HTML (open it in a browser).
   - Both shells still render (`navStyle` sidebar AND topnav) if the shell was touched.

## Anti-patterns

- Copying prototype runtime/markup wholesale.
- Hardcoded colors/fonts instead of tokens.
- Fetching in components instead of hooks + GuestAdminApi.
- Editing only `mock.ts` or only `real.ts` — they must stay in lockstep with the interface.
- Adding listing-edit affordances (explicit product decision: read-only).
