import { useEffect, useState } from 'react';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { guestAdminApi } from './api';
import { DEFAULT_LIMIT } from './api/models';
import type { Page, PageParams } from './api/models';

export { DEFAULT_LIMIT };

export const keys = {
  listings: ['listings'] as const,
  // Searches nest under the list prefix so decision invalidations cover them too.
  listingSearch: (search: string) => ['listings', { search }] as const,
  listing: (id: string) => ['listings', id] as const,
  bookings: ['bookings'] as const,
  bookingSearch: (search: string) => ['bookings', { search }] as const,
  booking: (id: string) => ['bookings', id] as const,
  chats: ['chats'] as const,
  messages: (chatId: string) => ['chats', chatId, 'messages'] as const,
  stats: ['stats'] as const,
};

/** Debounce a fast-changing value (e.g. a search input) before it hits the server. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Real pagination over a `{ items, total }` endpoint. Loads page 1 (30 items) up
 * front and exposes `fetchMore`/`hasMore` so the UI can append further pages.
 */
function usePaginated<T>(
  key: readonly unknown[],
  fetcher: (params: PageParams) => Promise<Page<T>>,
  options: { refetchInterval?: number; keepPrevious?: boolean } = {},
) {
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetcher({ page: pageParam, limit: DEFAULT_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // An empty page means the list is exhausted even if `total` says otherwise
      // (e.g. stale/overstated totals) — stop rather than offer dead "load more".
      if (lastPage.items.length === 0) return undefined;
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    refetchInterval: options.refetchInterval,
    // Keeps the previous list on screen while a new search key loads.
    placeholderData: options.keepPrevious ? keepPreviousData : undefined,
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

export const useListings = (search = '') =>
  usePaginated(
    keys.listingSearch(search.trim()),
    (p) => guestAdminApi.getListings({ ...p, search: search.trim() }),
    { keepPrevious: true },
  );

export const useBookings = (search = '') =>
  usePaginated(
    keys.bookingSearch(search.trim()),
    (p) => guestAdminApi.getBookings({ ...p, search: search.trim() }),
    { keepPrevious: true },
  );

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

/**
 * Chat thread pagination: page 1 is the newest 30 messages and `fetchMore`
 * loads progressively older ones, so `hasMore` means "has older messages".
 * `items` is reversed into chronological order for display.
 */
export function useMessages(chatId: string) {
  const query = usePaginated(
    keys.messages(chatId),
    (p) => guestAdminApi.getMessages(chatId, p),
    { refetchInterval: 15_000 },
  );
  return { ...query, items: [...query.items].reverse() };
}

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
