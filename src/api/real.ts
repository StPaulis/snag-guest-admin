/**
 * GuestAdminApi implementation backed by EXISTING snag-api admin endpoints.
 *
 * ⚠ Integration notes (see docs/API_MAPPING.md):
 * - snag-api has no tenant scoping yet — we scope client-side by
 *   tenant.hostUserId (the host user owning this partner's posts).
 * - Requires a Firebase account whose token has the `roles: ['admin']` custom claim.
 * - When dedicated /admin-guest endpoints land, only THIS file should change.
 */
import { api } from './http';
import { tenant } from '../tenant';
import {
  AgreementStatus,
  MessageType,
  PostType,
  type ApiAgreement,
  type ApiChatMessage,
  type ApiChatRoom,
  type ApiPost,
  type PagedDto,
} from './types';
import { toBooking, toChatSummary, toListing, toMessage } from './adapters';
import type { Booking, ChatSummary, GuestAdminApi, Listing, Message } from './models';

const PAGE = { page: 1, limit: 300 };

async function fetchPosts(): Promise<ApiPost[]> {
  const res = await api<PagedDto<ApiPost>>('/admin/posts', {
    query: { ...PAGE, type: PostType.OFFERING, userId: tenant.hostUserId },
  });
  return res.data;
}

async function fetchAgreements(): Promise<ApiAgreement[]> {
  const res = await api<PagedDto<ApiAgreement>>('/admin/agreements', {
    query: { ...PAGE, userId: tenant.hostUserId },
  });
  return res.data;
}

export const realApi: GuestAdminApi = {
  async getListings(): Promise<Listing[]> {
    return (await fetchPosts()).map(toListing);
  },

  async getListing(id: string): Promise<Listing | undefined> {
    const post = await api<ApiPost>(`/admin/posts/${id}`);
    return post ? toListing(post) : undefined;
  },

  async getBookings(): Promise<Booking[]> {
    return (await fetchAgreements()).map((ag) => toBooking(ag));
  },

  async getBooking(id: string): Promise<Booking | undefined> {
    const ag = await api<ApiAgreement>(`/admin/agreements/${id}`);
    return ag ? toBooking(ag) : undefined;
  },

  async acceptBooking(id: string): Promise<void> {
    await api(`/admin/agreements/${id}`, {
      method: 'PUT',
      body: { status: AgreementStatus.PAID },
    });
  },

  async declineBooking(id: string): Promise<void> {
    await api(`/admin/agreements/${id}`, {
      method: 'PUT',
      body: { status: AgreementStatus.DECLINED },
    });
  },

  async getChats(): Promise<ChatSummary[]> {
    const res = await api<PagedDto<ApiChatRoom>>('/admin/chat-rooms', {
      query: { ...PAGE, memberId: tenant.hostUserId },
    });
    return res.data.map((room) => toChatSummary(room, tenant.hostUserId));
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const res = await api<PagedDto<ApiChatMessage>>('/admin/chat-messages', {
      query: { ...PAGE, chatRoomId: chatId, sort: 'createdAt', isSortAscending: true },
    });
    return res.data.map((m) => toMessage(m, tenant.hostUserId));
  },

  async sendMessage(chatId: string, text: string): Promise<void> {
    await api('/admin/chat-messages', {
      method: 'POST',
      body: {
        chatRoomId: chatId,
        userId: tenant.hostUserId,
        text,
        type: MessageType.TEXT,
      },
    });
  },

  async markChatRead(): Promise<void> {
    // No admin endpoint for read-receipts yet — no-op until /admin-guest exists.
  },
};
