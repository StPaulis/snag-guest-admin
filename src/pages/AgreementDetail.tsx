import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Instagram, Linkedin } from 'lucide-react';
import { useBooking, useBookingDecision } from '../hooks';
import { Avatar, Button, Card, Spinner, StatusPill } from '../components/ui';
import { IdVerifiedBadge } from './Agreements';

export default function AgreementDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: b, isLoading } = useBooking(id);
  const { accept, decline } = useBookingDecision();

  if (isLoading) return <Spinner />;
  if (!b)
    return (
      <p className="py-10 text-center text-neutral-400">
        booking not found · <Link to="/agreements" className="font-bold text-brand-600">back to agreements</Link>
      </p>
    );

  const busy = accept.isPending || decline.isPending;

  return (
    <div className="mx-auto max-w-[820px]">
      <button
        onClick={() => navigate('/agreements')}
        className="mb-5 flex cursor-pointer items-center gap-1.5 text-[14px] font-bold text-neutral-400 hover:text-neutral-500"
      >
        <ArrowLeft size={16} strokeWidth={2} /> agreements
      </button>

      <div className="flex items-center gap-3">
        <h1 className="m-0 text-[26px] font-bold text-ink-display">booking {b.ref}</h1>
        <StatusPill status={b.status} />
      </div>
      <p className="mt-1 mb-5 text-[15px] text-neutral-400">{b.listingTitle}</p>

      {b.status === 'requested' && (
        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-warn-200 p-4">
          <div className="flex-1">
            <div className="text-[15px] font-bold text-brand-800">booking request pending</div>
            <div className="text-[14px] text-neutral-500">
              {b.renter.firstName} is waiting for your response
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="declineOutline" disabled={busy} onClick={() => decline.mutate(b.id)}>
              decline
            </Button>
            <Button variant="accept" disabled={busy} onClick={() => accept.mutate(b.id)}>
              accept booking
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-6 max-[860px]:grid-cols-1">
        <Card className="p-5">
          <h2 className="mt-0 mb-4 text-[17px] font-bold text-ink-display">stay details</h2>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-neutral-200 p-3.5">
              <div className="text-[12px] font-bold text-neutral-400">move-in</div>
              <div className="text-[15px] font-bold text-neutral-500">{b.moveIn}</div>
            </div>
            <div className="rounded-[10px] bg-neutral-200 p-3.5">
              <div className="text-[12px] font-bold text-neutral-400">move-out</div>
              <div className="text-[15px] font-bold text-neutral-500">{b.moveOut}</div>
            </div>
          </div>
          <div className="flex justify-between py-1.5 text-[14px] text-neutral-500">
            <span>
              <span className="font-bold">{b.months} months</span> × ${b.monthly.toLocaleString()}
            </span>
            <span>${b.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[14px] text-neutral-500">
            <span>snag service fee</span>
            <span>${b.fee.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-[16px] font-bold text-ink-display">
            <span>total</span>
            <span>${b.total.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="self-start p-5">
          <div className="flex flex-col items-start gap-2">
            <Avatar name={b.renter.name} src={b.renter.avatar} size={52} />
            <div className="text-[16px] font-bold text-neutral-500">{b.renter.name}</div>
            {b.renter.idVerified && <IdVerifiedBadge />}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {b.renter.instagram && (
              <a
                href={`https://instagram.com/${b.renter.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] font-bold text-neutral-400 hover:text-brand-600"
              >
                <Instagram size={16} strokeWidth={2} className="text-brand-600" /> @{b.renter.instagram}
              </a>
            )}
            {b.renter.linkedin && (
              <a
                href={`https://linkedin.com/in/${b.renter.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] font-bold text-neutral-400 hover:text-brand-600"
              >
                <Linkedin size={16} strokeWidth={2} className="text-brand-600" /> {b.renter.linkedin}
              </a>
            )}
          </div>
          {b.chatId && (
            <Button className="mt-4 w-full" onClick={() => navigate(`/inbox/${b.chatId}`)}>
              message {b.renter.firstName}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
