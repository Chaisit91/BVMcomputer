/**
 * How the frontend talks to the backend:
 * - "live": always call the backend; failures surface as errors in the UI.
 * - "auto": call the backend, but fall back to the bundled mock data when it
 *   can't be reached at all (not running, CORS, offline). Real HTTP errors
 *   (400/401/404/500 ...) are never masked by mocks.
 * - "mock": never touch the network — handy for UI work without a backend.
 *
 * Defaults to "auto" in dev and "live" in production builds, so a deployed
 * site never silently shows fake data or accepts fake orders.
 */
export type ApiMode = 'mock' | 'auto' | 'live';

function resolveMode(value: string | undefined): ApiMode {
  if (value === 'mock' || value === 'auto' || value === 'live') return value;
  return import.meta.env.DEV ? 'auto' : 'live';
}

export const API_MODE: ApiMode = resolveMode(import.meta.env.VITE_API_MODE);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const API_TIMEOUT_MS = 8000;
