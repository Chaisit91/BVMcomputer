import { api } from './axiosClient';
import { API_MODE } from './config';
import { toApiError } from './apiError';

// The backend returns the resource itself as the JSON body (no `{ data: ... }`
// envelope). If that contract changes, these two helpers are the only place to adapt.
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<T>(url, body);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<T>(url, body);
  return data;
}

// In "auto" mode, once the backend has proven unreachable, skip straight to mocks
// for the rest of the session instead of waiting on a failed request every time.
let backendUnreachable = false;
const warnedEndpoints = new Set<string>();

/**
 * Run a real backend call, falling back to `mock` according to API_MODE (see config.ts).
 * `label` only feeds the one-time console warning, e.g. "GET /products".
 */
export async function withMockFallback<T>(label: string, call: () => Promise<T>, mock: () => T | Promise<T>): Promise<T> {
  if (API_MODE === 'mock' || (API_MODE === 'auto' && backendUnreachable)) {
    return mock();
  }

  try {
    return await call();
  } catch (error) {
    const apiError = toApiError(error);
    if (API_MODE === 'auto' && apiError.isNetworkError) {
      backendUnreachable = true;
      if (!warnedEndpoints.has(label)) {
        warnedEndpoints.add(label);
        console.warn(`[api] Backend unreachable — using mock data for ${label}`);
      }
      return mock();
    }
    throw apiError;
  }
}

/** Simulated latency for mocks, so loading states are visible during UI work. */
export function mockDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
