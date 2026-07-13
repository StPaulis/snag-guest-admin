import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Image } from 'lucide-react';
import { useListings } from '../hooks';
import { Button, PhotoBlock, Spinner, StatusPill } from '../components/ui';

export default function Listings() {
  const navigate = useNavigate();
  const { items, total, isLoading, hasMore, fetchMore, isFetchingMore } = useListings();
  const [query, setQuery] = useState('');

  if (isLoading) return <Spinner />;

  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (l) => !q || l.title.toLowerCase().includes(q) || l.area.toLowerCase().includes(q),
  );

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[28px] leading-[34px] font-bold text-ink-display">listings</h1>
          <p className="mt-1 mb-0 text-[15px] text-neutral-400">
            {total} properties on snag
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5">
          <Search size={16} strokeWidth={2} className="text-neutral-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search by title or area"
            className="w-52 border-0 bg-transparent text-[14px] text-neutral-500 outline-none placeholder:text-neutral-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
        {filtered.map((l) => (
          <button
            key={l.id}
            onClick={() => navigate(`/listings/${l.id}`)}
            className="cursor-pointer overflow-hidden rounded-[14px] bg-white text-left transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover)"
          >
            <div className="relative">
              {l.photos[0] ? (
                <img src={l.photos[0]} alt={l.title} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <PhotoBlock seed={l.id} className="aspect-[4/3] w-full">
                  <Image size={28} strokeWidth={2} className="text-white/70" />
                </PhotoBlock>
              )}
              <div className="absolute top-3 left-3">
                <StatusPill status={l.status} />
              </div>
            </div>
            <div className="p-4">
              <div className="text-[16px] font-bold text-neutral-500">{l.title}</div>
              <div className="mt-0.5 text-[13px] text-neutral-400">{l.area}</div>
              <div className="mt-2 text-[16px] font-bold text-ink-display">
                ${l.price.toLocaleString()} <span className="font-normal text-neutral-400">/ month</span>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-[15px] text-neutral-400">
            no listings match “{query}”
          </p>
        )}
      </div>

      {hasMore && !q && (
        <div className="mt-7 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => void fetchMore()}
            disabled={isFetchingMore}
            className="px-6"
          >
            {isFetchingMore ? 'loading…' : 'load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
