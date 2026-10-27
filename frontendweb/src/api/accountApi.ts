import { api } from './axiosClient';
import { loadSession } from './authSession';
import { apiGet, apiPut, mockDelay, withMockFallback } from './request';
import type { AccountDataSource, AccountSummary, UpdateProfileRequest, UserProfile } from '../types/api';

/*
 * Account endpoints (all require the signed-in customer's session/token):
 *
 *   GET  /account/profile          -> UserProfile
 *   PUT  /account/profile          -> UserProfile      body: UpdateProfileRequest
 *   POST /account/profile/avatar   -> { avatarUrl }    multipart/form-data, field "avatar" (JPG/PNG ≤ 5 MB)
 *   GET  /account/summary          -> AccountSummary   { orders, wishlist, shipping, pendingPayment }
 *
 * When the backend can't be reached (API_MODE auto/mock) each call resolves with source 'demo'.
 * Demo results are never presented as saved — the UI says so explicitly.
 */

export interface ProfileResult {
  profile: UserProfile;
  source: AccountDataSource;
}

/** Demo profile built only from the signed-in session — no invented personal data. */
function sessionProfile(): UserProfile {
  const user = loadSession()?.user;
  const [firstName = '', ...rest] = (user?.name ?? '').trim().split(/\s+/);
  return {
    id: user?.id ?? '',
    email: user?.email ?? '',
    firstName,
    lastName: rest.join(' '),
    phone: '',
  };
}

export function getProfile(): Promise<ProfileResult> {
  return withMockFallback<ProfileResult>(
    'GET /account/profile',
    async () => ({ profile: await apiGet<UserProfile>('/account/profile'), source: 'live' }),
    async () => {
      await mockDelay();
      return { profile: sessionProfile(), source: 'demo' };
    },
  );
}

export function updateProfile(current: UserProfile, changes: UpdateProfileRequest): Promise<ProfileResult> {
  return withMockFallback<ProfileResult>(
    'PUT /account/profile',
    async () => ({ profile: await apiPut<UserProfile>('/account/profile', changes), source: 'live' }),
    async () => {
      await mockDelay(600);
      // Demo: echo the form back, flagged as not saved — the slice doesn't store it as the profile.
      return { profile: { ...current, ...changes }, source: 'demo' };
    },
  );
}

export function uploadAvatar(file: File): Promise<{ avatarUrl: string | null; source: AccountDataSource }> {
  return withMockFallback<{ avatarUrl: string | null; source: AccountDataSource }>(
    'POST /account/profile/avatar',
    async () => {
      const form = new FormData();
      form.append('avatar', file);
      const { data } = await api.post<{ avatarUrl: string }>('/account/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { avatarUrl: data.avatarUrl, source: 'live' as const };
    },
    async () => {
      await mockDelay(600);
      return { avatarUrl: null, source: 'demo' as const };
    },
  );
}

/**
 * GET /account/summary — order / wishlist / shipping / unpaid counts for the account page.
 * In demo there's no order or wishlist system to count from, so `summary` is null — the UI
 * shows "ไม่มีข้อมูล" rather than a 0 nobody has confirmed.
 */
export function getAccountSummary(): Promise<{ summary: AccountSummary | null; source: AccountDataSource }> {
  return withMockFallback<{ summary: AccountSummary | null; source: AccountDataSource }>(
    'GET /account/summary',
    async () => ({ summary: await apiGet<AccountSummary>('/account/summary'), source: 'live' }),
    () => ({ summary: null, source: 'demo' }),
  );
}
