/**
 * In-memory GuestAdminApi — mirrors the design-prototype dataset
 * (6 listings, 3 pending requests, matching chats). Used when VITE_USE_MOCKS=true.
 */
import type {
  Booking,
  ChatSummary,
  GuestAdminApi,
  Listing,
  Message,
  Page,
  PageParams,
} from './models';

const listings: Listing[] = [
  { id: 'l1', title: 'Sunny 1BR in Williamsburg', area: 'Williamsburg, Brooklyn', price: 2850, status: 'active', beds: 1, baths: 1, window: 'Jun 1 – Aug 31', bookingCount: 3, desc: 'Bright, plant-filled one-bedroom on a quiet tree-lined street. Two blocks from the Bedford L, with a private roof deck shared by two units.', amenities: ['wifi', 'laundry in unit', 'dishwasher', 'roof deck', 'pets ok'], photos: [] },
  { id: 'l2', title: 'Studio near Domino Park', area: 'South Williamsburg, Brooklyn', price: 2400, status: 'booked', beds: 0, baths: 1, window: 'Jul 15 – Dec 15', bookingCount: 2, desc: 'Compact, efficient studio with skyline views and morning light. Steps from Domino Park and the ferry.', amenities: ['wifi', 'elevator', 'gym', 'doorman'], photos: [] },
  { id: 'l3', title: 'Loft 2BR on Kent Ave', area: 'Williamsburg, Brooklyn', price: 4200, status: 'active', beds: 2, baths: 2, window: 'Jun 15 – Sep 30', bookingCount: 4, desc: 'True loft with 12-ft ceilings, exposed brick, and a chef kitchen. Ideal for two interns sharing the summer.', amenities: ['wifi', 'laundry in unit', 'dishwasher', 'exposed brick', 'bike storage'], photos: [] },
  { id: 'l4', title: 'Cozy room in Greenpoint', area: 'Greenpoint, Brooklyn', price: 1650, status: 'active', beds: 1, baths: 1, window: 'flexible', bookingCount: 1, desc: 'Furnished private room in a friendly 3BR share. Quiet block near McGolrick Park; two easygoing roommates.', amenities: ['wifi', 'furnished', 'shared kitchen', 'pets ok'], photos: [] },
  { id: 'l5', title: '1BR with balcony, LES', area: 'Lower East Side, Manhattan', price: 3300, status: 'paused', beds: 1, baths: 1, window: 'Aug 1 – Jan 31', bookingCount: 0, desc: 'Renovated one-bedroom with a private balcony over Orchard Street. Currently paused while we repaint.', amenities: ['wifi', 'balcony', 'dishwasher', 'elevator'], photos: [] },
  { id: 'l6', title: 'Bright 2BR in Bushwick', area: 'Bushwick, Brooklyn', price: 3100, status: 'active', beds: 2, baths: 1, window: 'Jun 1 – Nov 30', bookingCount: 2, desc: 'Sun-drenched corner unit with oversized windows, five minutes from the Jefferson L. Great cafés downstairs.', amenities: ['wifi', 'laundry in building', 'roof access', 'furnished'], photos: [] },
];

const bookings: Booking[] = [
  { id: 'a1', ref: '#SN-4821', listingId: 'l2', listingTitle: 'Studio near Domino Park', renter: { id: 'u1', name: 'Maya Chen', firstName: 'Maya', idVerified: true, instagram: 'maya.chen', linkedin: 'mayachen' }, status: 'paid', moveIn: 'Jul 15, 2026', moveOut: 'Dec 15, 2026', months: 5, monthly: 2400, subtotal: 12000, fee: 600, total: 12600, chatId: 'c1' },
  { id: 'a2', ref: '#SN-4835', listingId: 'l1', listingTitle: 'Sunny 1BR in Williamsburg', renter: { id: 'u2', name: 'Jordan Alvarez', firstName: 'Jordan', idVerified: true, instagram: 'jordy.alv', linkedin: 'jordanalvarez' }, status: 'requested', moveIn: 'Aug 1, 2026', moveOut: 'Oct 31, 2026', months: 3, monthly: 2850, subtotal: 8550, fee: 428, total: 8978, chatId: 'c2' },
  { id: 'a3', ref: '#SN-4840', listingId: 'l3', listingTitle: 'Loft 2BR on Kent Ave', renter: { id: 'u3', name: 'Priya Raman', firstName: 'Priya', idVerified: false, instagram: 'priya.r' }, status: 'requested', moveIn: 'Sep 1, 2026', moveOut: 'Dec 1, 2026', months: 3, monthly: 4200, subtotal: 12600, fee: 630, total: 13230, chatId: 'c3' },
  { id: 'a4', ref: '#SN-4812', listingId: 'l6', listingTitle: 'Bright 2BR in Bushwick', renter: { id: 'u4', name: 'Sam Okafor', firstName: 'Sam', idVerified: true, linkedin: 'samokafor' }, status: 'paid', moveIn: 'Jun 1, 2026', moveOut: 'Nov 30, 2026', months: 6, monthly: 3100, subtotal: 18600, fee: 930, total: 19530, chatId: 'c4' },
  { id: 'a5', ref: '#SN-4788', listingId: 'l4', listingTitle: 'Cozy room in Greenpoint', renter: { id: 'u5', name: 'Lena Kovács', firstName: 'Lena', idVerified: true, instagram: 'lenak' }, status: 'cancelled', moveIn: 'Jun 15, 2026', moveOut: 'Aug 15, 2026', months: 2, monthly: 1650, subtotal: 3300, fee: 165, total: 3465, chatId: 'c5' },
  { id: 'a6', ref: '#SN-4851', listingId: 'l1', listingTitle: 'Sunny 1BR in Williamsburg', renter: { id: 'u6', name: 'Diego Fernández', firstName: 'Diego', idVerified: false, instagram: 'diegofdz' }, status: 'requested', moveIn: 'Sep 15, 2026', moveOut: 'Mar 15, 2027', months: 6, monthly: 2850, subtotal: 17100, fee: 855, total: 17955, chatId: 'c6' },
];

