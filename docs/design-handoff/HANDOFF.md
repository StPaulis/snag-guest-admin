# Handoff: snag Guest Admin Portal

## Overview
A co-branded web admin portal for snag's partner companies ("guests" / hosts). Each partner
gets their own subdomain (e.g. `team-a.snagsublets.com`) where their team logs in and manages
everything they host on snag: **listings**, **agreements (bookings)**, and **chat with renters**.

The reference partner in the mock is "Loft Collective" — a placeholder. In production the
company name, logo/initials, and subdomain are per-tenant.

## About the Design Files
The file in this bundle (`Guest Admin Portal (standalone).html`) is a **design reference created in
HTML** — a working, clickable prototype showing the intended look, layout, and behavior, bundled as a
single self-contained file you can open by double-clicking (no server or dependencies). **It is not
production code to copy directly.** Its internal runtime is specific to the design tool and should
NOT be carried into your codebase.

Your task is to **recreate these designs in a real codebase** using its established patterns and
libraries. If you're starting fresh, a **React + TypeScript SPA** (Vite or Next.js) with a
component library of your choice is a natural fit; the prototype's structure maps cleanly to it.
The **backend integration** ("integrate with an existing one") means replacing the in-memory mock
data (see *State Management* / *Data & API*) with real API calls to your existing snag services.

To view the prototype: **double-click `Guest Admin Portal (standalone).html`** — it opens in any
browser, offline, with no setup. Resize the window to see responsive behavior. There is a layout
tweak (`navStyle`: `sidebar` | `topnav`) — **sidebar is the intended default**.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interactions are all specified
below and should be matched closely. Styling follows the **snag Design System** (warm neutrals +
a single signature orange, DM Sans). If your codebase already implements the snag design system,
use those tokens/components rather than re-deriving from the hex values here.

---

## Global Layout & Chrome

Two authenticated shells, selectable via the `navStyle` prop. **Default: `sidebar`.**

### Sidebar shell (default)
- Fixed left **`aside`, 248px wide**, white (`--white`), 1px right border (`--neutral-200`),
  `padding: 20px 14px`, `display:flex; column`.
- Top: **brand block** — 34×34 rounded-9px square with partner initials ("LC") on `--ink-display`
  bg + white bold 13px text; beside it partner name (bold 15px, `--neutral-500`) and
  "on **snag**" caption (11px `--neutral-300`, "snag" in bold `--brand-600`).
- **Nav** (`gap:4px`): items *home, listings, agreements, inbox*. Each: `padding:10px 12px`,
  `radius:10px`, `gap:11px`, bold 15px, 20px Lucide-style stroke icon (stroke-width 2).
  - Inactive: transparent bg, `--neutral-400` text.
  - Active: `--brand-100` bg, `--brand-700` text.
  - Hover: `--neutral-200` bg.
  - **inbox** shows a right-aligned unread pill (bg `--brand-600`, white, min 18px, radius 9px) when unread > 0.
- Bottom (`margin-top:auto`, 1px top border): current user — 36px round avatar, name (bold 14px
  `--neutral-500`) + role ("host manager", 12px `--neutral-300`), and a **logout** icon button.

### Top-nav shell (`navStyle: 'topnav'`, alternative)
- Full-width white header, 60px tall, 1px bottom border. Left: brand block (30px square).
  Center-left: horizontal nav (same 4 items; active = `--brand-100` bg / `--brand-700`).
  Right: 34px avatar + logout icon.

### Responsive behavior (important — recently added)
- **Login (`max-width:720px`)**: the orange promo panel is **hidden**; only the form shows, centered.
- **Sidebar shell (`max-width:860px`)**: the sidebar becomes an **off-canvas drawer**:
  - It's `position:fixed; inset top/left/bottom; z-index:60; transform:translateX(-100%)`,
    sliding in with `transform .22s cubic-bezier(.2,0,0,1)` and `--shadow-lg`.
  - A **mobile top bar** (58px, white, 1px bottom border) appears with a hamburger button, the
    brand block, and the unread pill.
  - Tapping the hamburger opens the drawer over a **scrim** (`rgba(0,0,0,.4)`, z-index 55).
  - Tapping the scrim OR selecting any nav item closes the drawer.
  - Main content padding tightens to `20px 16px`.
