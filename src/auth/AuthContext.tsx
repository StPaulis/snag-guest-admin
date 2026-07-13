import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAuthErrorHandler } from '../api/http';
import { onSession, signIn, signOut, type SessionUser } from './firebase';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onSession((u) => {
        setUser(u);
        setLoading(false);
      }),
    [],
  );

  // Any 401/403 from the API → sign out automatically (expired session or a token
  // missing the guest-admin claim). RequireAuth then redirects to /login.
  useEffect(() => {
    setAuthErrorHandler(() => {
      void signOut();
    });
    return () => setAuthErrorHandler(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: signIn, logout: signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
