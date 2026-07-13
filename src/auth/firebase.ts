/**
 * Firebase Auth — same project as snag-api (FIREBASE_CLIENT_API_KEY server-side).
 * The signed-in user's ID token must carry the `roles: ['admin']` custom claim to
 * pass snag-api's AdminGuard (managed via POST /admin/auth/roles/:id).
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

export function onSession(cb: (user: SessionUser | null) => void): () => void {
  if (USE_MOCKS) {
    mockListeners.add(cb);
    cb(mockUser);
    return () => mockListeners.delete(cb);
  }
  return onIdTokenChanged(getFbAuth(), (u: User | null) =>
    cb(
      u
        ? {
            id: u.uid,
            name: u.displayName ?? u.email ?? 'Host',
            email: u.email ?? '',
            avatar: u.photoURL ?? undefined,
          }
        : null,
    ),
  );
}

export async function getIdToken(): Promise<string | null> {
  if (USE_MOCKS) return null;
  const u = getFbAuth().currentUser;
  return u ? u.getIdToken() : null;
}