- **Dashboard cards** use `grid-template-columns: repeat(auto-fit, minmax(280px,1fr))` so the two
  panels stack on narrow screens. Stat cards use `minmax(180px,1fr)`.
- Main content is centered with per-screen `max-width` (see each screen) and `margin:0 auto`.

---

## Screens / Views

### 1. Login
- **Purpose**: Partner team member logs into their tenant portal.
- **Layout**: Centered card, `max-width:920px`, radius 20px, `box-shadow:0 24px 60px rgba(36,36,36,.12)`,
  two equal flex halves.
  - **Left (form)**: `padding:56px 48px`, vertically centered. Co-brand lockup ("LC" square × "snag"),
    H1 "welcome back" (32/40, `--ink-display`), subtitle "log in to the Loft Collective host portal".
    Email + password fields (see field spec), right-aligned "forgot password?" link, full-width
    primary "log in" button (19px), footer "team-a.snagsublets.com · secured by snag" (12px `--neutral-300`).
  - **Right (promo)**: full-height panel, `linear-gradient(150deg, --brand-500, --brand-700)`, radial
    highlight overlay, bottom-aligned white headline "your listings, agreements & messages — all in
    one place." + supporting line. **Hidden below 720px.**
- **Behavior**: "log in" sets `loggedIn=true` → dashboard. (No real auth in mock — wire to your auth.)

### 2. Dashboard / Home
- **Purpose**: At-a-glance overview.
- **Layout**: `max-width:1080px`. Greeting H1 "welcome back, Loft Collective" (28/34) + date subtitle.
- **Stat cards** (auto-fit, min 180px): *active listings* (6), *pending requests* (3, value in
  `--brand-600`), *this month* ($18,240), *unread messages* (live count). White cards, radius 12px,
  `padding:20px`; label bold 13px `--neutral-400`; value bold 32px, line-height 1.
- **Two panels** (auto-fit, min 280px), white radius-14 cards:
  - *recent bookings* — first 4 agreements as rows (avatar, renter, "listing · dates", status pill).
    Row click → agreement detail. "view all" → agreements.
  - *recent messages* — first 4 chats as rows (avatar, name, last message, unread dot). Row click →
    chat. "view all" → inbox.

### 3. Listings (overview)
- **Purpose**: Browse all properties this partner has on snag.
- **Layout**: `max-width:1080px`. Header row: title "listings" + "6 properties on snag"; right a
  **search box** (white, radius 8, search icon + input) that filters by title/area live.
- **Grid**: `repeat(auto-fill, minmax(280px,1fr))`, `gap:22px`. Cards are buttons (white, radius 14):
  - Photo area `aspect-ratio:4/3`, solid warm color block (placeholder — see *Assets*), centered
    image-glyph, top-left **status pill**.
  - Body: title (bold 16), area (13px `--neutral-400`), price bold 16 **`$X / month`**.
  - Hover: `box-shadow:0 8px 24px rgba(36,36,36,.12); translateY(-2px)`.
  - Click → listing detail.

### 4. Listing detail
- **Purpose**: View one property. **No editing from the admin** (explicit product decision — do NOT
  add an edit affordance).
- **Layout**: `max-width:920px`. Back button → listings.
  - **Gallery**: grid `1.6fr 1fr`; large image left (`aspect-ratio:16/10`, radius 14, color block),
    two stacked color blocks right.
  - **Body** grid `1fr 300px`:
    - Left: title (26, `--ink-display`) + status pill; area; a stats strip (top+bottom 1px borders)
      with *bedrooms*, *bathrooms*, *available* window; "about this place" paragraph; **amenities** as
      pills (`--neutral-200` bg, radius full, bold 13px).
    - Right (sticky): price card — **`$X / month`** (24px), "N bookings this year", primary **"view
      bookings"** button (→ agreements). **No "edit listing" button.**

### 5. Agreements (list)
- **Purpose**: All bookings across listings.
- **Layout**: `max-width:1080px`. Title "agreements" + "bookings across your listings".
  - **Filter chips**: *all / paid / requested / cancelled*. Active chip = `--brand-600` bg + white;
    inactive = white bg + `--neutral-500`. Radius full. Filters the table.
  - **Table** (white, radius 14): header row + data rows, grid columns
    `1.4fr 1.2fr 1.2fr .8fr .8fr` = *renter / listing / dates / total / status*.
    - Renter cell: 34px avatar + name; **"id verified"** badge (green `--success-700`, check icon)
      when verified.
    - total is `$X` (booking total). status = pill. Row click → agreement detail. Hover `--brand-100`.

