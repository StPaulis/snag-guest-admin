/**
 * Firebase Auth — same project as snag-api (FIREBASE_CLIENT_API_KEY server-side).
 * The signed-in user's ID token must carry the company-scoped `guest-admin` custom
 * claim to pass snag-api's /admin-guest guard (granted via
 * POST /admin/auth/guest-admin/:userId body { companyId }).
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onIdTokenChanged,
  type Auth,
  type User,
} from 'firebase/auth';

const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_FIREBASE_API_KEY;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function getFbAuth(): Auth {
  if (!auth) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    });
    auth = getAuth(app);
  }
  return auth;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

let mockUser: SessionUser | null = null;
const mockListeners = new Set<(u: SessionUser | null) => void>();

export async function signIn(email: string, password: string): Promise<void> {
  if (USE_MOCKS) {
    mockUser = { id: 'host-1', name: 'Ana Torres', email };
    mockListeners.forEach((l) => l(mockUser));
    return;
  }
  await signInWithEmailAndPassword(getFbAuth(), email, password);
}

export async function signOut(): Promise<void> {
  if (USE_MOCKS) {
    mockUser = null;
    mockListeners.forEach((l) => l(null));
    return;
  }
  await fbSignOut(getFbAuth());
}

/**
 * Enrich the Firebase auth record with the snag user profile (GET /api/users/me)
 * so we always show the real name/photo instead of a bare email. Best-effort:
 * on any failure we keep the Firebase-derived values. Uses a direct fetch (not the
 * shared api() wrapper) so a profile miss never triggers the 401/403 auto-logout.
 */
async function withSnagProfile(u: User, base: SessionUser): Promise<SessionUser> {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return base;
  try {
    const token = await u.getIdToken();
    const res = await fetch(`${apiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return base;
    const me = (await res.json()) as {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      email?: string;
      profileImageUrl?: string;
    };
    const name =
      [me.firstName, me.lastName].filter(Boolean).join(' ') || me.displayName || base.name;
    return { ...base, name, email: me.email ?? base.email, avatar: me.profileImageUrl ?? base.avatar };
  } catch {
    return base;
  }
}

export function onSession(cb: (user: SessionUser | null) => void): () => void {
  if (USE_MOCKS) {
    mockListeners.add(cb);
    cb(mockUser);
    return () => mockListeners.delete(cb);
  }
  return onIdTokenChanged(getFbAuth(), (u: User | null) => {
    if (!u) {
      cb(null);
      return;
    }
    const base: SessionUser = {
      id: u.uid,
      name: u.displayName ?? u.email ?? 'Host',
      email: u.email ?? '',
      avatar: u.photoURL ?? undefined,
    };
    cb(base); // show immediately, then upgrade with the snag profile
    void withSnagProfile(u, base).then(cb);
  });
}

export async function getIdToken(): Promise<string | null> {
  if (USE_MOCKS) return null;
  const u = getFbAuth().currentUser;
  return u ? u.getIdToken() : null;
}
