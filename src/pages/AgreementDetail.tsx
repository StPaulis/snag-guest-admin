import { ArrowLeft, Instagram, Linkedin } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Avatar, Button, Card, Spinner, StatusPill } from "../components/ui";
import { useBooking, useBookingDecision } from "../hooks";
import { IdVerifiedBadge } from "./Agreements";

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-neutral-200 p-3.5">
      <div className="text-[12px] font-bold text-neutral-400">{label}</div>
      <div className="text-[15px] font-bold text-neutral-500">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 text-[14px] text-neutral-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function AgreementDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: b, isLoading } = useBooking(id);
  const { accept, decline } = useBookingDecision();

  if (isLoading) return <Spinner />;
  if (!b)
    return (
      <p className="py-10 text-center text-neutral-400">
        booking not found ·{" "}
        <Link to="/agreements" className="font-bold text-brand-600">
          back to agreements
        </Link>
      </p>
    );

  const busy = accept.isPending || decline.isPending;

  return (
    <div className="mx-auto max-w-[820px]">
      <button
        onClick={() => navigate("/agreements")}
        className="mb-5 flex cursor-pointer items-center gap-1.5 text-[14px] font-bold text-neutral-400 hover:text-neutral-500"
      >
        <ArrowLeft size={16} strokeWidth={2} /> agreements
      </button>

      <div className="flex items-center gap-3">
        <h1 className="m-0 text-[26px] font-bold text-ink-display">
          booking {b.ref}
        </h1>
        <StatusPill status={b.status} />
      </div>
      <p className="mt-1 mb-5 text-[15px] text-neutral-400">{b.listingTitle}</p>

      {b.canRespond && (
        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-warn-200 p-4">
          <div className="flex-1">
            <div className="text-[15px] font-bold text-brand-800">
              booking request pending
            </div>
            <div className="text-[14px] text-neutral-500">
              {b.renter.firstName} is waiting for your response
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="declineOutline"
              disabled={busy}
              onClick={() => decline.mutate(b.id)}
            >
              decline
            </Button>
            <Button
              variant="accept"
              disabled={busy}
              onClick={() => accept.mutate(b.id)}
            >
              accept booking
            </Button>
          </div>
        </div>
      )}

      {/* `created` agreements can't be accepted or declined yet — the renter
          hasn't submitted the request. */}
      {b.status === "created" && (
        <div className="mb-5 rounded-xl bg-warn-200 p-4">
          <div className="text-[15px] font-bold text-brand-800">
            booking request in progress
          </div>
          <div className="text-[14px] text-neutral-500">
            waiting for {b.renter.firstName} to finalize the request — you’ll be
            able to accept or decline once it’s submitted
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-6 max-[860px]:grid-cols-1">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mt-0 mb-4 text-[17px] font-bold text-ink-display">
              stay details
            </h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Tile label="move-in" value={b.moveIn} />
              <Tile label="move-out" value={b.moveOut} />
              {b.unitType && <Tile label="unit" value={b.unitType} />}
              {b.aptNumber && (
                <Tile label="apt / unit no." value={b.aptNumber} />
              )}
            </div>
            <Row
              label={
                <>
                  <span className="font-bold">{b.months} months</span> × $
                  {b.monthly.toLocaleString()}
                </>
              }
              value={`$${b.subtotal.toLocaleString()}`}
            />
            {b.referralDiscount ? (
              <Row
                label="referral discount"
                value={`–$${b.referralDiscount.toLocaleString()}`}
              />
            ) : null}
            <Row
              label="snag service fee"
              value={`$${b.fee.toLocaleString()}`}
            />
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-[16px] font-bold text-ink-display">
              <span>total</span>
              <span>${b.total.toLocaleString()}</span>
            </div>

            {b.additionalCosts != null && (
              <div className="mt-1 flex justify-between py-1.5 text-[13px] text-neutral-400">
                <span>additional costs</span>
                <span>${b.additionalCosts.toLocaleString()}</span>
              </div>
            )}
            {b.securityDeposit != null && (
              <div className="mt-1 flex justify-between py-1.5 text-[13px] text-neutral-400">
                <span>refundable security deposit</span>
                <span>${b.securityDeposit.toLocaleString()}</span>
              </div>
            )}
          </Card>

          {(b.paymentSchedule || b.cancellationPolicy) && (
            <Card className="p-5">
              <h2 className="mt-0 mb-4 text-[17px] font-bold text-ink-display">
                payment & terms
              </h2>
              {b.paymentSchedule && (
                <Row label="payment schedule" value={b.paymentSchedule} />
              )}
              {b.cancellationPolicy && (
                <Row label="cancellation policy" value={b.cancellationPolicy} />
              )}
            </Card>
          )}
        </div>

        <Card className="self-start p-5">
          <div className="flex flex-col items-start gap-2">
            <Avatar name={b.renter.name} src={b.renter.avatar} size={52} />
            <div className="text-[16px] font-bold text-neutral-500">
              {b.renter.name}
            </div>
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
                <Instagram
                  size={16}
                  strokeWidth={2}
                  className="text-brand-600"
                />{" "}
                @{b.renter.instagram}
              </a>
            )}
            {b.renter.linkedin && (
              <a
                href={`https://linkedin.com/in/${b.renter.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] font-bold text-neutral-400 hover:text-brand-600"
              >
                <Linkedin
                  size={16}
                  strokeWidth={2}
                  className="text-brand-600"
                />{" "}
                {b.renter.linkedin}
              </a>
            )}
          </div>
          {b.chatId && (
            <Button
              className="mt-4 w-full"
              onClick={() => navigate(`/inbox/${b.chatId}`)}
            >
              message {b.renter.firstName}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
