import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Image } from 'lucide-react';
import { useListing } from '../hooks';
import { Button, PhotoBlock, Spinner, StatusPill } from '../components/ui';

/**
 * NOTE (product decision): listings are read-only in this portal.
 * Do NOT add an "edit listing" affordance.
 */
export default function ListingDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: l, isLoading } = useListing(id);

  if (isLoading) return <Spinner />;
  if (!l)
    return (
      <p className="py-10 text-center text-neutral-400">
        listing not found · <Link to="/listings" className="font-bold text-brand-600">back to listings</Link>
      </p>
    );

  const photo = (idx: number, className: string) =>
    l.photos[idx] ? (
      <img src={l.photos[idx]} alt="" className={`${className} object-cover`} />
    ) : (
      <PhotoBlock seed={l.id + idx} className={className}>
        <Image size={26} strokeWidth={2} className="text-white/70" />
      </PhotoBlock>
    );

  return (
    <div className="mx-auto max-w-[920px]">
      <button
        onClick={() => navigate('/listings')}
        className="mb-5 flex cursor-pointer items-center gap-1.5 text-[14px] font-bold text-neutral-400 hover:text-neutral-500"
      >
        <ArrowLeft size={16} strokeWidth={2} /> listings
      </button>

      <div className="grid grid-cols-[1.6fr_1fr] gap-3 max-[720px]:grid-cols-1">
        {photo(0, 'aspect-[16/10] w-full rounded-[14px]')}
        <div className="grid grid-rows-2 gap-3 max-[720px]:hidden">
          {photo(1, 'h-full w-full rounded-[14px]')}
          {photo(2, 'h-full w-full rounded-[14px]')}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_300px] gap-6 max-[860px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-[26px] font-bold text-ink-display">{l.title}</h1>
            <StatusPill status={l.status} />
          </div>
          <p className="mt-1 text-[15px] text-neutral-400">{l.area}</p>

          <div className="my-5 flex gap-10 border-y border-neutral-200 py-4">
            <div>
              <div className="text-[13px] font-bold text-neutral-400">bedrooms</div>
              <div className="text-[16px] font-bold text-neutral-500">{l.beds === 0 ? 'studio' : l.beds}</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-neutral-400">bathrooms</div>
              <div className="text-[16px] font-bold text-neutral-500">{l.baths}</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-neutral-400">available</div>
              <div className="text-[16px] font-bold text-neutral-500">{l.window}</div>
            </div>
          </div>

          <h2 className="mb-2 text-[17px] font-bold text-ink-display">about this place</h2>
          <p className="text-[15px] leading-6 text-neutral-500">{l.desc}</p>

          {l.amenities.length > 0 && (
            <>
              <h2 className="mt-6 mb-3 text-[17px] font-bold text-ink-display">amenities</h2>
              <div className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-neutral-200 px-3.5 py-1.5 text-[13px] font-bold text-neutral-500">
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="max-[860px]:static sticky top-0 self-start rounded-[14px] bg-white p-5">
          <div className="text-[24px] font-bold text-ink-display">
            ${l.price.toLocaleString()} <span className="text-[15px] font-normal text-neutral-400">/ month</span>
          </div>
          <p className="mt-1 mb-4 text-[13px] text-neutral-400">
            {l.bookingCount} booking{l.bookingCount === 1 ? '' : 's'} this year
          </p>
          <Button className="w-full" onClick={() => navigate('/agreements')}>
            view bookings
          </Button>
          {/* Deliberately no "edit listing" button — listings are read-only here. */}
        </div>
      </div>
    </div>
  );
}
