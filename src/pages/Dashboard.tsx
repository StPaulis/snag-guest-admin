import { Link, useNavigate } from 'react-router';
import { useBookings, useChats, useStats } from '../hooks';
import { Avatar, Card, Spinner, StatusPill } from '../components/ui';
import { tenant } from '../tenant';

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <div className="text-[13px] font-bold text-neutral-400">{label}</div>
      <div
        className={`mt-2 text-[32px] leading-none font-bold ${accent ? 'text-brand-600' : 'text-ink-display'}`}
      >
        {value}
      </div>
    </div>
  );
}

function PanelHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <h2 className="m-0 text-[17px] font-bold text-ink-display">{title}</h2>
      <Link to={to} className="text-[13px] font-bold text-brand-600 hover:text-brand-700">
        view all
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = useStats();
  const bookings = useBookings();
  const chats = useChats();

  if (stats.isLoading || bookings.isLoading || chats.isLoading) return <Spinner />;

  const recentBookings = bookings.items.slice(0, 4);
  const recentChats = chats.items.slice(0, 4);

  const { activeListings = 0, pendingRequests = 0, monthRevenue = 0, unreadMessages = 0 } =
    stats.data ?? {};

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="m-0 text-[28px] leading-[34px] font-bold text-ink-display">
        welcome back, {tenant.name}
      </h1>
      <p className="mt-1 mb-6 text-[15px] text-neutral-400">{today}</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <Stat label="active listings" value={String(activeListings)} />
        <Stat label="pending requests" value={String(pendingRequests)} accent />
        <Stat label="this month" value={`$${monthRevenue.toLocaleString()}`} />
        <Stat label="unread messages" value={String(unreadMessages)} />
      </div>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        <Card>
          <PanelHeader title="recent bookings" to="/agreements" />
          <div>
            {recentBookings.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/agreements/${b.id}`)}
                className="flex w-full cursor-pointer items-center gap-3 border-t border-neutral-200 px-5 py-3 text-left hover:bg-brand-100"
              >
                <Avatar name={b.renter.name} src={b.renter.avatar} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-neutral-500">
                    {b.renter.name}
                  </div>
                  <div className="truncate text-[13px] text-neutral-400">
                    {b.listingTitle} · {b.moveIn} – {b.moveOut}
                  </div>
                </div>
                <StatusPill status={b.status} />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <PanelHeader title="recent messages" to="/inbox" />
          <div>
            {recentChats.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/inbox/${c.id}`)}
                className="flex w-full cursor-pointer items-center gap-3 border-t border-neutral-200 px-5 py-3 text-left hover:bg-brand-100"
              >
                <Avatar name={c.name} src={c.avatar} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-neutral-500">{c.name}</div>
                  <div className="truncate text-[13px] text-neutral-400">{c.lastMessage}</div>
                </div>
                {c.unread > 0 && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
