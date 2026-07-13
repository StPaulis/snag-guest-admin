# snag-guest-admin

Co-branded host portal for snag's partner companies ("guests"). Each partner gets a subdomain
(`team-a.snagsublets.com`) where their team manages everything they host on snag: **listings**,
**agreements (bookings)**, and **chat with renters**.

Built from the Claude design handoff in `docs/design-handoff/` (open
`Guest Admin Portal (standalone).html` for the clickable prototype).

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · React Router 7 · TanStack Query 5 · Firebase Auth

## Getting started

```bash
npm install
cp .env.example .env.local   # defaults to mock mode
npm run dev                  # http://localhost:5180 — log in with any email/password
```

Mock mode (`VITE_USE_MOCKS=true`) runs fully offline with the prototype dataset.

### Against staging snag-api

Set in `.env.local`:

- `VITE_USE_MOCKS=false`
- `VITE_API_URL=https://api-staging.services.joinsnag.com`
- `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` — same Firebase project as snag-api
- `VITE_TENANT_HOST_USER_ID` — the host user whose posts this partner manages

The Firebase account must carry the `roles: ['admin']` custom claim (snag-api AdminGuard), and the
portal origin must be in snag-api's CORS allowlist. Endpoint mapping and known backend gaps (no
tenant scoping yet, accept/decline is a placeholder status write): see `docs/API_MAPPING.md`.

## Scripts

| Command | |
|---|---|
| `npm run dev` | dev server (port 5180) |
| `npm run build` | typecheck + production build |
| `npm run typecheck` | types only |
| `npm run preview` | serve the production build |

## Working with Claude

This repo is set up for agentic development:

- `CLAUDE.md` — architecture, hard rules, verification checklist
- `.claude/skills/snag-design-system` — design tokens & UI rules (auto-applies to UI work)
- `.claude/skills/mirror-design` — workflow for implementing future design handoffs
- `.claude/agents/` — `design-implementer`, `api-integrator`, `design-reviewer` subagents

To mirror a new design: drop the handoff bundle in `docs/design-handoff/<name>/` and ask Claude to
implement it — the mirror-design skill drives the workflow, the reviewer agent checks fidelity.
