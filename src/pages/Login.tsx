import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui';
import { tenant } from '../tenant';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('invalid email or password');
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-3 text-[15px] text-neutral-500 outline-none placeholder:text-neutral-300 focus:border-brand-500';

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="flex w-full max-w-[920px] overflow-hidden rounded-[20px] bg-white shadow-(--shadow-login)">
        {/* Left: form */}
        <div className="flex flex-1 flex-col justify-center px-12 py-14 max-[860px]:px-8">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-ink-display text-[13px] font-bold text-white">
              {tenant.initials}
            </div>
            <span className="text-[15px] text-neutral-300">×</span>
            <span className="text-[17px] font-bold text-brand-600">snag</span>
          </div>
          <h1 className="m-0 text-[32px] leading-10 font-bold text-ink-display">welcome back</h1>
          <p className="mt-1.5 mb-7 text-[15px] text-neutral-400">
            log in to the {tenant.name} host portal
          </p>
          <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
            <input
              type="password"
              required
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
            <a href="#" className="-mt-1 self-end text-[13px] font-bold text-brand-600 hover:text-brand-700">
              forgot password?
            </a>
            {error && <div className="text-[13px] font-bold text-danger-500">{error}</div>}
            <Button type="submit" disabled={busy} className="w-full py-3.5 text-[19px]">
              {busy ? 'logging in…' : 'log in'}
            </Button>
          </form>
          <p className="mt-8 text-[12px] text-neutral-300">
            {tenant.subdomain}.snagsublets.com · secured by snag
          </p>
        </div>
        {/* Right: promo — hidden below 720px */}
        <div className="relative flex flex-1 flex-col justify-end overflow-hidden bg-linear-150 from-brand-500 to-brand-700 p-12 max-[720px]:hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <h2 className="relative m-0 text-[28px] leading-9 font-bold text-white">
            your listings, agreements &amp; messages — all in one place.
          </h2>
          <p className="relative mt-3 text-[15px] leading-6 text-white/85">
            everything you host on snag, managed by your whole team.
          </p>
        </div>
      </div>
    </div>
  );
}
