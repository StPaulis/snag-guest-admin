import type { GuestAdminApi } from './models';
import { mockApi } from './mock';
import { realApi } from './real';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_API_URL;

/** The one data-access object pages import. Swap real/mock via VITE_USE_MOCKS. */
export const guestAdminApi: GuestAdminApi = USE_MOCKS ? mockApi : realApi;

export * from './models';
export * from './adapters';
