import { api } from '../lib/api'
import type { CustomerFormValues } from '../schemas/customer.schema'
import type { Customer, CustomerOrder, CustomerStatus } from '../types/customer'

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

export function getCustomers(): Promise<Customer[]> {
  return api.get('/customers').then((res) => res.data.map(mapCustomerFromApi))
}

export function getCustomerDetail(id: string): Promise<Customer | null> {
  return api
    .get(`/customers/${id}`)
    .then((res) => mapCustomerFromApi(res.data))
    .catch(() => null)
}

export function saveCustomer(id: string, data: CustomerFormValues): Promise<void> {
  return api.put(`/customers/${id}`, data).then(() => undefined)
}

export function createCustomer(data: CustomerFormValues): Promise<{ id: string }> {
  return api.post('/customers', data).then((res) => ({ id: res.data.id }))
}

export function updateCustomerStatus(id: string, status: CustomerStatus): Promise<void> {
  return api.put(`/customers/${id}`, { status }).then(() => undefined)
}
