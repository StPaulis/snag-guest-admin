/**
 * UI view-models — exactly the entities the design handoff describes
 * (docs/design-handoff/HANDOFF.md § Data & API). Pages consume ONLY these,
 * never raw snag-api entities; adapters.ts maps between the two.
 */

export type ListingStatus = 'active' | 'booked' | 'paused';
export type BookingStatus = 'paid' | 'created' | 'requested' | 'cancelled';

export interface Listing {
  id: string;
  title: string;
  area: string;
  /** monthly price in dollars */
  price: number;
  status: ListingStatus;
  beds: number;
  baths: number;
  /** availability window, e.g. "Jun 1 – Aug 31" */
  window: string;
  bookingCount: number;
  desc: string;
  amenities: string[];
  photos: string[]; // URLs; empty → warm color-block placeholder
}

export interface Renter {
  id: string;
  name: string;
  firstName: string;
  avatar?: string;
  idVerified: boolean;
  instagram?: string;
  linkedin?: string;
}

export interface Booking {
  id: string;
  /** display ref, e.g. "#SN-4821" */
  ref: string;
  listingId: string;
  listingTitle: string;
  renter: Renter;
  status: BookingStatus;
  /**
   * True only when the underlying agreement is in the raw `requested` state —
   * the only state snag-api's accept/decline endpoints act on. The separate
   * `created` status (a draft the renter hasn't submitted yet) never shows
   * accept/decline affordances.
   */
  canRespond: boolean;
  moveIn: string;
  moveOut: string;
  months: number;
  /** dollars */
  monthly: number;
  subtotal: number;
  fee: number;
  total: number;
  /** human-readable unit, e.g. "1 bedroom", "private room" */
  unitType?: string;
  aptNumber?: string;
  /** one-off costs on top of rent, in dollars (0 when none) */
  additionalCosts: number;
  /** refundable security deposit in dollars, if the stay holds one */
  securityDeposit?: number;
  /** referral credit applied, in dollars, if any */
  referralDiscount?: number;
  /** human-readable cancellation policy, e.g. "up to 1 month before check-in" */
  cancellationPolicy?: string;
  /** human-readable payment schedule, e.g. "paid in full" / "monthly" */
  paymentSchedule?: string;
  chatId?: string;
}

export interface ChatSummary {
  id: string;
  agId?: string;
  name: string;
  firstName: string;
  avatar?: string;
  listing: string;
  lastMessage: string;
  time: string;
  unread: number;
  /** company-side participant of this room — replies are always sent as this user */
  hostId?: string;
  hostName?: string;
}

export type MediaKind = 'image' | 'video' | 'document';

/** An attachment on a chat message — an image, a video, or a document/file. */
export interface MessageMedia {
  id: string;
  kind: MediaKind;
  /** original file URL (opens/downloads) */
  url: string;
  /** thumbnail/poster for images & video, when available */
  previewUrl?: string;
  /** display name for documents (and alt text) */
  name?: string;
}

export interface Message {
  id: string;
  /** 'me' = sent by any of our company's admins, 'them' = the renter */
  from: 'me' | 'them';
  senderName?: string;
  text: string;
  time: string;
  /** attachments (images/video/docs); empty or absent for plain-text messages */
  media?: MessageMedia[];
}

export interface DashboardStats {
  activeListings: number;
  pendingRequests: number;
  monthRevenue: number; // dollars
  unreadMessages: number;
}

/** Page size for every fetch — lists and chat threads. Never request more per call. */
export const DEFAULT_LIMIT = 30;

/** 1-based paging request. `limit` defaults to DEFAULT_LIMIT. */
export interface PageParams {
  page: number;
  limit: number;
}

/** Paging plus server-side free-text search (snag-api `search` query param). */
export interface ListParams extends PageParams {
  search?: string;
}

/** A page of results plus the server-side total, for real pagination. */
export interface Page<T> {
  items: T[];
  total: number;
}

/** The single data-access interface every page uses. Real + mock both implement it. */
export interface GuestAdminApi {
  getListings(params: ListParams): Promise<Page<Listing>>;
  getListing(id: string): Promise<Listing | undefined>;
  getBookings(params: ListParams): Promise<Page<Booking>>;
  getBooking(id: string): Promise<Booking | undefined>;
  acceptBooking(id: string): Promise<void>;
  declineBooking(id: string): Promise<void>;
  getChats(params: PageParams): Promise<Page<ChatSummary>>;
  /** Pages run newest→oldest (page 1 = latest messages); items within a page are newest-first too. */
  getMessages(chatId: string, params: PageParams): Promise<Page<Message>>;
  sendMessage(chatId: string, text: string, asUserId?: string): Promise<void>;
  markChatRead(chatId: string): Promise<void>;
  getStats(): Promise<DashboardStats>;
}
