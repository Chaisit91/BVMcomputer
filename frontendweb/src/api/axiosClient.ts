import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { toApiError } from './apiError';
import { clearSession, getStoredToken } from './authSession';

// Base URL is read from the environment so each deployment can point at its
// own backend. `withCredentials` is on so cookie/session auth works across
// origins; a bearer token is also attached when the backend issued one.
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorized: (() => void) | null = null;

/**
 * Registered by the store (not imported here) to avoid a store <-> client import
 * cycle — called when an authenticated request comes back 401.
 */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
    // A 401 from the login call itself just means wrong credentials, not an expired session.
    if (apiError.status === 401 && !url.startsWith('/auth/login')) {
      clearSession();
      onUnauthorized?.();
    }
    return Promise.reject(apiError);
  },
);
