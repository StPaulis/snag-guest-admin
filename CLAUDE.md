# snag-guest-admin

Co-branded web portal where snag's partner companies ("guests"/hosts, e.g. `team-a.snagsublets.com`)
manage their **listings**, **agreements (bookings)**, and **chat with renters**.
snag context: `docs/00_SNAG.md`. Design source of truth: `docs/design-handoff/HANDOFF.md`.

## Commands

- `npm run dev` — dev server (port 5180)
- `npm run build` — typecheck (`tsc -b`) + production build. Must pass before any task is done.
- `npm run typecheck` — types only

## Stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS v4 (CSS-first `@theme` in `src/styles.css`) ·
React Router 7 (`react-router` package) · TanStack Query 5 · Firebase Auth · lucide-react icons.

## Architecture — read this before adding features

```
src/
  api/
    models.ts    UI view-models + the GuestAdminApi interface — pages consume ONLY these
    types.ts     raw snag-api entities/enums (mirror of snag-api)
    adapters.ts  snag-api entity → view-model mapping (cents→dollars, status mapping, dates)
    real.ts      GuestAdminApi impl against snag-api /admin/* endpoints
    mock.ts      in-memory GuestAdminApi impl (prototype dataset)
    http.ts      fetch wrapper: Firebase bearer token, strict query building
    index.ts     picks real vs mock via VITE_USE_MOCKS
  hooks.ts       TanStack Query hooks — all data access from components goes through here
  auth/          Firebase auth + AuthContext (mock mode when VITE_USE_MOCKS)
  tenant.ts      partner/tenant config (env-driven until backend tenancy exists)
  layouts/Shell.tsx   sidebar (default) + topnav shells, <860px off-canvas drawer
  components/ui.tsx   StatusPill, Avatar, Button, Card, PhotoBlock, Spinner
  pages/         one file per screen; routes in App.tsx
```

**Hard rules**

1. Pages/components never import from `api/types.ts` or call `fetch` — only view-models via
   `hooks.ts`. New backend data = extend `GuestAdminApi` + implement in BOTH `real.ts` and `mock.ts`.
2. Everything must work with `VITE_USE_MOCKS=true` (no network, no Firebase).
3. Money: snag-api sends integer **cents**; view-models hold **dollars**. Convert in adapters only.
4. Status mapping lives in `adapters.ts` (`toBookingStatus`): snag-api has 6 agreement statuses,
   the UI shows 3 (`paid|requested|cancelled`).
5. Routes: `/`, `/listings`, `/listings/:id`, `/agreements`, `/agreements/:id`, `/inbox`, `/inbox/:chatId`.

## Design system — non-negotiable

Use the `snag-design-system` skill (.claude/skills/) when building any UI. Summary:

- Tokens ONLY from `src/styles.css` `@theme` (e.g. `bg-brand-600`, `text-ink-display`). Never
  hardcode hex/rgb values in components.
- DM Sans, weights 400/700 only. Lowercase headings/labels ("welcome back", "listings").
- Motion is restrained: 150–220ms, `--ease-snag`, press darkens (brand-600→800), no bounces/scale.
- Status pill colors, radii scale, and shadows: see the skill or `docs/design-handoff/HANDOFF.md`.
- Product decision: listings are **read-only** in this portal — never add edit affordances.

## Implementing a new design handoff

Use the `mirror-design` skill. Short version: drop the handoff bundle in
`docs/design-handoff/<name>/`, map its data entities to `GuestAdminApi` first, extend mocks, build
screens from existing components, verify against the spec (both shells, <860px drawer, <720px login).

## snag-api integration

Full mapping: `docs/API_MAPPING.md`. Essentials:

- Base URL `VITE_API_URL` (staging: `https://api-staging.services.joinsnag.com`), Swagger at `/docs`.
- Auth: `Authorization: Bearer <firebase idToken>` with `roles:['admin']` custom claim (AdminGuard).
- Lists: send `page` (1-based) + `limit`; responses are `{ data, total }`.
- snag-api ValidationPipe is strict (`forbidNonWhitelisted`) — never send params not in the DTO.
- No tenant scoping exists server-side yet; `real.ts` scopes by `VITE_TENANT_HOST_USER_ID`.
  When dedicated `/admin-guest/*` endpoints land, change ONLY `api/real.ts` (+ http auth if needed).

## Verification checklist (before declaring work done)

1. `npm run build` passes.
2. Screens match `docs/design-handoff/HANDOFF.md` (spot-check tokens, spacing, pills).
3. Mock mode works end-to-end (login → dashboard → accept a request → status reflects everywhere).
4. Responsive: drawer <860px, login promo hidden <720px.
