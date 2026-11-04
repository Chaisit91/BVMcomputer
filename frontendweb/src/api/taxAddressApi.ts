import { loadSession } from './authSession';
import { apiDelete, apiGet, apiPost, apiPut, mockDelay, withMockFallback } from './request';
import type { AccountDataSource, TaxAddress, TaxAddressInput } from '../types/api';

/*
 * Tax-invoice address endpoints (all require the signed-in customer's session/token).
 * Every write returns the customer's full, updated list, so the server stays the one place
 * that enforces "exactly one default":
 *
 *   GET    /account/tax-addresses                 -> TaxAddress[]
 *   POST   /account/tax-addresses                 -> TaxAddress[]   body: TaxAddressInput
 *   PUT    /account/tax-addresses/:id             -> TaxAddress[]   body: TaxAddressInput
 *   PUT    /account/tax-addresses/:id/default     -> TaxAddress[]
 *   DELETE /account/tax-addresses/:id             -> TaxAddress[]
 *
 * When the backend can't be reached (API_MODE auto/mock) the list is kept in this browser's
 * localStorage, per signed-in user, and every result is flagged source 'demo'.
 */

export interface TaxAddressListResult {
  addresses: TaxAddress[];
  source: AccountDataSource;
}

function demoStorageKey(): string {
  return `maxcom.tax-addresses.${loadSession()?.user.id ?? 'guest'}`;
}

function readDemoList(): TaxAddress[] {
  try {
    const raw = localStorage.getItem(demoStorageKey());
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as TaxAddress[]) : [];
  } catch {
    return [];
  }
}

/** Same rule the backend applies: one default — the requested one, else the first. */
function withOneDefault(list: TaxAddress[], preferId?: string): TaxAddress[] {
  if (list.length === 0) return list;
  const defaultId = preferId ?? list.find((address) => address.isDefault)?.id ?? list[0].id;
  return list.map((address) => ({ ...address, isDefault: address.id === defaultId }));
}

async function demoWrite(update: (list: TaxAddress[]) => { list: TaxAddress[]; preferId?: string }): Promise<TaxAddressListResult> {
  await mockDelay(400);
  const { list, preferId } = update(readDemoList());
  const next = withOneDefault(list, preferId);
  try {
    localStorage.setItem(demoStorageKey(), JSON.stringify(next));
  } catch {
    throw new Error('บันทึกที่อยู่ไม่สำเร็จ เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูล');
  }
  return { addresses: next, source: 'demo' };
}

const live = async (request: Promise<TaxAddress[]>): Promise<TaxAddressListResult> => ({ addresses: await request, source: 'live' });

export function getTaxAddresses(): Promise<TaxAddressListResult> {
  return withMockFallback<TaxAddressListResult>(
    'GET /account/tax-addresses',
    () => live(apiGet<TaxAddress[]>('/account/tax-addresses')),
    async () => {
      await mockDelay();
      return { addresses: withOneDefault(readDemoList()), source: 'demo' };
    },
  );
}

export function createTaxAddress(input: TaxAddressInput): Promise<TaxAddressListResult> {
  return withMockFallback<TaxAddressListResult>(
    'POST /account/tax-addresses',
    () => live(apiPost<TaxAddress[]>('/account/tax-addresses', input)),
    () =>
      demoWrite((list) => {
        const id = `tax-${Date.now().toString(36)}`;
        return { list: [...list, { ...input, id }], preferId: input.isDefault ? id : undefined };
      }),
  );
}

export function updateTaxAddress(id: string, input: TaxAddressInput): Promise<TaxAddressListResult> {
  return withMockFallback<TaxAddressListResult>(
    'PUT /account/tax-addresses/:id',
    () => live(apiPut<TaxAddress[]>(`/account/tax-addresses/${encodeURIComponent(id)}`, input)),
    () =>
      demoWrite((list) => ({
        // Un-ticking "default" on the current default doesn't leave the list without one.
        list: list.map((address) => (address.id === id ? { ...address, ...input, isDefault: address.isDefault } : address)),
        preferId: input.isDefault ? id : undefined,
      })),
  );
}

export function setDefaultTaxAddress(id: string): Promise<TaxAddressListResult> {
  return withMockFallback<TaxAddressListResult>(
    'PUT /account/tax-addresses/:id/default',
    () => live(apiPut<TaxAddress[]>(`/account/tax-addresses/${encodeURIComponent(id)}/default`)),
    () => demoWrite((list) => ({ list, preferId: id })),
  );
}

export function deleteTaxAddress(id: string): Promise<TaxAddressListResult> {
  return withMockFallback<TaxAddressListResult>(
    'DELETE /account/tax-addresses/:id',
    () => live(apiDelete<TaxAddress[]>(`/account/tax-addresses/${encodeURIComponent(id)}`)),
    // Deleting the default hands it to the first remaining address (withOneDefault).
    () => demoWrite((list) => ({ list: list.filter((address) => address.id !== id) })),
  );
}