### 6. Agreement detail
- **Purpose**: One booking, renter info, and **accept/decline for requested bookings**.
- **Layout**: `max-width:820px`. Back → agreements. Header: "booking #SN-XXXX" + status pill; listing subtitle.
  - **Requested banner** (only when `status==='requested'`): `--warn-200` bg, radius 12, text
    "booking request pending / {firstName} is waiting for your response", plus two buttons:
    **decline** (outline `--danger-500`, hover `--danger-200` fill) and **accept booking**
    (`--success-700` bg, white). Accept → status `paid`; decline → status `cancelled`; banner then hides.
  - Body grid `1fr 300px`:
    - Left **stay details** card: move-in / move-out tiles (`--neutral-200`), then line items
      "**N months × $monthly**", "snag service fee", and **total** (bold 16).
    - Right **renter** card: 52px avatar, name, id-verified badge, **instagram** + **linkedin** links
      (with brand-tinted icons), and a primary **"message {firstName}"** button → opens that renter's chat.

### 7. Inbox
- **Purpose**: All conversations with renters.
- **Layout**: `max-width:820px`. Title "inbox" + "conversations with your renters".
  - White radius-14 list; each row (`padding:16px 20px`, 1px bottom border): 46px avatar; name (bold 15) +
    "· listing" caption; last-message preview (truncated, `--neutral-400`); right column time (12px
    `--neutral-300`) + unread count pill (`--brand-600`) when unread. Row click → chat (marks read).

### 8. Chat (conversation)
- **Purpose**: Read + send messages with one renter.
- **Layout**: `max-width:760px`, full-height flex column.
  - **Header**: back button (→ inbox), 42px avatar, name + listing, right "view booking" button (→ that
    agreement detail).
  - **Requested banner** (when the linked agreement is `requested`): compact `--warn-200` bar with
    "{firstName} sent a booking request" + **decline** / **accept** buttons (same effect as detail page).
  - **Messages**: scrollable column, `gap:10px`. Bubbles max-width 75%:
    - mine: `--brand-600` bg, white, radius `16 16 4 16`, right-aligned.
    - theirs: `--neutral-200` bg, `--neutral-500`, radius `16 16 16 4`, left-aligned.
    - time caption 11px `--neutral-300` under each, aligned to the bubble side.
  - **Composer**: input (`--neutral-200`, radius 10) + 48px square send button (`--brand-600`, white,
    send icon). Enter or button appends a message from "me" (time "now"). New messages must persist to backend.

---

## Interactions & Behavior
- **Navigation**: SPA-style screen switching (no full reloads). Section highlighting: *home*=dashboard;
  *listings*=listings+listing-detail; *agreements*=agreements+agreement-detail; *inbox*=inbox+chat.
  On every navigation, scroll the content area to top and close the mobile drawer.
- **Cross-links**: agreement detail "message {name}" → that renter's chat; chat "view booking" →
  that agreement detail; dashboard rows deep-link into detail/chat.
- **Accept / decline** (requested agreements only): available on BOTH agreement detail and chat.
  accept → `paid`, decline → `cancelled`. Reflected everywhere (list, detail, dashboard, chat banner).
- **Search** (listings): live filter on title + area, case-insensitive.
- **Filter** (agreements): all / paid / requested / cancelled.
- **Chat send**: Enter key or send button; empty/whitespace ignored. Opening a chat zeroes its unread count.
- **Motion**: restrained per design system — drawer slide 220ms `cubic-bezier(.2,0,0,1)`; no bounces.
  Button press darkens (primary → `--brand-800`), no lift/scale.

## State Management
Mock keeps everything in component state; map these to real data + API:
- `loggedIn` — auth session.
- `screen` — current route. Recommend real routes: `/`, `/listings`, `/listings/:id`, `/agreements`,
  `/agreements/:id`, `/inbox`, `/inbox/:chatId`.
