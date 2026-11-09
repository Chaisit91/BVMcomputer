import { loadSession } from './authSession';
import { apiDelete, apiGet, apiPost, apiPut, mockDelay, withMockFallback } from './request';
import type { CardToken } from '../services/payment/cardTokenizer';
import type { AccountDataSource, AddPaymentMethodRequest, PaymentMethod } from '../types/api';

/*
 * Saved-card endpoints (all require the signed-in customer's session/token). The backend only ever
 * receives a payment-gateway token — never a card number or CVV. Every write returns the full list:
 *
 *   GET    /account/payment-methods                -> PaymentMethod[]
 *   POST   /account/payment-methods                -> PaymentMethod[]   body: AddPaymentMethodRequest
 *   PUT    /account/payment-methods/:id/default    -> PaymentMethod[]
 *   DELETE /account/payment-methods/:id            -> PaymentMethod[]
 *
 * When the backend can't be reached (API_MODE auto/mock) the list is kept in this browser's
 * localStorage, per signed-in user, flagged source 'demo' — and holds the same safe fields only.
 */

export interface PaymentMethodListResult {
  methods: PaymentMethod[];
  source: AccountDataSource;
}

function demoStorageKey(): string {
  return `maxcom.payment-methods.${loadSession()?.user.id ?? 'guest'}`;
}

function readDemoList(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(demoStorageKey());
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PaymentMethod[]) : [];
  } catch {
    return [];
  }
}

/** Same rule the backend applies: one default — the requested one, else the current one, else the first. */
function withOneDefault(list: PaymentMethod[], preferId?: string): PaymentMethod[] {
  if (list.length === 0) return list;
  const defaultId = preferId ?? list.find((method) => method.isDefault)?.id ?? list[0].id;
  return list.map((method) => ({ ...method, isDefault: method.id === defaultId }));
}

async function demoWrite(update: (list: PaymentMethod[]) => { list: PaymentMethod[]; preferId?: string }): Promise<PaymentMethodListResult> {
  await mockDelay(400);
  const { list, preferId } = update(readDemoList());
  const next = withOneDefault(list, preferId);
  try {
    localStorage.setItem(demoStorageKey(), JSON.stringify(next));
  } catch {
    throw new Error('บันทึกบัตรไม่สำเร็จ เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูล');
  }
  return { methods: next, source: 'demo' };
}

const live = async (request: Promise<PaymentMethod[]>): Promise<PaymentMethodListResult> => ({ methods: await request, source: 'live' });

export function getPaymentMethods(): Promise<PaymentMethodListResult> {
  return withMockFallback<PaymentMethodListResult>(
    'GET /account/payment-methods',
    () => live(apiGet<PaymentMethod[]>('/account/payment-methods')),
    async () => {
      await mockDelay();
      return { methods: withOneDefault(readDemoList()), source: 'demo' };
    },
  );
}

/** `card` carries the token's safe display fields, used only by the demo store (the backend reads them from the gateway). */
export function addPaymentMethod(request: AddPaymentMethodRequest, card: Omit<CardToken, 'token'>): Promise<PaymentMethodListResult> {
  return withMockFallback<PaymentMethodListResult>(
    'POST /account/payment-methods',
    () => live(apiPost<PaymentMethod[]>('/account/payment-methods', request)),
    () =>
      demoWrite((list) => {
        const id = `pm-${Date.now().toString(36)}`;
        const { issuerBank, ...display } = card;
        const method: PaymentMethod = { id, ...display, bankName: issuerBank, isDefault: false };
        return { list: [...list, method], preferId: request.makeDefault ? id : undefined };
      }),
  );
}

export function setDefaultPaymentMethod(id: string): Promise<PaymentMethodListResult> {
  return withMockFallback<PaymentMethodListResult>(
    'PUT /account/payment-methods/:id/default',
    () => live(apiPut<PaymentMethod[]>(`/account/payment-methods/${encodeURIComponent(id)}/default`)),
    () => demoWrite((list) => ({ list, preferId: id })),
  );
}

export function deletePaymentMethod(id: string): Promise<PaymentMethodListResult> {
  return withMockFallback<PaymentMethodListResult>(
    'DELETE /account/payment-methods/:id',
    () => live(apiDelete<PaymentMethod[]>(`/account/payment-methods/${encodeURIComponent(id)}`)),
    // Deleting the default hands it to the first remaining card (withOneDefault).
    () => demoWrite((list) => ({ list: list.filter((method) => method.id !== id) })),
  );
}
