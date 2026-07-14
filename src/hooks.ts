import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { guestAdminApi } from './api';
import type { Page, PageParams } from './api/models';

/** Page size for every paginated list. The app loads more pages on demand. */
export const DEFAULT_LIMIT = 30;

export const keys = {
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  chats: ['chats'] as const,
  messages: (chatId: string) => ['chats', chatId, 'messages'] as const,
  stats: ['stats'] as const,
};

/**
 * Real pagination over a `{ items, total }` endpoint. Loads page 1 (30 items) up
 * front and exposes `fetchMore`/`hasMore` so the UI can append further pages.
 */
function usePaginated<T>(
  key: readonly unknown[],
  fetcher: (params: PageParams) => Promise<Page<T>>,
  options: { refetchInterval?: number } = {},
) {
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetcher({ page: pageParam, limit: DEFAULT_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    refetchInterval: options.refetchInterval,
  });
  return {
    items: (query.data?.pages ?? []).flatMap((p) => p.items),
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: query.hasNextPage,
    fetchMore: query.fetchNextPage,
    isFetchingMore: query.isFetchingNextPage,
  };
}

export const useListings = () =>
  usePaginated(keys.listings, (p) => guestAdminApi.getListings(p));

export const useBookings = () =>
  usePaginated(keys.bookings, (p) => guestAdminApi.getBookings(p));

export const useChats = () =>
  usePaginated(keys.chats, (p) => guestAdminApi.getChats(p), { refetchInterval: 30_000 });

export const useListing = (id: string) =>
  useQuery({ queryKey: keys.listing(id), queryFn: () => guestAdminApi.getListing(id) });

export const useBooking = (id: string, options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: keys.booking(id),
    queryFn: () => guestAdminApi.getBooking(id),
    enabled: (options.enabled ?? true) && !!id,
  });

export const useMessages = (chatId: string) =>
  useQuery({
    queryKey: keys.messages(chatId),
    queryFn: () => guestAdminApi.getMessages(chatId),
    refetchInterval: 15_000,
  });

export const useStats = () =>
  useQuery({ queryKey: keys.stats, queryFn: () => guestAdminApi.getStats() });

export const useUnreadCount = () => {
  const { items } = useChats();
  return items.reduce((sum, c) => sum + c.unread, 0);
};

/** accept/decline — reflected everywhere (list, detail, dashboard, chat banner) via invalidation */
export function useBookingDecision() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: keys.bookings });
    void qc.invalidateQueries({ queryKey: keys.listings });
    void qc.invalidateQueries({ queryKey: keys.chats });
    void qc.invalidateQueries({ queryKey: keys.stats });
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

/** `asUserId` — the room's company-side participant the reply is sent as (chat.hostId). */
export function useSendMessage(chatId: string, asUserId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => guestAdminApi.sendMessage(chatId, text, asUserId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.messages(chatId) });
      void qc.invalidateQueries({ queryKey: keys.chats });
    },
  });
}
