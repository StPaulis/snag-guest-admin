/**
 * UI view-models — exactly the entities the design handoff describes
 * (docs/design-handoff/HANDOFF.md § Data & API). Pages consume ONLY these,
 * never raw snag-api entities; adapters.ts maps between the two.
 */

export type ListingStatus = 'active' | 'booked' | 'paused';
export type BookingStatus = 'paid' | 'requested' | 'cancelled';

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
  moveIn: string;
  moveOut: string;
  months: number;
  /** dollars */
  monthly: number;
  subtotal: number;
  fee: number;
  total: number;
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
}

export interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface DashboardStats {
  activeListings: number;
  pendingRequests: number;
  monthRevenue: number; // dollars
  unreadMessages: number;
}

/** 1-based paging request. `limit` defaults to 30 (see hooks.ts DEFAULT_LIMIT). */
export interface PageParams {
  page: number;
  limit: number;
}

/** A page of results plus the server-side total, for real pagination. */
export interface Page<T> {
  items: T[];
  total: number;
}

/** The single data-access interface every page uses. Real + mock both implement it. */
export interface GuestAdminApi {
  getListings(params: PageParams): Promise<Page<Listing>>;
  getListing(id: string): Promise<Listing | undefined>;
  getBookings(params: PageParams): Promise<Page<Booking>>;
  getBooking(id: string): Promise<Booking | undefined>;
  acceptBooking(id: string): Promise<void>;
  declineBooking(id: string): Promise<void>;
  getChats(params: PageParams): Promise<Page<ChatSummary>>;
  getMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, text: string): Promise<void>;
  markChatRead(chatId: string): Promise<void>;
  getStats(): Promise<DashboardStats>;
}
