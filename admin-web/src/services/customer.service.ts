import type { CustomerFormValues } from '../schemas/customer.schema'
import type { Customer, CustomerStatus, CustomerSummary } from '../types/customer'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const customers: Customer[] = [
  {
    id: '1',
    customerCode: 'CUS-0001',
    fullName: 'สมชาย รักดี',
    username: 'somchai_r',
    email: 'somchai@email.com',
    phone: '081-234-5678',
    registeredAt: '15 ม.ค. 2566',
    lastActiveAt: '24 ต.ค. 2566',
    status: 'active',
    shippingAddress: '123/45 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10110',
    note: '',
    recentOrders: [
      {
        id: '1',
        orderCode: 'ORD-9921',
        orderedAt: '24 ต.ค. 2566, 15:30',
        totalAmount: 32450,
        status: 'กำลังเตรียมสินค้า',
        items: [
          { name: 'การ์ดจอ RTX 4070', quantity: 1, price: 28500 },
          { name: 'พัดลมเคส RGB', quantity: 2, price: 1975 },
        ],
      },
      {
        id: '2',
        orderCode: 'ORD-9840',
        orderedAt: '10 ต.ค. 2566, 11:20',
        totalAmount: 8900,
        status: 'จัดส่งสำเร็จแล้ว',
        items: [
          { name: 'เมาส์เกมมิ่งไร้สาย', quantity: 1, price: 2900 },
          { name: 'คีย์บอร์ดเกมมิ่ง', quantity: 1, price: 6000 },
        ],
      },
      {
        id: '3',
        orderCode: 'ORD-9701',
        orderedAt: '28 ก.ย. 2566, 09:15',
        totalAmount: 15400,
        status: 'จัดส่งสำเร็จแล้ว',
        items: [
          { name: 'จอมอนิเตอร์ 27 นิ้ว 165Hz', quantity: 1, price: 9900 },
          { name: 'คีย์บอร์ดกลไกไร้สาย', quantity: 1, price: 2500 },
          { name: 'เมาส์เกมมิ่ง', quantity: 1, price: 3000 },
        ],
      },
    ],
  },
  {
    id: '2',
    customerCode: 'CUS-0002',
    fullName: 'วิภาวรรณ สุขใจ',
    username: 'wipawan_s',
    email: 'wipawan@email.com',
    phone: '089-876-5432',
    registeredAt: '3 มี.ค. 2566',
    lastActiveAt: '20 ต.ค. 2566',
    status: 'active',
    shippingAddress: '99 ถนนพระราม 4 แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110',
    note: '',
    recentOrders: [],
  },
  {
    id: '3',
    customerCode: 'CUS-0003',
    fullName: 'อนันต์ ดอนเมือง',
    username: 'anant_d',
    email: 'anant@email.com',
    phone: '062-111-2233',
    registeredAt: '28 เม.ย. 2566',
    lastActiveAt: '10 ต.ค. 2566',
    status: 'inactive',
    shippingAddress: '55 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900',
    note: '',
    recentOrders: [],
  },
  {
    id: '4',
    customerCode: 'CUS-0004',
    fullName: 'พิมพ์ใจ แสงทอง',
    username: 'pimjai_s',
    email: 'pimjai@email.com',
    phone: '095-444-5566',
    registeredAt: '12 มิ.ย. 2566',
    lastActiveAt: '5 ก.ย. 2566',
    status: 'active',
    shippingAddress: '8 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    note: '',
    recentOrders: [],
  },
  {
    id: '5',
    customerCode: 'CUS-0005',
    fullName: 'ธนพล เจริญสุข',
    username: 'thanapol_c',
    email: 'thanapol@email.com',
    phone: '083-999-8877',
    registeredAt: '1 ส.ค. 2566',
    lastActiveAt: '22 ต.ค. 2566',
    status: 'suspended',
    shippingAddress: '210 ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร 10900',
    note: 'ลูกค้าถูกระงับชั่วคราวจากการยกเลิกคำสั่งซื้อบ่อยครั้ง',
    recentOrders: [],
  },
]

export function getCustomerSummary(): Promise<CustomerSummary> {
  return mockDelay({ totalUsers: 1247, activeCount: 1089, inactiveCount: 134, suspendedCount: 24 })
}

export function getCustomers(): Promise<Customer[]> {
  return mockDelay(customers)
}

export function getCustomerDetail(id: string): Promise<Customer | null> {
  return mockDelay(customers.find((item) => item.id === id) ?? null)
}

export function saveCustomer(_id: string, _data: CustomerFormValues): Promise<void> {
  return mockDelay(undefined)
}

export function createCustomer(_data: CustomerFormValues): Promise<{ id: string }> {
  return mockDelay({ id: String(customers.length + 1) })
}

export function updateCustomerStatus(_id: string, _status: CustomerStatus): Promise<void> {
  return mockDelay(undefined)
}
