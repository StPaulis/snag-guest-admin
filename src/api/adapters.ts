/**
 * Maps snag-api entities → UI view-models.
 * All snag-api money fields are integer cents; UI models use dollars.
 */
import {
  AgreementStatus,
  CancellationPolicy,
  EntityStatus,
  PaymentPeriod,
  UnitType,
  type ApiAgreement,
  type ApiChatMessage,
  type ApiChatRoom,
  type ApiGuestStats,
  type ApiMedia,
  type ApiPost,
  type ApiUser,
} from './types';
import type {
  Booking,
  BookingStatus,
  ChatSummary,
  DashboardStats,
  Listing,
  MediaKind,
  Message,
  MessageMedia,
  Renter,
} from './models';

const cents = (v?: number | null) => Math.round((v ?? 0) / 100);

const UNIT_BEDS: Record<UnitType, number> = {
  [UnitType.STUDIO]: 0,
  [UnitType.ROOM]: 1,
  [UnitType.ONE_BEDROOM]: 1,
  [UnitType.TWO_BEDROOM]: 2,
  [UnitType.THREE_PLUS_BEDROOM]: 3,
};

const UNIT_LABELS: Record<UnitType, string> = {
  [UnitType.STUDIO]: 'studio',
  [UnitType.ROOM]: 'private room',
  [UnitType.ONE_BEDROOM]: '1 bedroom',
  [UnitType.TWO_BEDROOM]: '2 bedroom',
  [UnitType.THREE_PLUS_BEDROOM]: '3+ bedroom',
};

const CANCELLATION_LABELS: Record<CancellationPolicy, string> = {
  [CancellationPolicy.BEFORE_CHECK_IN]: 'free until check-in',
  [CancellationPolicy.ONE_WEEK_BEFORE_CHECK_IN]: 'up to 1 week before check-in',
  [CancellationPolicy.ONE_MONTH_BEFORE_CHECK_IN]: 'up to 1 month before check-in',
  [CancellationPolicy.NO_CANCELLATION]: 'non-refundable',
};

