/**
 * Authenticated app shell. Two variants via `navStyle` — 'sidebar' (default) | 'topnav'.
 * Below 860px the sidebar becomes an off-canvas drawer behind a hamburger top bar.
 */
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { Home, Building2, FileText, MessageCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useUnreadCount } from '../hooks';
import { tenant } from '../tenant';
import { Avatar } from '../components/ui';

type NavStyle = 'sidebar' | 'topnav';

const NAV = [
  { to: '/', label: 'home', icon: Home, match: /^\/$/ },
  { to: '/listings', label: 'listings', icon: Building2, match: /^\/listings/ },
  { to: '/agreements', label: 'agreements', icon: FileText, match: /^\/agreements/ },
  { to: '/inbox', label: 'inbox', icon: MessageCircle, match: /^\/inbox/ },
];

function BrandBlock({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-[9px] bg-ink-display font-bold text-white"
        style={{ width: size, height: size, fontSize: 13 }}
      >
        {tenant.initials}
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-bold text-neutral-500">{tenant.name}</div>
        <div className="text-[11px] text-neutral-300">
          on <span className="font-bold text-brand-600">snag</span>
        </div>
      </div>
    </div>
  );
}

function UnreadPill({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-brand-600 px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}

function NavItems({ onNavigate, unread }: { onNavigate?: () => void; unread: number }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, match }) => {
        const active = match.test(pathname);
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[15px] font-bold transition-colors ${
              active ? 'bg-brand-100 text-brand-700' : 'text-neutral-400 hover:bg-neutral-200'
            }`}
          >
            <Icon size={20} strokeWidth={2} />
            {label}
            {label === 'inbox' && <UnreadPill count={unread} />}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserBlock() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-neutral-200 pt-4">
      <Avatar name={user.name} src={user.avatar} size={36} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[14px] font-bold text-neutral-500">{user.name}</div>
        <div className="text-[12px] text-neutral-300">host manager</div>
      </div>
      <button
        onClick={() => void logout()}
        aria-label="log out"
        className="cursor-pointer rounded-[10px] p-2 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-400"
      >
        <LogOut size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

export default function Shell({ navStyle = 'sidebar' }: { navStyle?: NavStyle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = useUnreadCount();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // On every navigation: scroll content to top + close the mobile drawer
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  if (navStyle === 'topnav') {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex h-[60px] items-center gap-6 border-b border-neutral-200 bg-white px-5">
          <BrandBlock size={30} />
          <div className="flex items-center gap-1">
            <NavItems unread={unread} />
          </div>
          <div className="ml-auto">
            <UserBlock />
          </div>
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto p-7 max-[860px]:px-4 max-[860px]:py-5">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Mobile top bar (<860px) */}
      <div className="fixed inset-x-0 top-0 z-50 hidden h-[58px] items-center gap-3 border-b border-neutral-200 bg-white px-4 max-[860px]:flex">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="open menu"
          className="cursor-pointer rounded-[10px] p-2 text-neutral-400 hover:bg-neutral-200"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <BrandBlock size={30} />
        <div className="ml-auto flex items-center gap-2">
          <UnreadPill count={unread} />
          {user && <Avatar name={user.name} src={user.avatar} size={30} />}
          <button
            onClick={() => void logout()}
            aria-label="log out"
            className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-2 text-[13px] font-bold text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-500"
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="max-[380px]:hidden">log out</span>
          </button>
        </div>
      </div>

      {/* Scrim */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 min-[861px]:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`flex w-[248px] shrink-0 flex-col border-r border-neutral-200 bg-white px-3.5 py-5 transition-transform duration-[220ms] ease-(--ease-snag) max-[860px]:fixed max-[860px]:top-0 max-[860px]:bottom-0 max-[860px]:left-0 max-[860px]:z-[60] max-[860px]:shadow-(--shadow-lg) ${
          menuOpen ? 'max-[860px]:translate-x-0' : 'max-[860px]:-translate-x-full'
        }`}
      >
        <div className="mb-7 px-1.5">
          <BrandBlock />
        </div>
        <NavItems unread={unread} onNavigate={() => setMenuOpen(false)} />
        <UserBlock />
      </aside>

      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto p-7 max-[860px]:px-4 max-[860px]:pt-[78px] max-[860px]:pb-5"
      >
        <Outlet />
      </main>
    </div>
  );
}
