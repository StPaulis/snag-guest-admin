# snag-api → guest-admin mapping

How the portal's data needs map onto the snag-api **`/admin-guest` module** (available on the
local backend, `http://localhost:3025/docs`). Staging docs: <https://api-staging.services.joinsnag.com/docs>.

## Auth

- Firebase ID token as `Authorization: Bearer <token>` (`@Auth()` from `@alpha018/nestjs-firebase-auth`).
- `/admin-guest/*` requires the **`guest-admin`** role custom claim, scoped to a company:
  grant with `POST /admin/auth/guest-admin/:userId` body `{ companyId }` (superadmin only),
  revoke with `DELETE /admin/auth/guest-admin/:userId`.
- Global superadmin claim (`roles: ['admin']`, via `POST /admin/auth/roles/:id`) is no longer
  needed by the portal.
- Firebase web key = server env `FIREBASE_CLIENT_API_KEY` → `VITE_FIREBASE_API_KEY`.
- CORS: local backend already allows `http://localhost:5180`; the portal origin must be in
  snag-api's allowed origins for staging/prod.

## Conventions

- Lists: query `page` (1-based) + `limit` (max 1000) → `{ data: T[], total: number }`.
- Strict ValidationPipe (`whitelist` + `forbidNonWhitelisted`): unknown params → 400.
- Money fields are integer **cents** (UI converts in `src/api/adapters.ts`).
- `AgreementStatus`: `requested | created | declined | signed | paid | cancelled`.
  UI mapping: paid,signed→`paid` · requested,created→`requested` · declined,cancelled→`cancelled`.
  Accept/decline only act on raw `requested` — `Booking.canRespond` carries that distinction to
  the UI so `created` drafts (also shown as `requested`) never offer accept/decline.
- Free-text `search` param (posts, agreements, chat-rooms): server-side, combined with paging.
- **Tenancy is server-side**: every `/admin-guest` endpoint is scoped to the caller's company
  (from the guest-admin claim). No client-side `userId` filtering.

## Screen → endpoint map (current wiring in `src/api/real.ts`)

| UI need | Endpoint | Notes |
| --- | --- | --- |
| Listings grid | `GET /admin-guest/posts?type=offering&search=` | Listing = offering `Post`. `search`: description, address, host name or price. Title derived from `extras.title` or first sentence of `description`. |
| Listing detail | `GET /admin-guest/posts/:id` | Read-only by product decision. |
| Agreements table | `GET /admin-guest/agreements?search=` | `search`: participant name, legal name, listing address or price. Status filter stays client-side by mapped status. |
| Agreement detail | `GET /admin-guest/agreements/:id` | Hydrated with post/forUser. Detail surfaces unit/apt, `additionalCosts`, refundable `securityDeposit` (agreement `refundableFee` → post fallback), `referralDiscount`, `cancellationPolicy` and `paymentPeriod` alongside the price breakdown. |
| Accept booking | `POST /admin-guest/agreements/:id/accept` | Only raw `requested` agreements; UI gates on `Booking.canRespond`. Runs the real accept flow server-side; returns the updated `Agreement`. |
| Decline booking | `POST /admin-guest/agreements/:id/decline` | Only raw `requested` agreements (`Booking.canRespond`). Shown as `cancelled` in UI. |
| Inbox / chat banner | `GET /admin-guest/chat-rooms?includeAgreements=true` | Uses `unreadMessagesCount`, `lastChatMessage`; `includeAgreements` embeds the room's agreements so the chat screen can accept/decline a pending request (adapter prefers a `requested` agreement). A room's `name` is often blank — the chat subtitle falls back (linked listing → room name → unit/apt → "direct message with {firstName}") in `adapters.ts`. |
| Chat messages | `GET /admin-guest/chat-messages?chatRoomId=&sort=createdAt&isSortAscending=false&page=&limit=30` | Paginated newest→oldest ("load older messages" in the thread); reversed client-side to chronological order. Each message hydrates its `media[]` relation — the chat renders attachments as image thumbnails, inline video, or document chips (kind inferred from mime hint → URL extension in `adapters.ts`). |
| Send message | `POST /admin-guest/chat-messages` `{chatRoomId, userId:<host>, text, type:'text'}` | `userId` (sender) is required by `AdminSaveChatMessageDto` and must be a company member → the UI sends the room's company-side participant (`ChatSummary.hostId`). |
| Dashboard stats | `GET /admin-guest/stats` | `AdminGuestStatsDto`: `activeListings`, `pendingRequests`, `monthRevenueCents`, `unread`. |
| Listing media (extra) | `GET /admin-guest/media?entityId=&entityType=post` | Not used yet — posts already embed `media`. |
| Mark chat read | `POST /admin-guest/chat-rooms/:id/read` | Advances the read marker for the company's members in the room. |

## Chat sender & perspective (resolved)

Rooms and messages embed hydrated users (`chatUsers[].user`, `message.user`) including
`companyId`. Since `/admin-guest` rooms only contain our company's members plus renters,
"company side" = participant/sender with a `companyId` (`adapters.ts`). Replies are sent as
the room's company-side participant (`ChatSummary.hostId`) — which may be a different admin
than the one logged in — and each message carries `senderName` so multi-admin threads stay
attributable. `VITE_TENANT_HOST_USER_ID` is only a legacy fallback.

## Remaining gaps → asks for the snag-api team

1. **Per-member read/unread counts** for host team members (multi-seat inboxes).

When these land: update `src/api/real.ts` only; view-models and pages stay untouched.
