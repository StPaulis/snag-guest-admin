import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { BookingStatus, ListingStatus } from '../api/models';
import spinnerUrl from '../assets/spinner.svg';

/* ---------------------------------- pills ---------------------------------- */

type PillStatus = BookingStatus | ListingStatus;

const PILL_STYLES: Record<PillStatus, string> = {
  paid: 'bg-success-200 text-success-700',
  active: 'bg-success-200 text-success-700',
  requested: 'bg-warn-200 text-brand-800',
  booked: 'bg-info-200 text-info-500',
  cancelled: 'bg-danger-200 text-danger-500',
  paused: 'bg-neutral-200 text-neutral-400',
};

export function StatusPill({ status }: { status: PillStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${PILL_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

/* --------------------------------- avatar ---------------------------------- */

const AVATAR_COLORS = ['bg-brand-400', 'bg-brand-500', 'bg-brand-300', 'bg-warn-200'];

export function Avatar({ name, src, size = 36 }: { name: string; src?: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return src ? (
    <img
      src={src}
      alt={name}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-brand-800 ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

/* --------------------------------- buttons --------------------------------- */

type Variant = 'primary' | 'secondary' | 'accept' | 'declineOutline' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  // press darkens (→ brand-800), no lift/scale — per design system motion rules
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50',
  secondary:
    'bg-white text-neutral-500 hover:bg-neutral-200 active:bg-neutral-200 disabled:opacity-50',
  accept: 'bg-success-700 text-white hover:opacity-90 active:opacity-80',
  declineOutline:
    'border border-danger-500 text-danger-500 bg-transparent hover:bg-danger-200',
  ghost: 'bg-transparent text-neutral-400 hover:bg-neutral-200',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`cursor-pointer rounded-[10px] px-4 py-2.5 text-[15px] font-bold transition-colors duration-150 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

/* ---------------------------------- cards ---------------------------------- */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[14px] bg-white ${className}`}>{children}</div>;
}

/* --------------------------- photo placeholder ------------------------------ */

/** Design system ships no photography — warm color blocks stand in for listing photos. */
const BLOCK_COLORS = ['bg-brand-300', 'bg-brand-400', 'bg-warn-200', 'bg-brand-200'];

export function PhotoBlock({
  seed,
  className = '',
  children,
}: {
  seed: string;
  className?: string;
  children?: ReactNode;
}) {
  const color = BLOCK_COLORS[seed.charCodeAt(seed.length - 1) % BLOCK_COLORS.length];
  return (
    <div className={`flex items-center justify-center ${color} ${className}`}>{children}</div>
  );
}

/* --------------------------------- spinner --------------------------------- */

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div className="flex w-full items-center justify-center py-16">
      <img src={spinnerUrl} width={size} height={size} alt="loading" className="animate-spin" />
    </div>
  );
}
