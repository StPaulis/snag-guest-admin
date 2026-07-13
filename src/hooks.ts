import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guestAdminApi } from './api';

export const keys = {
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  chats: ['chats'] as const,
  messages: (chatId: string) => ['chats', chatId, 'messages'] as const,
};

export const useListings = () =>
  useQuery({ queryKey: keys.listings, queryFn: () => guestAdminApi.getListings() });

export const useListing = (id: string) =>
  useQuery({ queryKey: keys.listing(id), queryFn: () => guestAdminApi.getListing(id) });

export const useBookings = () =>
  useQuery({ queryKey: keys.bookings, queryFn: () => guestAdminApi.getBookings() });

export const useBooking = (id: string) =>
  useQuery({ queryKey: keys.booking(id), queryFn: () => guestAdminApi.getBooking(id) });

export const useChats = () =>
  useQuery({ queryKey: keys.chats, queryFn: () => guestAdminApi.getChats(), refetchInterval: 30_000 });

export const useMessages = (chatId: string) =>
  useQuery({
    queryKey: keys.messages(chatId),
    queryFn: () => guestAdminApi.getMessages(chatId),
    refetchInterval: 15_000,
  });

export const useUnreadCount = () => {
  const { data } = useChats();
  return (data ?? []).reduce((sum, c) => sum + c.unread, 0);
};

/** accept/decline — reflected everywhere (list, detail, dashboard, chat banner) via invalidation */
export function useBookingDecision() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: keys.bookings });
    void qc.invalidateQueries({ queryKey: keys.listings });
    void qc.invalidateQueries({ queryKey: keys.chats });
  };
  const accept = useMutation({
    mutationFn: (id: string) => guestAdminApi.acceptBooking(id),
    onSuccess: invalidate,
  });
  const decline = useMutation({
    mutationFn: (id: string) => guestAdminApi.declineBooking(id),
    onSuccess: invalidate,
  });
  return { accept, decline };
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => guestAdminApi.sendMessage(chatId, text),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.messages(chatId) });
      void qc.invalidateQueries({ queryKey: keys.chats });
    },
  });
}
