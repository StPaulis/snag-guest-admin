/**
 * Maps snag-api entities → UI view-models.
 * All snag-api money fields are integer cents; UI models use dollars.
 */
import {
  AgreementStatus,
  EntityStatus,
  UnitType,
  type ApiAgreement,
  type ApiChatMessage,
  type ApiChatRoom,
  type ApiGuestStats,
  type ApiPost,
  type ApiUser,
} from './types';
import type {
  Booking,
  BookingStatus,
  ChatSummary,
  DashboardStats,
  Listing,
  Message,
  Renter,
} from './models';

const cents = (v?: number) => Math.round((v ?? 0) / 100);

const UNIT_BEDS: Record<UnitType, number> = {
  [UnitType.STUDIO]: 0,
  [UnitType.ROOM]: 1,
  [UnitType.ONE_BEDROOM]: 1,
  [UnitType.TWO_BEDROOM]: 2,
  [UnitType.THREE_PLUS_BEDROOM]: 3,
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
 * snag-api has 6 agreement statuses; the portal shows 3.
 * paid|signed → paid · requested|created → requested · cancelled|declined → cancelled
 */
export function toBookingStatus(s: AgreementStatus): BookingStatus {
  switch (s) {
    case AgreementStatus.PAID:
    case AgreementStatus.SIGNED:
      return 'paid';
    case AgreementStatus.REQUESTED:
    case AgreementStatus.CREATED:
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
  return {
    id: ag.id,
    ref: `#SN-${ag.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`,
    listingId: ag.postId,
    listingTitle: listingTitle ?? (ag.post ? toListing(ag.post).title : 'Listing'),
    renter: toRenter(ag.forUser, ag.createdFor),
    status: toBookingStatus(ag.status),
    moveIn: formatDate(ag.moveInAt),
    moveOut: formatDate(ag.moveOutAt),
    months,
    monthly,
    subtotal: monthly * months,
    fee,
    total,
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

export function toChatSummary(room: ApiChatRoom, hostUserId?: string): ChatSummary {
  const chatUsers = room.chatUsers ?? [];
  const host = chatUsers.find((cu) => isCompanySide(cu.user, cu.userId, hostUserId));
  const other = chatUsers
    .filter((cu) => cu !== host)
    .map((cu) => cu.user)
    .find((u) => u && !isCompanySide(u, undefined, hostUserId));
  const renter = toRenter(other ?? undefined, room.createdBy ?? '');
  const lastAg = room.lastAgreement ?? room.agreements?.[0];
  return {
    id: room.id,
    agId: lastAg?.id,
    name: renter.name,
    firstName: renter.firstName,
    avatar: renter.avatar,
    listing: lastAg?.post ? toListing(lastAg.post).title : room.name,
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

export function toMessage(m: ApiChatMessage, hostUserId?: string): Message {
  return {
    id: m.id,
    from: isCompanySide(m.user, m.userId, hostUserId) ? 'me' : 'them',
    senderName: m.user ? toRenter(m.user).name : undefined,
    text: m.text,
    time: formatTime(m.createdAt),
  };
}
