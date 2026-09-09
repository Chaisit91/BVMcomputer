import { api } from '../lib/api'
import type { OrderFormValues } from '../schemas/order.schema'
import type { Order, OrderLineItem } from '../types/order'

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

export function getOrders(): Promise<Order[]> {
  return api.get('/orders').then((res) => res.data.map(mapOrderFromApi))
}

export function getOrderDetail(id: string): Promise<Order | null> {
  return api
    .get(`/orders/${id}`)
    .then((res) => mapOrderFromApi(res.data))
    .catch(() => null)
}

export function saveOrder(id: string, data: OrderFormValues & { items: OrderLineItem[] }): Promise<void> {
  const { orderStatus, items, ...rest } = data
  return api.put(`/orders/${id}`, { ...rest, status: orderStatus, items }).then(() => undefined)
}