- `menuOpen` — mobile drawer open/closed (UI only).
- `listingId`, `agId`, `chatId` — current selection (→ route params).
- `agFilter`, `listingQuery`, `draft` — UI filter/search/compose state.
- `listings`, `agreements`, `chats`, `threads` — **replace with server data**.

## Data & API (integration guide)
Entities in the mock (fields to map to your existing backend):
- **Listing**: `id, title, area, price (monthly, USD), status (active|booked|paused), beds, baths,
  window (availability), bookingCount, desc, amenities[], photos`. (Mock uses color blocks for photos.)
- **Agreement/Booking**: `id, ref (#SN-####), listingId, renter, status (paid|requested|cancelled),
  moveIn, moveOut, months, monthly, subtotal, fee (snag service fee), total, renter profile
  (idVerified, instagram, linkedin)`.
- **Chat**: `id, agId (links to booking), participant (name/avatar), listing, unreadCount`,
  and **messages** `{ from: 'me'|'them', text, time }`.

Suggested endpoints (adapt to existing API): `GET /listings`, `GET /listings/:id`,
`GET /agreements?status=`, `GET /agreements/:id`, `POST /agreements/:id/accept`,
`POST /agreements/:id/decline`, `GET /chats`, `GET /chats/:id/messages`, `POST /chats/:id/messages`.
All scoped to the authenticated **tenant** (partner company) — enforce tenant isolation server-side.

## Design Tokens
Use the snag Design System tokens. Key values used here:
- **Brand**: `--brand-100 rgb(255,249,247)`, `--brand-200 rgb(252,242,234)`, `--brand-500 rgb(252,145,71)`,
  `--brand-600 rgb(252,105,2)` (primary), `--brand-700 rgb(194,81,2)` (hover), `--brand-800 rgb(153,64,1)` (press).
- **Neutrals**: `--neutral-200 rgb(247,241,239)` (fills), `--neutral-300 rgb(168,164,162)`,
  `--neutral-400 rgb(102,100,98)`, `--neutral-500 rgb(38,38,37)` (body), `--white #fff`.
- **Display heading**: `--ink-display rgb(27,18,48)`.
- **Status**: success `--success-200 rgb(208,254,163)` / `--success-700 rgb(56,108,3)`;
  warn `--warn-200 rgb(255,222,185)`; danger `--danger-200 rgb(255,181,181)` / `--danger-500 rgb(198,8,8)`;
  info `--info-200 rgb(190,221,255)` / `--info-500 rgb(11,102,199)`.
- **Type**: **DM Sans** (400 / 700) only. Sizes used: 11–13 captions, 14–16 body, 17 panel titles,
  19 login CTA, 24 price, 26–32 headings. Line-height generous (body 16/24).
- **Radii**: 8 (fields/rows/cards), 10 (buttons/nav/tiles), 12–14 (large cards/banners), 20 (login card),
  9999 (pills/chips), 50% (avatars).
- **Shadows**: soft warm-gray. Card hover `0 8px 24px rgba(36,36,36,.12)`; login `0 24px 60px rgba(36,36,36,.12)`.
- **Status-pill colors** (bg / text): paid & active → success-200 / success-700; requested → warn-200 /
  brand-800; booked → info-200 / info-500; cancelled → danger-200 / danger-500; paused → neutral-200 / neutral-400.

## Assets
- `assets/avatar-sample.jpg` — the one sample portrait from the snag design system; used for all
  avatars in the mock. Replace with real user photos.
- `assets/spinner.svg` — iOS-style loading spinner from the design system (for loading states).
- **Icons**: Lucide-style outline icons (stroke ~2px) stand in for snag's SF-Symbols. Use your icon set.
- **Listing photos**: intentionally **warm color blocks** as placeholders — the design system ships no
  photography. Wire real listing images in production.
- **Logo**: mock uses a text lockup ("LC" initials × "snag" wordmark). Use the real partner logo + the
  real snag mark from your brand system.

## Files
- `Guest Admin Portal (standalone).html` — the full clickable prototype (all 8 screens + login +
  responsive shells), bundled into a **single self-contained file**. Just double-click to open in any
  browser — no server, no assets folder, works offline. **Reference only — do not ship this file's
  internal runtime; recreate the UI in your codebase.**
- `assets/` — sample avatar + spinner (design-system source assets, for your build).
