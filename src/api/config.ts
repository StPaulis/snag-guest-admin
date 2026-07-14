/**
 * Single source of truth for mock mode, shared by the data layer (api/index.ts)
 * and the auth layer (auth/firebase.ts) so they can NEVER disagree.
 *
 * Previously each layer decided independently — the data layer keyed off
 * VITE_API_URL, auth off VITE_FIREBASE_API_KEY. With one configured and the other
 * empty that produced a silent split-brain: real API calls sent WITHOUT an auth
 * token (getIdToken() returns null in mock auth) → 401 → auto-logout → the user
 * appears to "log in then bounce back to /login".
 *
 * Rule: run real only when VITE_USE_MOCKS !== 'true' AND both the backend and
 * Firebase are configured. Any missing piece → full mock everywhere, consistently.
 */
export const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' ||
  !import.meta.env.VITE_API_URL ||
  !import.meta.env.VITE_FIREBASE_API_KEY;
