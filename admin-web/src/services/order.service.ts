import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { OrderFormValues } from '../schemas/order.schema'
import type { Order, OrderLineItem } from '../types/order'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Backend keeps items nested (OrderLineItem[] relation) and the fulfillment
// field is named `status` in Prisma — map both to the frontend's flatter,
// renamed shape. unitPrice comes back as a Decimal, serialized as a string.
function mapOrderFromApi(raw: any): Order {
  return {
    id: raw.id,
    orderCode: raw.orderCode,
    orderedAt: raw.orderedAt,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    shippingAddress: raw.shippingAddress,
    postalCode: raw.postalCode,
    province: raw.province,
    district: raw.district,
    subdistrict: raw.subdistrict,
    paymentMethod: raw.paymentMethod,
    paymentStatus: raw.paymentStatus,
    orderStatus: raw.status,
    trackingNumber: raw.trackingNumber ?? '',
    shippingNote: raw.shippingNote ?? '',
    paymentSlipFilename: raw.paymentSlipFilename ?? '',
    paymentSlipUploadedAt: raw.paymentSlipUploadedAt ?? '',
    items: (raw.items ?? []).map(
      (item: any): OrderLineItem => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      }),
    ),
  }
}

export function getOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

const mockOrder = (overrides: Partial<Order> & Pick<Order, 'id' | 'orderCode' | 'orderedAt' | 'customerName' | 'orderStatus' | 'paymentStatus' | 'items'>): Order => ({
  customerPhone: '081-234-5678',
  shippingAddress: '99/1 ถ.สุขุมวิท',
  postalCode: '10110',
  province: 'กรุงเทพมหานคร',
  district: 'คลองเตย',
  subdistrict: 'คลองตัน',
  paymentMethod: 'โอนเงินผ่านธนาคาร',
  trackingNumber: '',
  shippingNote: '',
  paymentSlipFilename: '',
  paymentSlipUploadedAt: '',
  ...overrides,
})

const MOCK_ORDERS: Order[] = [
  mockOrder({ id: 'mock-order-1', orderCode: 'ORD-2026091001', orderedAt: '2026-09-10T09:00:00.000Z', customerName: 'สมชาย ใจดี', orderStatus: 'completed', paymentStatus: 'paid', trackingNumber: 'TH1234567890', items: [{ name: 'RTX 4070 Ti SUPER 16GB', category: 'gpu', quantity: 1, unitPrice: 32900 }] }),
  mockOrder({ id: 'mock-order-2', orderCode: 'ORD-2026091002', orderedAt: '2026-09-11T13:00:00.000Z', customerName: 'สุนีย์ พงษ์ไพร', orderStatus: 'shipping', paymentStatus: 'paid', trackingNumber: 'TH0987654321', items: [{ name: 'Custom Build ชุดเกมมิ่ง', category: 'custom_build', quantity: 1, unitPrice: 45900 }] }),
  mockOrder({ id: 'mock-order-3', orderCode: 'ORD-2026091203', orderedAt: '2026-09-12T10:00:00.000Z', customerName: 'ธนากร วงศ์สกุล', orderStatus: 'preparing', paymentStatus: 'paid', items: [{ name: 'AMD Ryzen 5 7600', category: 'cpu', quantity: 1, unitPrice: 7900 }, { name: 'DDR5 16GB 5600MHz', category: 'ram', quantity: 2, unitPrice: 2400 }] }),
  mockOrder({ id: 'mock-order-4', orderCode: 'ORD-2026091304', orderedAt: '2026-09-13T11:00:00.000Z', customerName: 'วรรณา ศรีสุข', orderStatus: 'pending', paymentStatus: 'pending', paymentSlipFilename: 'slip-2026091304.jpg', paymentSlipUploadedAt: '2026-09-13T11:05:00.000Z', items: [{ name: 'RTX 4090 24GB', category: 'gpu', quantity: 1, unitPrice: 62900 }] }),
  mockOrder({ id: 'mock-order-5', orderCode: 'ORD-2026090705', orderedAt: '2026-09-07T09:00:00.000Z', customerName: 'ประเสริฐ บุญมี', orderStatus: 'cancelled', paymentStatus: 'refunded', items: [{ name: 'Intel Core i3-14100', category: 'cpu', quantity: 1, unitPrice: 3900 }] }),
  mockOrder({ id: 'mock-order-6', orderCode: 'ORD-2026091406', orderedAt: '2026-09-14T08:00:00.000Z', customerName: 'กมลชนก อินทร์แก้ว', orderStatus: 'pending', paymentStatus: 'failed', items: [{ name: 'AMD Ryzen 7 7800X3D', category: 'cpu', quantity: 1, unitPrice: 11900 }] }),
]

export function getOrders(): Promise<Order[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_ORDERS)
  return api.get('/orders').then((res) => res.data.map(mapOrderFromApi))
}

export function getOrderDetail(id: string): Promise<Order | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_ORDERS.find((item) => item.id === id) ?? null)
  return api
    .get(`/orders/${id}`)
    .then((res) => mapOrderFromApi(res.data))
    .catch(() => null)
}

export function saveOrder(id: string, data: OrderFormValues & { items: OrderLineItem[] }): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  const { orderStatus, items, ...rest } = data
  return api.put(`/orders/${id}`, { ...rest, status: orderStatus, items }).then(() => undefined)
}
