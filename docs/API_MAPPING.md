# snag-api → guest-admin mapping

How the portal's data needs map onto the EXISTING snag-api admin surface, and what a future
dedicated `/admin-guest` module should provide. Staging docs: <https://api-staging.services.joinsnag.com/docs>.

## Auth

- Firebase ID token as `Authorization: Bearer <token>` (`@Auth()` from `@alpha018/nestjs-firebase-auth`).
- `AdminGuard` requires the token's custom claims to include `roles: ['admin']`
  (managed via `POST /admin/auth/roles/:id`).
- Firebase web key = server env `FIREBASE_CLIENT_API_KEY` → `VITE_FIREBASE_API_KEY`.
- CORS: portal origin must be added to snag-api's allowed origins (`adminUrl` config) for staging/prod.

## Conventions

- Lists: query `page` (1-based) + `limit` (default 30, max 1000) → `{ data: T[], total: number }`.
- Strict ValidationPipe (`whitelist` + `forbidNonWhitelisted`): unknown params → 400.
- Money fields are integer **cents** (UI converts in `src/api/adapters.ts`).
- `AgreementStatus`: `requested | created | declined | signed | paid | cancelled`.
  UI mapping: paid,signed→`paid` · requested,created→`requested` · declined,cancelled→`cancelled`.

## Screen → endpoint map (current wiring in `src/api/real.ts`)

| UI need | Endpoint | Notes |
|---|---|---|
| Listings grid | `GET /admin/posts?type=offering&userId=<host>` | Listing = offering `Post`. Title derived from `extras.title` or first sentence of `description`. |
| Listing detail | `GET /admin/posts/:id` | Read-only by product decision. |
| Agreements table | `GET /admin/agreements?userId=<host>` | Filter client-side by mapped status. |
| Agreement detail | `GET /admin/agreements/:id` | Hydrated with post/forUser. |
| Accept booking | `PUT /admin/agreements/:id` body `{status:'paid'}` | ⚠ bypasses payment flow — placeholder until a real accept endpoint exists. |
| Decline booking | `PUT /admin/agreements/:id` body `{status:'declined'}` | Shown as `cancelled` in UI. |
| Inbox | `GET /admin/chat-rooms?memberId=<host>` | Uses `unreadMessagesCount`, `lastChatMessage`, `lastAgreement`. |
| Chat messages | `GET /admin/chat-messages?chatRoomId=&sort=createdAt&isSortAscending=true` | |
| Send message | `POST /admin/chat-messages` `{chatRoomId, userId:<host>, text, type:'text'}` | |
| Mark chat read | — none | No admin read-receipt endpoint; no-op. |

## Gaps → requirements for the future `/admin-guest` module

1. **Tenancy**: every endpoint scoped to the caller's `Company` (`User.companyId` exists; posts
   reachable via owning host users, or add `Post.companyId`). Client-side `userId` scoping is temporary.
2. **Roles**: a `guest-admin` (or `host-manager`) Firebase role scoped to a company — current
   `admin` claim grants global superadmin, which is unacceptable for partners.
3. **Accept/decline**: proper `POST /admin-guest/agreements/:id/accept|decline` that runs the real
   payment/notification flow instead of blind status writes.
4. **Read receipts + unread counts** per host team member.
5. **Dashboard stats**: `GET /admin-guest/stats` (active listings, pending requests, month revenue,
   unread) to replace client-side aggregation.

When these land: update `src/api/real.ts` only; view-models and pages stay untouched.
