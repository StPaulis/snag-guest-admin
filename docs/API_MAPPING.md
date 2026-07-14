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
- **Tenancy is server-side**: every `/admin-guest` endpoint is scoped to the caller's company
  (from the guest-admin claim). No client-side `userId` filtering.

## Screen → endpoint map (current wiring in `src/api/real.ts`)

| UI need | Endpoint | Notes |
| --- | --- | --- |
| Listings grid | `GET /admin-guest/posts?type=offering` | Listing = offering `Post`. Title derived from `extras.title` or first sentence of `description`. |
| Listing detail | `GET /admin-guest/posts/:id` | Read-only by product decision. |
| Agreements table | `GET /admin-guest/agreements` | Filter client-side by mapped status. |
| Agreement detail | `GET /admin-guest/agreements/:id` | Hydrated with post/forUser. |
| Accept booking | `POST /admin-guest/agreements/:id/accept` | Runs the real accept flow server-side; returns the updated `Agreement`. |
| Decline booking | `POST /admin-guest/agreements/:id/decline` | Shown as `cancelled` in UI. |
| Inbox | `GET /admin-guest/chat-rooms` | Uses `unreadMessagesCount`, `lastChatMessage`, `lastAgreement`. |
| Chat messages | `GET /admin-guest/chat-messages?chatRoomId=&sort=createdAt&isSortAscending=true` | |
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