const chats: ChatSummary[] = [
  { id: 'c2', agId: 'a2', name: 'Jordan Alvarez', firstName: 'Jordan', listing: 'Sunny 1BR in Williamsburg', lastMessage: 'Just sent the booking request — really excited about the roof deck!', time: '9:41 AM', unread: 2 },
  { id: 'c3', agId: 'a3', name: 'Priya Raman', firstName: 'Priya', listing: 'Loft 2BR on Kent Ave', lastMessage: 'Would you consider a slightly earlier move-in, like Aug 28?', time: 'Yesterday', unread: 1 },
  { id: 'c1', agId: 'a1', name: 'Maya Chen', firstName: 'Maya', listing: 'Studio near Domino Park', lastMessage: 'Perfect, see you on the 15th. Thanks again!', time: 'Yesterday', unread: 0 },
  { id: 'c6', agId: 'a6', name: 'Diego Fernández', firstName: 'Diego', listing: 'Sunny 1BR in Williamsburg', lastMessage: 'My company confirmed the NYC rotation, so 6 months works great.', time: 'Tue', unread: 0 },
  { id: 'c4', agId: 'a4', name: 'Sam Okafor', firstName: 'Sam', listing: 'Bright 2BR in Bushwick', lastMessage: 'The AC filter arrived, installed it this morning 👍', time: 'Mon', unread: 0 },
  { id: 'c5', agId: 'a5', name: 'Lena Kovács', firstName: 'Lena', listing: 'Cozy room in Greenpoint', lastMessage: 'Sorry it fell through — maybe next summer!', time: 'Jun 30', unread: 0 },
];

const threads: Record<string, Message[]> = {
  c1: [
    { id: 'm1', from: 'them', text: 'Hi! Is the studio still available for mid-July?', time: 'Jul 2' },
    { id: 'm2', from: 'me', text: 'Hi Maya — yes it is! Happy to do a video tour this week.', time: 'Jul 2' },
    { id: 'm3', from: 'them', text: 'Booked and paid ✅', time: 'Jul 8' },
    { id: 'm4', from: 'them', text: 'Perfect, see you on the 15th. Thanks again!', time: 'Yesterday' },
  ],
  c2: [
    { id: 'm1', from: 'them', text: 'Hey! I love the Williamsburg 1BR. Is the roof deck shared?', time: '9:12 AM' },
    { id: 'm2', from: 'me', text: 'Hi Jordan! Shared with just one other unit — it rarely feels busy.', time: '9:20 AM' },
    { id: 'm3', from: 'them', text: 'Just sent the booking request — really excited about the roof deck!', time: '9:41 AM' },
  ],
  c3: [
    { id: 'm1', from: 'them', text: 'Hi, the Kent Ave loft looks perfect for my sister and me.', time: 'Mon' },
    { id: 'm2', from: 'me', text: 'It is a great space — 12ft ceilings, tons of light. When would you move in?', time: 'Mon' },
    { id: 'm3', from: 'them', text: 'Would you consider a slightly earlier move-in, like Aug 28?', time: 'Yesterday' },
  ],
  c4: [
    { id: 'm1', from: 'them', text: 'The AC filter arrived, installed it this morning 👍', time: 'Mon' },
  ],
  c5: [
    { id: 'm1', from: 'them', text: 'Sorry it fell through — maybe next summer!', time: 'Jun 30' },
  ],
  c6: [
    { id: 'm1', from: 'them', text: 'My company confirmed the NYC rotation, so 6 months works great.', time: 'Tue' },
  ],
};

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

function paginate<T>(all: T[], { page, limit }: PageParams): Page<T> {
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), total: all.length };
}

export const mockApi: GuestAdminApi = {
  async getListings(params) {
    await delay();
    return paginate(listings, params);
  },
  async getListing(id) {
    await delay();
    return listings.find((l) => l.id === id);
  },
  async getBookings(params) {
    await delay();
    return paginate(bookings, params);
  },
  async getBooking(id) {
    await delay();
    return bookings.find((b) => b.id === id);
  },
  async acceptBooking(id) {
    await delay();
    const b = bookings.find((x) => x.id === id);
    if (b) b.status = 'paid';
  },
  async declineBooking(id) {
    await delay();
    const b = bookings.find((x) => x.id === id);
    if (b) b.status = 'cancelled';
  },
  async getChats(params) {
    await delay();
    return paginate(chats, params);
  },
  async getMessages(chatId) {
    await delay();
    return [...(threads[chatId] ?? [])];
  },
  async sendMessage(chatId, text) {
    await delay(60);
    const thread = (threads[chatId] ??= []);
    thread.push({ id: `m${Date.now()}`, from: 'me', text, time: 'now' });
    const c = chats.find((x) => x.id === chatId);
    if (c) {
      c.lastMessage = text;
      c.time = 'now';
    }
  },
  async markChatRead(chatId) {
    const c = chats.find((x) => x.id === chatId);
    if (c) c.unread = 0;
  },
  async getStats() {
    await delay();
    return {
      activeListings: listings.filter((l) => l.status === 'active').length,
      pendingRequests: bookings.filter((b) => b.status === 'requested').length,
      monthRevenue: bookings
        .filter((b) => b.status === 'paid')
        .reduce((s, b) => s + b.monthly, 0),
      unreadMessages: chats.reduce((s, c) => s + c.unread, 0),
    };
  },
};
