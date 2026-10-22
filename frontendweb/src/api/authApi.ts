import { apiGet, apiPost, mockDelay, withMockFallback } from './request';
import { loadSession } from './authSession';
import type { AuthUser, LoginRequest, LoginResponse } from '../types/api';

/** POST /auth/login — mock accepts any email/password so the UI can be built without a backend. */
export function login(request: LoginRequest): Promise<LoginResponse> {
  return withMockFallback(
    'POST /auth/login',
    () => apiPost<LoginResponse>('/auth/login', request),
    async () => {
      await mockDelay(500);
      return {
        user: { id: 'mock-user', email: request.email, name: request.email.split('@')[0] },
        token: 'mock-token',
      };
    },
  );
}

/** POST /auth/logout — invalidates the server session/cookie. */
export function logout(): Promise<void> {
  return withMockFallback(
    'POST /auth/logout',
    () => apiPost<void>('/auth/logout'),
    () => undefined,
  );
}

/** GET /auth/me — the logged-in user, used to restore a session on page load. */
export function getCurrentUser(): Promise<AuthUser> {
  return withMockFallback(
    'GET /auth/me',
    () => apiGet<AuthUser>('/auth/me'),
    () => {
      const session = loadSession();
      if (!session) throw new Error('No mock session');
      return session.user;
    },
  );
}
