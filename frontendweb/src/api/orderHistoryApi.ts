import { apiGet, mockDelay, withMockFallback } from './request';
import { ApiError } from './apiError';
import type { AccountDataSource, OrderDetail, OrderSummary } from '../types/api';

/*
 * Order-history endpoints (require the signed-in customer's session/token):
 *
 *   GET /account/orders        -> OrderSummary[]   newest first
 *   GET /account/orders/:id    -> OrderDetail      404 when the order isn't this customer's
 *
 * When the backend can't be reached (API_MODE auto/mock) a fixed set of sample orders is shown,
 * flagged source 'demo'. Nothing in it comes from the customer's account.
 */

export interface OrderListResult {
  orders: OrderSummary[];
  source: AccountDataSource;
}

export interface OrderDetailResult {
  order: OrderDetail;
  source: AccountDataSource;
}

// TODO(backend): sample orders for UI work only — remove once GET /account/orders is live.
const DEMO_ORDERS: OrderDetail[] = [
  {
    id: 'ORD-20261114-089',
    orderNumber: 'ORD-20261114-089',
    placedAt: '2026-11-13T14:32:00+07:00',
    status: 'shipping',
    items: [
      { name: 'Intel Core i7-14700K', quantity: 1, unitPrice: 14990 },
      { name: 'CORSAIR VENGEANCE RGB 32GB (16GBx2) DDR5 6000MHz', quantity: 1, unitPrice: 4590 },
    ],
    subtotal: 19580,
    shippingFee: 0,
    discount: 0,
    total: 19580,
    carrier: { name: 'Flash Express', phone: '1436' },
    trackingNumber: 'TH0123456789A',
    trackingEvents: [
      { step: 'picked_up', at: '2026-11-13T15:20:00+07:00' },
      { step: 'in_transit', at: '2026-11-13T21:40:00+07:00' },
      { step: 'out_for_delivery', at: '2026-11-14T09:30:00+07:00' },
    ],
    trackingUpdates: [
      { at: '2026-11-14T09:30:00+07:00', description: 'พนักงานกำลังนำส่งพัสดุให้คุณ', location: 'สาขาปลายทาง กรุงเทพมหานคร' },
      { at: '2026-11-14T06:15:00+07:00', description: 'พัสดุถึงสาขาปลายทางเรียบร้อยแล้ว เตรียมนำจ่าย', location: 'สาขาปลายทาง กรุงเทพมหานคร' },
      { at: '2026-11-13T21:40:00+07:00', description: 'พัสดุออกจากศูนย์คัดแยกสินค้า', location: 'ศูนย์คัดแยกสินค้า' },
      { at: '2026-11-13T15:20:00+07:00', description: 'บริษัทขนส่งเข้ารับพัสดุจากผู้ส่งเรียบร้อยแล้ว', location: 'สาขาต้นทาง' },
    ],
    estimatedDeliveryBy: '2026-11-14T18:00:00+07:00',
    shippingAddress: {
      recipientName: 'ผู้รับตัวอย่าง',
      phone: '08X-XXX-XXXX',
      address: 'ที่อยู่ตัวอย่าง แขวง/ตำบล เขต/อำเภอ กรุงเทพมหานคร 10XXX',
    },
  },
  {
    id: 'ORD-20261110-042',
    orderNumber: 'ORD-20261110-042',
    placedAt: '2026-11-10T10:15:00+07:00',
    status: 'delivered',
    items: [{ name: 'Cooler Master Hyper 212 Air Cooler', quantity: 1, unitPrice: 990 }],
    subtotal: 990,
    shippingFee: 0,
    discount: 0,
    total: 990,
    carrier: { name: 'Flash Express', phone: '1436' },
    trackingNumber: 'TH0123456700B',
    trackingEvents: [
      { step: 'picked_up', at: '2026-11-10T15:40:00+07:00' },
      { step: 'in_transit', at: '2026-11-11T08:30:00+07:00' },
      { step: 'out_for_delivery', at: '2026-11-12T09:05:00+07:00' },
      { step: 'delivered', at: '2026-11-12T13:10:00+07:00' },
    ],
    trackingUpdates: [
      { at: '2026-11-12T13:10:00+07:00', description: 'ผู้รับได้รับพัสดุเรียบร้อยแล้ว', location: 'สาขาปลายทาง กรุงเทพมหานคร' },
      { at: '2026-11-12T09:05:00+07:00', description: 'พนักงานกำลังนำส่งพัสดุให้คุณ', location: 'สาขาปลายทาง กรุงเทพมหานคร' },
      { at: '2026-11-11T08:30:00+07:00', description: 'พัสดุออกจากศูนย์คัดแยกสินค้า', location: 'ศูนย์คัดแยกสินค้า' },
      { at: '2026-11-10T15:40:00+07:00', description: 'บริษัทขนส่งเข้ารับพัสดุจากผู้ส่งเรียบร้อยแล้ว', location: 'สาขาต้นทาง' },
    ],
    estimatedDeliveryBy: null,
    shippingAddress: {
      recipientName: 'ผู้รับตัวอย่าง',
      phone: '08X-XXX-XXXX',
      address: 'ที่อยู่ตัวอย่าง แขวง/ตำบล เขต/อำเภอ กรุงเทพมหานคร 10XXX',
    },
  },
];

const toSummary = ({ id, orderNumber, placedAt, status, items, total }: OrderDetail): OrderSummary => ({
  id,
  orderNumber,
  placedAt,
  status,
  items,
  total,
});

export function getOrders(): Promise<OrderListResult> {
  return withMockFallback<OrderListResult>(
    'GET /account/orders',
    async () => ({ orders: await apiGet<OrderSummary[]>('/account/orders'), source: 'live' }),
    async () => {
      await mockDelay();
      return { orders: DEMO_ORDERS.map(toSummary), source: 'demo' };
    },
  );
}

export function getOrder(id: string): Promise<OrderDetailResult> {
  return withMockFallback<OrderDetailResult>(
    'GET /account/orders/:id',
    async () => ({ order: await apiGet<OrderDetail>(`/account/orders/${encodeURIComponent(id)}`), source: 'live' }),
    async () => {
      await mockDelay();
      const order = DEMO_ORDERS.find((o) => o.id === id);
      if (!order) throw new ApiError('ไม่พบคำสั่งซื้อนี้', 404, false);
      return { order, source: 'demo' };
    },
  );
}
