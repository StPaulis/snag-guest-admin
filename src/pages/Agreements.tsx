import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BadgeCheck } from 'lucide-react';
import { useBookings } from '../hooks';
import { Avatar, Card, Spinner, StatusPill } from '../components/ui';

const FILTERS = ['all', 'paid', 'requested', 'cancelled'] as const;
type Filter = (typeof FILTERS)[number];

export function IdVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-success-700">
      <BadgeCheck size={14} strokeWidth={2} /> id verified
    </span>
  );
}

const GRID = 'grid grid-cols-[1.4fr_1.2fr_1.2fr_.8fr_.8fr] items-center gap-3 px-5';

export default function Agreements() {
  const navigate = useNavigate();
  const { data, isLoading } = useBookings();
  const [filter, setFilter] = useState<Filter>('all');

  if (isLoading) return <Spinner />;

  const filtered = (data ?? []).filter((b) => filter === 'all' || b.status === filter);

  return (
    <div className="mx-auto max-w-[1080px]">
      <h1 className="m-0 text-[28px] leading-[34px] font-bold text-ink-display">agreements</h1>
      <p className="mt-1 mb-5 text-[15px] text-neutral-400">bookings across your listings</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <div className={`${GRID} min-w-[720px] border-b border-neutral-200 py-3 text-[12px] font-bold text-neutral-400`}>
          <div>renter</div>
          <div>listing</div>
          <div>dates</div>
          <div>total</div>
          <div>status</div>
        </div>
        {filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/agreements/${b.id}`)}
            className={`${GRID} min-w-[720px] w-full cursor-pointer border-b border-neutral-200 py-3.5 text-left last:border-b-0 hover:bg-brand-100`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar name={b.renter.name} src={b.renter.avatar} size={34} />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold text-neutral-500">{b.renter.name}</div>
                {b.renter.idVerified && <IdVerifiedBadge />}
              </div>
            </div>
            <div className="truncate text-[14px] text-neutral-500">{b.listingTitle}</div>
            <div className="text-[13px] text-neutral-400">
              {b.moveIn} – {b.moveOut}
            </div>
            <div className="text-[14px] font-bold text-neutral-500">${b.total.toLocaleString()}</div>
            <div>
              <StatusPill status={b.status} />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-[15px] text-neutral-400">no {filter} bookings</p>
        )}
      </Card>
    </div>
  );
}
