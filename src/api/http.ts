import { getIdToken } from '../auth/firebase';

const BASE_URL: string = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Fetch wrapper for snag-api admin endpoints.
 * - Sends `Authorization: Bearer <firebase id token>` (token must carry roles:['admin'] custom claim)
 * - snag-api uses a strict ValidationPipe (whitelist + forbidNonWhitelisted):
 *   never send params that aren't in the endpoint's DTO.
 */
export async function api<T>(
  path: string,
  options: { method?: string; query?: Record<string, unknown>; body?: unknown } = {},
): Promise<T> {
  const token = await getIdToken();
  const url = new URL(BASE_URL + path);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
