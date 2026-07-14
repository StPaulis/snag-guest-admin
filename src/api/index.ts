import type { GuestAdminApi } from './models';
import { USE_MOCKS } from './config';
import { mockApi } from './mock';
import { realApi } from './real';

export { USE_MOCKS };

/** The one data-access object pages import. Swap real/mock via VITE_USE_MOCKS. */
export const guestAdminApi: GuestAdminApi = USE_MOCKS ? mockApi : realApi;

export * from './models';
export * from './adapters';
