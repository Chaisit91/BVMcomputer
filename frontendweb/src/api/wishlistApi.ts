import { loadSession } from './authSession';
import { apiDelete, apiGet, apiPost, mockDelay, withMockFallback } from './request';
import type { ProductCategorySlug } from '../data/catalog';
import type { AccountDataSource, WishlistEntry } from '../types/api';

/*
 * Wishlist endpoints (all require the signed-in customer's session/token):
 *
 *   GET    /wishlist                         -> WishlistEntry[]
 *   POST   /wishlist                         -> WishlistEntry   body: { category, productId }
 *   DELETE /wishlist/:category/:productId    -> 204
 *
 * When the backend can't be reached (API_MODE auto/mock) the list is kept in this browser's
 * localStorage, per signed-in user, and every result is flagged source 'demo' so the page can
 * say it isn't synced to an account.
 */

export interface WishlistResult<T> {
  data: T;
  source: AccountDataSource;
}

function demoStorageKey(): string {
  return `maxcom.wishlist.${loadSession()?.user.id ?? 'guest'}`;
}

function readDemoList(): WishlistEntry[] {
  try {
    const raw = localStorage.getItem(demoStorageKey());
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as WishlistEntry[]) : [];
  } catch {
    return [];
  }
}

function writeDemoList(entries: WishlistEntry[]): void {
  try {
    localStorage.setItem(demoStorageKey(), JSON.stringify(entries));
  } catch {
    // Storage blocked or full — the change still applies for this visit.
  }
}

export function getWishlist(): Promise<WishlistResult<WishlistEntry[]>> {
  return withMockFallback<WishlistResult<WishlistEntry[]>>(
    'GET /wishlist',
    async () => ({ data: await apiGet<WishlistEntry[]>('/wishlist'), source: 'live' }),
    async () => {
      await mockDelay();
      return { data: readDemoList(), source: 'demo' };
    },
  );
}

export function addWishlistItem(category: ProductCategorySlug, productId: string): Promise<WishlistResult<WishlistEntry>> {
  return withMockFallback<WishlistResult<WishlistEntry>>(
    'POST /wishlist',
    async () => ({ data: await apiPost<WishlistEntry>('/wishlist', { category, productId }), source: 'live' }),
    () => {
      const list = readDemoList();
      const existing = list.find((entry) => entry.category === category && entry.productId === productId);
      if (existing) return { data: existing, source: 'demo' };
      const entry: WishlistEntry = { category, productId, addedAt: new Date().toISOString() };
      writeDemoList([entry, ...list]);
      return { data: entry, source: 'demo' };
    },
  );
}

export function removeWishlistItem(category: ProductCategorySlug, productId: string): Promise<WishlistResult<null>> {
  return withMockFallback<WishlistResult<null>>(
    'DELETE /wishlist',
    async () => {
      await apiDelete(`/wishlist/${encodeURIComponent(category)}/${encodeURIComponent(productId)}`);
      return { data: null, source: 'live' };
    },
    () => {
      writeDemoList(readDemoList().filter((entry) => !(entry.category === category && entry.productId === productId)));
      return { data: null, source: 'demo' };
    },
  );
}