const PAYMENT_PERIOD_LABELS: Record<PaymentPeriod, string> = {
  [PaymentPeriod.ALL_AT_ONCE]: 'paid in full',
  [PaymentPeriod.MONTHLY]: 'paid monthly',
};

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShort(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function monthsBetween(moveIn?: string, moveOut?: string): number {
  if (!moveIn || !moveOut) return 1;
  const a = new Date(moveIn);
  const b = new Date(moveOut);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}

/**
 * snag-api has 6 agreement statuses; the portal shows 4.
 * paid|signed → paid · created → created · requested → requested · cancelled|declined → cancelled
 */
export function toBookingStatus(s: AgreementStatus): BookingStatus {
  switch (s) {
    case AgreementStatus.PAID:
    case AgreementStatus.SIGNED:
      return 'paid';
    case AgreementStatus.CREATED:
      return 'created';
    case AgreementStatus.REQUESTED:
      return 'requested';
    default:
      return 'cancelled';
  }
}

export function toRenter(u?: ApiUser, fallbackId = ''): Renter {
  const name =
    [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.displayName || 'Renter';
  return {
    id: u?.id ?? fallbackId,
    name,
    firstName: u?.firstName || name.split(' ')[0],
    avatar: u?.profileImageUrl,
    idVerified: Boolean(u?.idVerifiedAt),
    instagram: u?.extras?.instagram,
    linkedin: u?.extras?.linkedin,
  };
}

export function toListing(post: ApiPost): Listing {
  const paid = (post.agreements ?? []).filter((a) => toBookingStatus(a.status) === 'paid');
  const hasActivePaid = paid.some((a) => !a.moveOutAt || new Date(a.moveOutAt) > new Date());
  const status: Listing['status'] =
    post.status !== EntityStatus.ACTIVE || post.isCompleted
      ? 'paused'
      : hasActivePaid
        ? 'booked'
        : 'active';
  return {
    id: post.id,
    title:
      post.extras?.title ||
      (post.description || '').split(/[.\n]/)[0].slice(0, 60) ||
      'Untitled listing',
    area: [post.address?.neighborhood, post.address?.city].filter(Boolean).join(', ') || '—',
    price: cents(post.price),
    status,
    beds: post.unitDetails?.bedrooms ?? (post.unitType ? UNIT_BEDS[post.unitType] : 1),
    baths: post.unitDetails?.bathrooms ?? 1,
    window:
      post.activeFrom || post.activeUntil
        ? `${formatShort(post.activeFrom)} – ${formatShort(post.activeUntil)}`
        : 'flexible',
    bookingCount: (post.agreements ?? []).length,
    desc: post.description ?? '',
    amenities: post.amenities ?? [],
    photos: (post.media ?? [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((m) => m.url),
  };
}

export function toBooking(ag: ApiAgreement, listingTitle?: string): Booking {
  const monthly = cents(ag.monthlyPrice);
  const months = monthsBetween(ag.moveInAt, ag.moveOutAt);
  const fee = cents(ag.fee);
  const total = cents(ag.totalPrice) || monthly * months + fee;
  const additionalCosts = cents(ag.additionalCosts ?? ag.post?.additionalCosts);
  // Security deposit lives on the agreement (refundableFee) once agreed, else on the post.
  const depositCents = ag.refundableFee ?? ag.post?.securityDeposit;
  const securityDeposit = depositCents != null ? cents(depositCents) : undefined;
  const referralDiscount = cents(ag.referralDiscount);
  const policy = ag.cancellationPolicy ?? ag.post?.cancellationPolicy ?? undefined;
  return {
    id: ag.id,
    ref: `#SN-${ag.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`,
    listingId: ag.postId,
    listingTitle: listingTitle ?? (ag.post ? toListing(ag.post).title : 'Listing'),
    renter: toRenter(ag.forUser, ag.createdFor),
    status: toBookingStatus(ag.status),
    // Only raw `requested` can be accepted/declined server-side; `created` is
    // still a renter-side draft and shows its own status.
    canRespond: ag.status === AgreementStatus.REQUESTED,
    moveIn: formatDate(ag.moveInAt),
    moveOut: formatDate(ag.moveOutAt),
    months,
    monthly,
    subtotal: monthly * months,
    fee,
    total,
    unitType: ag.unitType ? UNIT_LABELS[ag.unitType] : undefined,
    aptNumber: ag.aptNumber || undefined,
    additionalCosts,
    securityDeposit,
    referralDiscount: referralDiscount || undefined,
    cancellationPolicy: policy ? CANCELLATION_LABELS[policy] : undefined,
    paymentSchedule: ag.paymentPeriod ? PAYMENT_PERIOD_LABELS[ag.paymentPeriod] : undefined,
    chatId: ag.chatRoomId,
  };
}

/**
 * Company-side detection: /admin-guest rooms only ever contain our own company's
 * members plus renters, so a participant/sender with a companyId is one of our
 * admins. `hostUserId` (tenant env) is kept as a fallback signal only.
 */
const isCompanySide = (u?: ApiUser, id?: string, hostUserId?: string): boolean =>
  Boolean(u?.companyId) || (!!hostUserId && (u?.id ?? id) === hostUserId);

/**
 * The chat's secondary label (shown under the renter name). A room's `name` is
 * often blank for renter-initiated threads, so fall back through everything that
 * helps a host tell conversations apart: the linked listing, then the room's own
 * name, then the unit/apt from the agreement, and finally a generic label.
 */
function chatListingLabel(room: ApiChatRoom, ag: ApiAgreement | undefined, renter: Renter): string {
  const fromListing = ag?.post ? toListing(ag.post).title : '';
  if (fromListing && fromListing !== 'Untitled listing') return fromListing;
  const roomName = room.name?.trim();
  if (roomName) return roomName;
  if (ag) {
    const unit = ag.unitType ? UNIT_LABELS[ag.unitType] : '';
    const apt = ag.aptNumber ? `unit ${ag.aptNumber}` : '';
    const label = [unit, apt].filter(Boolean).join(' · ');
    if (label) return label;
  }
  return `direct message with ${renter.firstName}`;
}

export function toChatSummary(room: ApiChatRoom, hostUserId?: string): ChatSummary {
  const chatUsers = room.chatUsers ?? [];
  const host = chatUsers.find((cu) => isCompanySide(cu.user, cu.userId, hostUserId));
  const other = chatUsers
    .filter((cu) => cu !== host)
    .map((cu) => cu.user)
    .find((u) => u && !isCompanySide(u, undefined, hostUserId));
  const renter = toRenter(other ?? undefined, room.createdBy ?? '');
  // Prefer an actionable (requested) agreement so the chat's accept/decline
  // banner targets it; rooms embed agreements when fetched with includeAgreements.
  const lastAg =
    room.agreements?.find((a) => a.status === AgreementStatus.REQUESTED) ??
    room.lastAgreement ??
    room.agreements?.[0];
  return {
    id: room.id,
    agId: lastAg?.id,
    name: renter.name,
    firstName: renter.firstName,
    avatar: renter.avatar,
    listing: chatListingLabel(room, lastAg, renter),
    lastMessage: room.lastChatMessage?.text ?? '',
    time: formatTime(room.lastChatMessage?.createdAt ?? room.createdAt),
    unread: room.unreadMessagesCount ?? 0,
    hostId: host?.userId,
    hostName: host?.user ? toRenter(host.user).name : undefined,
  };
}

export function toDashboardStats(s: ApiGuestStats): DashboardStats {
  return {
    activeListings: s.activeListings,
    pendingRequests: s.pendingRequests,
    monthRevenue: cents(s.monthRevenueCents),
    unreadMessages: s.unread,
  };
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|bmp|svg)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v|avi|mkv|ogv)(\?|#|$)/i;

/** Infer how to render an attachment from its mime hint, then its URL extension. */
function mediaKind(m: ApiMedia): MediaKind {
  const mime = m.extras?.mimeType?.toLowerCase() ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime) return 'document';
  const url = m.url ?? '';
  if (IMAGE_EXT.test(url)) return 'image';
  if (VIDEO_EXT.test(url)) return 'video';
  // Images uploaded through snag frequently carry a generated previewUrl.
  if (m.previewUrl && !VIDEO_EXT.test(url)) return 'image';
  return 'document';
}

/** Derive a human filename for document chips from extras or the URL tail. */
function mediaName(m: ApiMedia): string | undefined {
  if (m.extras?.fileName) return m.extras.fileName;
  try {
    const path = new URL(m.url).pathname;
    const tail = decodeURIComponent(path.split('/').pop() ?? '');
    return tail || undefined;
  } catch {
    return undefined;
  }
}

export function toMessageMedia(m: ApiMedia): MessageMedia {
  const kind = mediaKind(m);
  return {
    id: m.id,
    kind,
    url: m.url,
    previewUrl: m.previewUrl,
    name: kind === 'document' ? (mediaName(m) ?? 'attachment') : mediaName(m),
  };
}

export function toMessage(m: ApiChatMessage, hostUserId?: string): Message {
  const media = (m.media ?? []).map(toMessageMedia);
  return {
    id: m.id,
    from: isCompanySide(m.user, m.userId, hostUserId) ? 'me' : 'them',
    senderName: m.user ? toRenter(m.user).name : undefined,
    text: m.text,
    time: formatTime(m.createdAt),
    media: media.length ? media : undefined,
  };
}
