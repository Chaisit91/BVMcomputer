import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import type { CustomerFormValues } from '../schemas/customer.schema'
import type { Customer, CustomerOrder, CustomerStatus } from '../types/customer'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// findMany doesn't include orders (list page has no use for them); findById
// does, nested as Order -> OrderLineItem. unitPrice is a Decimal, serialized
// as a string, and there's no precomputed order total — sum it from items.
function mapOrderFromApi(raw: any): CustomerOrder {
  const items = (raw.items ?? []).map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    price: Number(item.unitPrice),
  }))
  return {
    id: raw.id,
    orderCode: raw.orderCode,
    orderedAt: raw.orderedAt,
    totalAmount: items.reduce((sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price, 0),
    status: raw.status,
    items,
  }
}

function mapCustomerFromApi(raw: any): Customer {
  return {
    id: raw.id,
    customerCode: raw.customerCode,
    fullName: raw.fullName,
    username: raw.username,
    email: raw.email,
    phone: raw.phone,
    registeredAt: raw.registeredAt,
    lastActiveAt: raw.lastActiveAt,
    status: raw.status,
    shippingAddress: raw.shippingAddress,
    note: raw.note,
    recentOrders: (raw.orders ?? []).map(mapOrderFromApi),
  }
}

const mockOrder = (id: string, orderCode: string, orderedAt: string, status: CustomerOrder['status'], items: CustomerOrder['items']): CustomerOrder => ({
  id,
  orderCode,
  orderedAt,
  status,
  items,
  totalAmount: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
})

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'mock-cust-1', customerCode: 'CUS-0001', fullName: 'สมชาย ใจดี', username: 'somchai_j', email: 'somchai@example.com',
    phone: '081-234-5678', registeredAt: '2026-01-15T10:00:00.000Z', lastActiveAt: '2026-09-13T14:20:00.000Z', status: 'active',
    shippingAddress: '99/1 ถ.สุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110', note: 'ลูกค้าประจำ สั่งซื้อบ่อย',
    recentOrders: [
      mockOrder('mock-ord-1', 'ORD-2026091001', '2026-09-10T09:00:00.000Z', 'completed', [{ name: 'RTX 4070 Ti SUPER', quantity: 1, price: 32900 }]),
      mockOrder('mock-ord-2', 'ORD-2026082005', '2026-08-20T09:00:00.000Z', 'completed', [{ name: 'DDR5 32GB 6000MHz', quantity: 2, price: 3900 }]),
    ],
  },
  {
    id: 'mock-cust-2', customerCode: 'CUS-0002', fullName: 'สุนีย์ พงษ์ไพร', username: 'sunee_p', email: 'sunee@example.com',
    phone: '089-876-5432', registeredAt: '2026-03-02T10:00:00.000Z', lastActiveAt: '2026-09-12T11:00:00.000Z', status: 'active',
    shippingAddress: '22 หมู่ 4 ต.บางพลี อ.บางพลี จ.สมุทรปราการ 10540', note: '',
    recentOrders: [mockOrder('mock-ord-3', 'ORD-2026091002', '2026-09-11T13:00:00.000Z', 'shipping', [{ name: 'Custom Build ชุดเกมมิ่ง', quantity: 1, price: 45900 }])],
  },
  {
    id: 'mock-cust-3', customerCode: 'CUS-0003', fullName: 'ธนากร วงศ์สกุล', username: 'thanakorn_w', email: 'thanakorn@example.com',
    phone: '062-111-2233', registeredAt: '2026-05-20T10:00:00.000Z', lastActiveAt: '2026-08-30T09:00:00.000Z', status: 'inactive',
    shippingAddress: '5 ซ.ลาดพร้าว 101 แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ 10240', note: 'ไม่ได้ใช้งานนาน',
    recentOrders: [],
  },
  {
    id: 'mock-cust-4', customerCode: 'CUS-0004', fullName: 'วรรณา ศรีสุข', username: 'wanna_s', email: 'wanna@example.com',
    phone: '095-444-7788', registeredAt: '2026-02-10T10:00:00.000Z', lastActiveAt: '2026-09-14T08:00:00.000Z', status: 'active',
    shippingAddress: '18/3 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310', note: 'สั่งของแรงระดับสูงเสมอ',
    recentOrders: [mockOrder('mock-ord-4', 'ORD-2026090804', '2026-09-08T10:00:00.000Z', 'completed', [{ name: 'RTX 4090 24GB', quantity: 1, price: 62900 }, { name: 'AMD Ryzen 9 7950X', quantity: 1, price: 19900 }])],
  },
  {
    id: 'mock-cust-5', customerCode: 'CUS-0005', fullName: 'ประเสริฐ บุญมี', username: 'prasert_b', email: 'prasert@example.com',
    phone: '086-555-9900', registeredAt: '2026-06-01T10:00:00.000Z', lastActiveAt: '2026-07-15T09:00:00.000Z', status: 'suspended',
    shippingAddress: '77 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400', note: 'ระงับเนื่องจากมีข้อพิพาทการชำระเงิน',
    recentOrders: [mockOrder('mock-ord-5', 'ORD-2026070705', '2026-07-07T10:00:00.000Z', 'cancelled', [{ name: 'Intel Core i3-14100', quantity: 1, price: 3900 }])],
  },
]

export function getCustomers(): Promise<Customer[]> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_CUSTOMERS)
  return api.get('/customers').then((res) => res.data.map(mapCustomerFromApi))
}

export function getCustomerDetail(id: string): Promise<Customer | null> {
  if (USE_MOCK_DATA) return mockDelay(MOCK_CUSTOMERS.find((item) => item.id === id) ?? null)
  return api
    .get(`/customers/${id}`)
    .then((res) => mapCustomerFromApi(res.data))
    .catch(() => null)
}

export function saveCustomer(id: string, data: CustomerFormValues): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/customers/${id}`, data).then(() => undefined)
}

export function createCustomer(data: CustomerFormValues): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `mock-cust-${Date.now()}` })
  return api.post('/customers', data).then((res) => ({ id: res.data.id }))
}

export function updateCustomerStatus(id: string, status: CustomerStatus): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/customers/${id}`, { status }).then(() => undefined)
}
