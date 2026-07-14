/**
 * snag-api entity types & enums (mirrors snag-api src/domain/** and src/libs/enums).
 * Keep in sync with snag-api — see docs/API_MAPPING.md.
 */

export enum AgreementStatus {
  REQUESTED = 'requested',
  CREATED = 'created',
  DECLINED = 'declined',
  SIGNED = 'signed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

export enum PostType {
  LOOKING_FOR = 'looking-for',
  OFFERING = 'offering',
}

export enum UnitType {
  STUDIO = 'studio',
  ROOM = 'room',
  ONE_BEDROOM = 'one-bedroom',
  TWO_BEDROOM = 'two-bedroom',
  THREE_PLUS_BEDROOM = 'three-plus-bedroom',
}

export enum CancellationPolicy {
  BEFORE_CHECK_IN = 'before-check-in',
  ONE_WEEK_BEFORE_CHECK_IN = 'one-week-before-check-in',
  ONE_MONTH_BEFORE_CHECK_IN = 'one-month-before-check-in',
  NO_CANCELLATION = 'no-cancellation',
}

export enum PaymentPeriod {
  ALL_AT_ONCE = 'all-at-once',
  MONTHLY = 'monthly',
}

export enum MessageType {
  HTML = 'html',
  TEXT = 'text',
  FOLLOW_UP = 'follow-up',
  CALL = 'call',
  PRE_CALL = 'pre-call',
  POST_CALL = 'post-call',
  OFF_PLATFORM = 'off-platform',
  AGREEMENT = 'agreement',
  AGREEMENT_ALREADY_BOOKED = 'agreement-already-booked',
  AGENT_TEXT = 'agent-text',
  AGENT_ACTION = 'agent-action',
  SCHEDULING_AGENT = 'scheduling-agent',
}

/** Admin list responses: `{ data, total }`. Requests send 1-based `page` + `limit` (default 30, max 1000). */
export interface PagedDto<T> {
  data: T[];
  total: number;
}

export interface PageQuery {
  page: number;
  limit: number;
  offset?: number;
  sort?: string;
  isSortAscending?: boolean;
}

export interface ApiMedia {
  id: string;
  createdBy: string;
  url: string;
  entityType: string;
  entityId?: string;
  previewUrl?: string;
  order?: number;
  /** May carry a display filename / mime hint for non-image attachments. */
  extras?: Record<string, unknown> & { fileName?: string; mimeType?: string };
  createdAt: string;
}

export interface ApiAddress {
  id?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiUser {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  status: EntityStatus;
  companyId?: string;
  idVerifiedAt?: string | null;
  extras?: Record<string, unknown> & {
    instagram?: string;
    linkedin?: string;
  };
  createdAt: string;
}

/** A "listing" in the portal is an offering Post in snag-api. Money fields are integer cents. */
export interface ApiPost {
  id: string;
  userId: string;
  description: string;
  type: PostType;
  status: EntityStatus;
  unitType?: UnitType;
  unitDetails?: { bedrooms?: number; bathrooms?: number } & Record<string, unknown>;
  price?: number; // cents / month
  additionalCosts?: number; // cents
  securityDeposit?: number; // cents
  cancellationPolicy?: CancellationPolicy;
  activeFrom?: string;
  activeUntil?: string;
  amenities?: string[];
  aptNumber?: string;
  instantBook?: boolean;
  isCompleted?: boolean;
  expiresAt?: string;
  extras?: Record<string, unknown> & { title?: string };
  address?: ApiAddress;
  media?: ApiMedia[];
  user?: ApiUser;
  agreements?: ApiAgreement[];
  createdAt: string;
}

export interface ApiAgreement {
  id: string;
  createdBy: string; // sublettor (host) user id
  createdFor: string; // sublettee (renter) user id
  status: AgreementStatus;
  postId: string;
  chatRoomId?: string;
  moveInAt?: string;
  moveOutAt?: string;
  aptNumber?: string;
  unitType: UnitType;
  monthlyPrice: number; // cents
  totalPrice: number; // cents
  additionalCosts: number; // cents
  fee: number; // cents
  /** Refundable security deposit held for the stay, in cents. */
  refundableFee?: number | null;
  referralDiscount?: number; // cents
  cancellationPolicy?: CancellationPolicy | null;
  paymentPeriod?: PaymentPeriod | null;
  extras?: Record<string, unknown>;
  post?: ApiPost;
  forUser?: ApiUser;
  byUser?: ApiUser;
  createdAt: string;
}

export interface ApiChatRoom {
  id: string;
  name: string;
  createdBy?: string;
  agentDisabled?: boolean;
  chatUsers?: { userId: string; user?: ApiUser }[];
  agreements?: ApiAgreement[];
  unreadMessagesCount?: number;
  lastChatMessage?: ApiChatMessage;
  lastAgreement?: ApiAgreement;
  createdAt: string;
}

/** GET /admin-guest/stats response (AdminGuestStatsDto). Money in cents. */
export interface ApiGuestStats {
  activeListings: number;
  pendingRequests: number;
  monthRevenueCents: number;
  unread: number;
}

export interface ApiChatMessage {
  id: string;
  userId?: string;
  chatRoomId: string;
  text: string;
  type: MessageType;
  status?: EntityStatus;
  user?: ApiUser;
  media?: ApiMedia[];
  isRead?: boolean;
  createdAt: string;
}
