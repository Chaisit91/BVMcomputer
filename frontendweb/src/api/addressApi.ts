import { loadSession } from './authSession';
import { apiDelete, apiGet, apiPost, apiPut, mockDelay, withMockFallback } from './request';
import type { AccountDataSource, SavedAddress, SavedAddressInput } from '../types/api';

/*
 * Shipping-address endpoints (all require the signed-in customer's session/token).
 * Every write returns the customer's full, updated list, so the server stays the one place
 * that enforces "exactly one default address":
 *
 *   GET    /account/addresses                 -> SavedAddress[]
 *   POST   /account/addresses                 -> SavedAddress[]   body: SavedAddressInput
 *   PUT    /account/addresses/:id             -> SavedAddress[]   body: SavedAddressInput
 *   PUT    /account/addresses/:id/default     -> SavedAddress[]
 *   DELETE /account/addresses/:id             -> SavedAddress[]
 *
 * When the backend can't be reached (API_MODE auto/mock) the list is kept in this browser's
 * localStorage, per signed-in user, and every result is flagged source 'demo'.
 */

export interface AddressListResult {
  addresses: SavedAddress[];
  source: AccountDataSource;
}

function demoStorageKey(): string {
  return `maxcom.addresses.${loadSession()?.user.id ?? 'guest'}`;
}

function readDemoList(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(demoStorageKey());
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedAddress[]) : [];
  } catch {
    return [];
  }
}

/** Same rule the backend applies: if the list has addresses but no default, the first one becomes it. */
function withOneDefault(list: SavedAddress[], preferId?: string): SavedAddress[] {
  if (list.length === 0) return list;
  const defaultId = preferId ?? list.find((address) => address.isDefault)?.id ?? list[0].id;
  return list.map((address) => ({ ...address, isDefault: address.id === defaultId }));
}

async function demoWrite(update: (list: SavedAddress[]) => { list: SavedAddress[]; preferId?: string }): Promise<AddressListResult> {
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

const live = async (request: Promise<SavedAddress[]>): Promise<AddressListResult> => ({ addresses: await request, source: 'live' });

export function getAddresses(): Promise<AddressListResult> {
  return withMockFallback<AddressListResult>(
    'GET /account/addresses',
    () => live(apiGet<SavedAddress[]>('/account/addresses')),
    async () => {
      await mockDelay();
      return { addresses: withOneDefault(readDemoList()), source: 'demo' };
    },
  );
}

export function createAddress(input: SavedAddressInput): Promise<AddressListResult> {
  return withMockFallback<AddressListResult>(
    'POST /account/addresses',
    () => live(apiPost<SavedAddress[]>('/account/addresses', input)),
    () =>
      demoWrite((list) => {
        const id = `addr-${Date.now().toString(36)}`;
        // The first address is always the default; later ones only when asked.
        return { list: [...list, { ...input, id, isDefault: false }], preferId: input.isDefault || list.length === 0 ? id : undefined };
      }),
  );
}

export function updateAddress(id: string, input: SavedAddressInput): Promise<AddressListResult> {
  return withMockFallback<AddressListResult>(
    'PUT /account/addresses/:id',
    () => live(apiPut<SavedAddress[]>(`/account/addresses/${encodeURIComponent(id)}`, input)),
    () =>
      demoWrite((list) => ({
        // Un-ticking "default" on the current default doesn't leave the list without one.
        list: list.map((address) => (address.id === id ? { ...address, ...input, isDefault: address.isDefault } : address)),
        preferId: input.isDefault ? id : undefined,
      })),
  );
}

export function setDefaultAddress(id: string): Promise<AddressListResult> {
  return withMockFallback<AddressListResult>(
    'PUT /account/addresses/:id/default',
    () => live(apiPut<SavedAddress[]>(`/account/addresses/${encodeURIComponent(id)}/default`)),
    () => demoWrite((list) => ({ list, preferId: id })),
  );
}

export function deleteAddress(id: string): Promise<AddressListResult> {
  return withMockFallback<AddressListResult>(
    'DELETE /account/addresses/:id',
    () => live(apiDelete<SavedAddress[]>(`/account/addresses/${encodeURIComponent(id)}`)),
    // Deleting the default hands it to the first remaining address (withOneDefault).
    () => demoWrite((list) => ({ list: list.filter((address) => address.id !== id) })),
  );
}
