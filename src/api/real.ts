/**
 * GuestAdminApi implementation backed by the dedicated snag-api /admin-guest module.
 *
 * Integration notes (see docs/API_MAPPING.md):
 * - Tenancy is server-side: the caller's Firebase token carries the `guest-admin`
 *   role scoped to a company (granted via POST /admin/auth/guest-admin/:id), and
 *   every /admin-guest endpoint filters to that company. No client-side scoping.
 * - Chat sender/perspective: the company side of a room is detected from
 *   chatUsers[].user.companyId (adapters.ts). Replies are sent as the room's
 *   company-side participant (POST /admin-guest/chat-messages requires a
 *   `userId` that belongs to the company — it is not inferred from the token).
 *   tenant.hostUserId remains only as a legacy fallback.
 */
import { api } from './http';
import { tenant } from '../tenant';
import {
  MessageType,
  PostType,
  type ApiAgreement,
  type ApiChatMessage,
  type ApiChatRoom,
  type ApiGuestStats,
  type ApiPost,
  type PagedDto,
} from './types';
import {
  toBooking,
  toChatSummary,
  toDashboardStats,
  toListing,
  toMessage,
} from './adapters';
import type {
  Booking,
  ChatSummary,
  DashboardStats,
  GuestAdminApi,
  Listing,
  Message,
  Page,
  PageParams,
} from './models';

export const realApi: GuestAdminApi = {
  async getListings({ page, limit }: PageParams): Promise<Page<Listing>> {
    const res = await api<PagedDto<ApiPost>>('/admin-guest/posts', {
      query: { page, limit, type: PostType.OFFERING },
    });
    return { items: res.data.map(toListing), total: res.total };
  },

  async getListing(id: string): Promise<Listing | undefined> {
    const post = await api<ApiPost>(`/admin-guest/posts/${id}`);
    return post ? toListing(post) : undefined;
  },

  async getBookings({ page, limit }: PageParams): Promise<Page<Booking>> {
    const res = await api<PagedDto<ApiAgreement>>('/admin-guest/agreements', {
      query: { page, limit },
    });
    return { items: res.data.map((ag) => toBooking(ag)), total: res.total };
  },

  async getBooking(id: string): Promise<Booking | undefined> {
    const ag = await api<ApiAgreement>(`/admin-guest/agreements/${id}`);
    return ag ? toBooking(ag) : undefined;
  },

  async acceptBooking(id: string): Promise<void> {
    await api(`/admin-guest/agreements/${id}/accept`, { method: 'POST' });
  },

  async declineBooking(id: string): Promise<void> {
    await api(`/admin-guest/agreements/${id}/decline`, { method: 'POST' });
  },

  async getChats({ page, limit }: PageParams): Promise<Page<ChatSummary>> {
    const res = await api<PagedDto<ApiChatRoom>>('/admin-guest/chat-rooms', {
      query: { page, limit },
    });
    return {
      items: res.data.map((room) => toChatSummary(room, tenant.hostUserId)),
      total: res.total,
    };
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const res = await api<PagedDto<ApiChatMessage>>('/admin-guest/chat-messages', {
      query: { page: 1, limit: 300, chatRoomId: chatId, sort: 'createdAt', isSortAscending: true },
    });
    return res.data.map((m) => toMessage(m, tenant.hostUserId));
  },

  async sendMessage(chatId: string, text: string, asUserId?: string): Promise<void> {
    const userId = asUserId ?? tenant.hostUserId;
    if (!userId) {
      throw new Error('No company member found in this chat room to reply as');
    }
    await api('/admin-guest/chat-messages', {
      method: 'POST',
      body: {
        chatRoomId: chatId,
        userId,
        text,
        type: MessageType.TEXT,
      },
    });
  },

  async markChatRead(chatId: string): Promise<void> {
    await api(`/admin-guest/chat-rooms/${chatId}/read`, { method: 'POST' });
  },

  async getStats(): Promise<DashboardStats> {
    return toDashboardStats(await api<ApiGuestStats>('/admin-guest/stats'));
  },
};
